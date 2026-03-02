/**
 * Composite Configuration Panel
 * Manages composite component configuration
 */

import { Logger } from '../../../utils/logger';

export class CompositeConfigPanel {
  /**
   * Create a new composite config panel
   * @param {HTMLElement} container - Container element
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, eventBus) {
    this.logger = new Logger('CompositeConfigPanel');
    this.container = container;
    this.eventBus = eventBus;
    this.currentComposite = null;
    this.init();
  }

  /**
   * Initialize panel
   * @private
   */
  init() {
    this.createPanelUI();
    this.setupEventListeners();
  }

  /**
   * Create panel UI
   * @private
   */
  createPanelUI() {
    const panel = document.createElement('div');
    panel.className = 'composite-config-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>Composite Configuration</h3>
        <button class="panel-close">×</button>
      </div>
      <div class="panel-content"></div>
    `;
    this.container.appendChild(panel);
    this.panelElement = panel;
    this.contentElement = panel.querySelector('.panel-content');
    this.closeButton = panel.querySelector('.panel-close');

    this.closeButton.addEventListener('click', () => this.hide());
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('ui:composite-selected', (event) => {
      this.showComposite(event.payload.composite);
    });
  }

  /**
   * Show composite configuration
   * @param {CompositeComponent} composite - Composite component
   */
  showComposite(composite) {
    this.currentComposite = composite;
    this.renderConfiguration(composite);
    this.panelElement.classList.add('visible');
  }

  /**
   * Render configuration
   * @private
   * @param {CompositeComponent} composite - Composite component
   */
  renderConfiguration(composite) {
    const innerComponents = composite.getInnerComponents();
    const exposedPorts = composite.exposedPorts;

    const html = `
      <div class="config-section">
        <h4>Basic Information</h4>
        <div class="config-field">
          <label>Composite ID</label>
          <input type="text" value="${composite.id}" disabled>
        </div>
        <div class="config-field">
          <label>Composite Name</label>
          <input type="text" class="config-name" value="${composite.name}">
        </div>
      </div>

      <div class="config-section">
        <h4>Inner Components (${innerComponents.length})</h4>
        <div class="inner-components-list">
          ${innerComponents
            .map(
              (comp) => `
            <div class="inner-component-item">
              <span class="component-name">${comp.name}</span>
              <span class="component-type">${comp.type}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="config-section">
        <h4>Exposed Ports</h4>
        <div class="exposed-ports">
          <div class="port-group">
            <h5>Input Ports (${exposedPorts.input.length})</h5>
            ${exposedPorts.input
              .map(
                (port) => `
              <div class="port-item">
                <span class="port-name">${port.name}</span>
                <span class="port-source">${port.innerComponentId}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="port-group">
            <h5>Output Ports (${exposedPorts.output.length})</h5>
            ${exposedPorts.output
              .map(
                (port) => `
              <div class="port-item">
                <span class="port-name">${port.name}</span>
                <span class="port-source">${port.innerComponentId}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>

      <div class="config-actions">
        <button class="btn-save">Save Configuration</button>
        <button class="btn-edit-inner">Edit Inner Components</button>
      </div>
    `;

    this.contentElement.innerHTML = html;
    this.attachConfigListeners();
  }

  /**
   * Attach configuration listeners
   * @private
   */
  attachConfigListeners() {
    const saveBtn = this.contentElement.querySelector('.btn-save');
    const editBtn = this.contentElement.querySelector('.btn-edit-inner');
    const nameInput = this.contentElement.querySelector('.config-name');

    saveBtn.addEventListener('click', () => {
      this.currentComposite.name = nameInput.value;
      this.eventBus.emit({
        urn: 'ui://composite-config',
        type: 'ui:composite-configured',
        timestamp: new Date().toISOString(),
        payload: {
          compositeId: this.currentComposite.id,
          name: this.currentComposite.name
        }
      });
    });

    editBtn.addEventListener('click', () => {
      this.eventBus.emit({
        urn: 'ui://composite-config',
        type: 'ui:edit-inner-components-requested',
        timestamp: new Date().toISOString(),
        payload: { compositeId: this.currentComposite.id }
      });
    });
  }

  /**
   * Hide panel
   */
  hide() {
    this.panelElement.classList.remove('visible');
    this.currentComposite = null;
  }
}
