/**
 * Stochastic Configuration UI
 * User interface for stochastic configuration
 */

import { Logger } from '../../utils/logger';
import { Modal } from '../../ui-components/modal';

export class StochasticConfigUI {
  /**
   * Create a new stochastic config UI
   * @param {HTMLElement} container - Container element
   * @param {StochasticConfig} stochasticConfig - Stochastic configuration
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, stochasticConfig, graph, eventBus) {
    this.logger = new Logger('StochasticConfigUI');
    this.container = container;
    this.stochasticConfig = stochasticConfig;
    this.graph = graph;
    this.eventBus = eventBus;
    this.init();
  }

  /**
   * Initialize UI
   * @private
   */
  init() {
    this.createUI();
    this.populateComponents();
  }

  /**
   * Create UI
   * @private
   */
  createUI() {
    const ui = document.createElement('div');
    ui.className = 'stochastic-config-ui';
    ui.innerHTML = `
      <div class="config-header">
        <h3>Stochastic Configuration</h3>
      </div>
      <div class="config-content">
        <div class="components-list"></div>
        <div class="distribution-selector"></div>
        <div class="parameter-inputs"></div>
        <div class="actions">
          <button class="btn-save">Save Configuration</button>
          <button class="btn-reset">Reset</button>
        </div>
      </div>
    `;
    this.container.appendChild(ui);
    this.uiElement = ui;
    this.componentsList = ui.querySelector('.components-list');
    this.distributionSelector = ui.querySelector('.distribution-selector');
    this.parameterInputs = ui.querySelector('.parameter-inputs');
    this.saveButton = ui.querySelector('.btn-save');
    this.resetButton = ui.querySelector('.btn-reset');

    this.saveButton.addEventListener('click', () => this.saveConfiguration());
    this.resetButton.addEventListener('click', () => this.resetConfiguration());
  }

  /**
   * Populate components
   * @private
   */
  populateComponents() {
    const components = this.graph.getComponents();
    const html = components
      .map(
        (comp) => `
      <div class="component-item" data-component-id="${comp.id}">
        <span class="component-name">${comp.name}</span>
        <button class="btn-configure">Configure</button>
      </div>
    `
      )
      .join('');

    this.componentsList.innerHTML = html;

    this.componentsList.querySelectorAll('.btn-configure').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const componentId = e.target.closest('.component-item').getAttribute('data-component-id');
        this.configureComponent(componentId);
      });
    });
  }

  /**
   * Configure component
   * @private
   * @param {string} componentId - Component ID
   */
  configureComponent(componentId) {
    const distributions = this.stochasticConfig.getAllDistributions();
    const html = `
      <div class="distribution-list">
        ${distributions
          .map(
            (dist) => `
          <div class="distribution-item" data-distribution="${dist.name}">
            <input type="radio" name="distribution" value="${dist.name}">
            <label>${dist.name}</label>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    this.distributionSelector.innerHTML = html;
    this.currentComponentId = componentId;

    this.distributionSelector.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.showParameterInputs(e.target.value);
      });
    });
  }

  /**
   * Show parameter inputs
   * @private
   * @param {string} distributionName - Distribution name
   */
  showParameterInputs(distributionName) {
    const distribution = this.stochasticConfig.getDistribution(distributionName);
    if (!distribution) return;

    const html = `
      <div class="parameters">
        ${distribution.parameters
          .map(
            (param) => `
          <div class="parameter-input">
            <label>${param}</label>
            <input type="number" class="param-${param}" placeholder="Enter ${param}">
          </div>
        `
          )
          .join('')}
      </div>
    `;

    this.parameterInputs.innerHTML = html;
  }

  /**
   * Save configuration
   * @private
   */
  saveConfiguration() {
    const distributionRadio = this.distributionSelector.querySelector('input[type="radio"]:checked');
    if (!distributionRadio) {
      Modal.alert('Please select a distribution', { title: 'Missing Selection' });
      return;
    }

    const distributionType = distributionRadio.value;
    const distribution = this.stochasticConfig.getDistribution(distributionType);
    const parameters = {};

    distribution.parameters.forEach((param) => {
      const input = this.parameterInputs.querySelector(`.param-${param}`);
      parameters[param] = parseFloat(input.value);
    });

    this.stochasticConfig.configureProperty(
      this.currentComponentId,
      'executionTime',
      distributionType,
      parameters
    );

    this.eventBus.emit({
      urn: 'ui://stochastic-config',
      type: 'ui:stochastic-configured',
      timestamp: new Date().toISOString(),
      payload: {
        componentId: this.currentComponentId,
        distributionType,
        parameters
      }
    });

    Modal.alert('Configuration saved!', { title: 'Saved' });
  }

  /**
   * Reset configuration
   * @private
   */
  resetConfiguration() {
    this.distributionSelector.innerHTML = '';
    this.parameterInputs.innerHTML = '';
  }
}
