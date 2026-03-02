/**
 * Component Configuration Panel
 * Displays and manages component configuration
 */

import { Logger } from '../../../utils/logger';

export class ComponentConfigPanel {
  /**
   * Create a new config panel
   * @param {HTMLElement} container - Container element
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, graph, eventBus) {
    this.logger = new Logger('ComponentConfigPanel');
    this.container = container;
    this.graph = graph;
    this.eventBus = eventBus;
    this.currentComponent = null;
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
    panel.className = 'config-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>Component Configuration</h3>
        <button class="panel-close">✕</button>
      </div>
      <div class="panel-content"></div>
    `;
    this.container.appendChild(panel);
    this.panelElement = panel;
    this.contentElement = panel.querySelector('.panel-content');
    this.closeButton = panel.querySelector('.panel-close');
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.closeButton.addEventListener('click', () => this.hide());

    this.eventBus.subscribe('ui:component-selected', (event) => {
      this.showComponent(event.payload.componentId);
    });

    this.eventBus.subscribe('ui:component-deselected', () => {
      this.hide();
    });
  }

  /**
   * Show component configuration
   * @param {string} componentId - Component ID
   */
  showComponent(componentId) {
    const component = this.graph.getComponent(componentId);
    if (!component) return;

    this.currentComponent = component;
    this.renderConfiguration(component);
    this.panelElement.classList.add('visible');
  }

  /**
   * Render component configuration
   * @private
   * @param {Component} component - Component to configure
   */
  renderConfiguration(component) {
    const html = `
      <div class="config-section">
        <h4>Basic Information</h4>
        <div class="config-field">
          <label>Component ID</label>
          <input type="text" value="${component.id}" disabled>
        </div>
        <div class="config-field">
          <label>Component Name</label>
          <input type="text" class="config-name" value="${component.name}">
        </div>
        <div class="config-field">
          <label>Component Type</label>
          <input type="text" value="${component.type}" disabled>
        </div>
      </div>

      <div class="config-section">
        <h4>Metadata</h4>
        <div class="config-field">
          <label>Title</label>
          <input type="text" class="config-title" value="${component.metadata.title}">
        </div>
        <div class="config-field">
          <label>Description</label>
          <textarea class="config-description">${component.metadata.description}</textarea>
        </div>
        <div class="config-field">
          <label>Metadata (JSON)</label>
          <textarea class="config-metadata">${JSON.stringify(component.metadata.metadata || {}, null, 2)}</textarea>
        </div>
      </div>

      <div class="config-section">
        <h4>Component Details</h4>
        <div class="config-field">
          <label>Capabilities</label>
          <textarea disabled>${(component.capabilities || []).join(', ')}</textarea>
        </div>
        <div class="config-field">
          <label>Usage</label>
          <textarea disabled>${component.usage || ''}</textarea>
        </div>
      </div>

      <div class="config-section">
        <h4>Ports</h4>
        <div class="ports-info">
          <div>Input Ports: ${component.inputPorts.length}</div>
          <div>Output Ports: ${component.outputPorts.length}</div>
        </div>
      </div>

      <div class="config-actions">
        <button class="btn-save">Save Configuration</button>
        <button class="btn-delete">Delete Component</button>
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
    const deleteBtn = this.contentElement.querySelector('.btn-delete');
    const nameInput = this.contentElement.querySelector('.config-name');
    const titleInput = this.contentElement.querySelector('.config-title');
    const descInput = this.contentElement.querySelector('.config-description');
    const metadataInput = this.contentElement.querySelector('.config-metadata');

    saveBtn.addEventListener('click', () => {
      let metadata = {};
      try {
        metadata = metadataInput.value.trim() ? JSON.parse(metadataInput.value) : {};
        if (typeof metadata !== 'object' || Array.isArray(metadata)) {
          alert('Metadata must be a JSON object');
          return;
        }
      } catch (error) {
        alert(`Invalid metadata JSON: ${error.message}`);
        return;
      }

      this.currentComponent.name = nameInput.value;
      this.currentComponent.metadata.title = titleInput.value;
      this.currentComponent.metadata.description = descInput.value;
      this.currentComponent.metadata.metadata = metadata;

      this.eventBus.emit({
        urn: 'ui://config-panel',
        type: 'ui:component-configured',
        timestamp: new Date().toISOString(),
        payload: {
          componentId: this.currentComponent.id,
          name: this.currentComponent.name,
          title: this.currentComponent.metadata.title,
          description: this.currentComponent.metadata.description,
          metadata: this.currentComponent.metadata.metadata
        }
      });
    });

    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete component "${this.currentComponent.name}"?`)) {
        this.eventBus.emit({
          urn: 'ui://config-panel',
          type: 'ui:component-delete-requested',
          timestamp: new Date().toISOString(),
          payload: { componentId: this.currentComponent.id }
        });
        this.hide();
      }
    });
  }

  /**
   * Hide panel
   */
  hide() {
    this.panelElement.classList.remove('visible');
    this.currentComponent = null;
  }
}
