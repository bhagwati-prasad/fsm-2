/**
 * Input Form
 * Collects initial inputs for simulation
 */

import { Logger } from '../../utils/logger';

export class InputForm {
  /**
   * Create a new input form
   * @param {HTMLElement} container - Container element
   * @param {SimulationEngine} engine - Simulation engine
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, engine, eventBus) {
    this.logger = new Logger('InputForm');
    this.container = container;
    this.engine = engine;
    this.eventBus = eventBus;
    this.inputs = new Map();
    this.init();
  }

  /**
   * Initialize form
   * @private
   */
  init() {
    this.createFormUI();
    this.populateInputs();
  }

  /**
   * Create form UI
   * @private
   */
  createFormUI() {
    const form = document.createElement('div');
    form.className = 'input-form';
    form.innerHTML = `
      <div class="form-header">
        <h3>Initial Inputs</h3>
      </div>
      <div class="form-fields"></div>
      <div class="form-actions">
        <button class="btn-start">Start Simulation</button>
        <button class="btn-reset">Reset</button>
      </div>
    `;
    this.container.appendChild(form);
    this.formElement = form;
    this.fieldsContainer = form.querySelector('.form-fields');
    this.startButton = form.querySelector('.btn-start');
    this.resetButton = form.querySelector('.btn-reset');

    this.startButton.addEventListener('click', () => this.handleStart());
    this.resetButton.addEventListener('click', () => this.handleReset());
  }

  /**
   * Populate input fields
   * @private
   */
  populateInputs() {
    const entryPoints = this.engine.graph.getComponents().filter((c) => c.inputPorts.length === 0);

    if (entryPoints.length === 0) {
      this.fieldsContainer.innerHTML = '<p class="no-inputs">No entry points found</p>';
      return;
    }

    entryPoints.forEach((component) => {
      const field = document.createElement('div');
      field.className = 'form-field';
      field.innerHTML = `
        <label>${component.name}</label>
        <input type="text" class="input-field" data-component-id="${component.id}" placeholder="Enter value">
      `;
      this.fieldsContainer.appendChild(field);
    });
  }

  /**
   * Get form inputs
   * @returns {Object} - Input values
   */
  getInputs() {
    const inputs = {};
    const fields = this.fieldsContainer.querySelectorAll('.input-field');

    fields.forEach((field) => {
      const componentId = field.getAttribute('data-component-id');
      const value = field.value || '';
      inputs[componentId] = value;
    });

    return inputs;
  }

  /**
   * Handle start button
   * @private
   */
  handleStart() {
    this.eventBus.emit({
      urn: 'ui://input-form',
      type: 'ui:simulation-start-requested',
      timestamp: new Date().toISOString(),
      payload: { inputs: this.getInputs() }
    });
  }

  /**
   * Handle reset button
   * @private
   */
  handleReset() {
    const fields = this.fieldsContainer.querySelectorAll('.input-field');
    fields.forEach((field) => {
      field.value = '';
    });
  }
}
