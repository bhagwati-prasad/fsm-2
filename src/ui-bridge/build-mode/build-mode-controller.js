/**
 * Build Mode Controller
 * Orchestrates build mode UI components
 */

import { ComponentPalette } from './component-palette';
import { BuildCanvas } from './build-canvas';
import { ComponentConfigPanel } from './component-config-panel';
import { DataBusManager } from './databus-manager';
import { Logger } from '../../utils/logger';

export class BuildModeController {
  /**
   * Create a new build mode controller
   * @param {HTMLElement} container - Container element
   * @param {Graph} graph - Component graph
   * @param {ComponentLibrary} library - Component library
   * @param {UIBridge} renderer - Renderer instance
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, graph, library, renderer, eventBus) {
    this.logger = new Logger('BuildModeController');
    this.container = container;
    this.graph = graph;
    this.library = library;
    this.renderer = renderer;
    this.eventBus = eventBus;
    this.init();
  }

  /**
   * Initialize build mode
   * @private
   */
  init() {
    this.createLayout();
    this.initializeComponents();
    this.setupEventListeners();
  }

  /**
   * Create layout
   * @private
   */
  createLayout() {
    const layout = document.createElement('div');
    layout.className = 'build-mode-layout';
    layout.innerHTML = `
      <div class="build-sidebar">
        <div class="sidebar-palette"></div>
        <div class="sidebar-databus"></div>
      </div>
      <div class="build-main">
        <div class="build-toolbar">
          <button class="btn-save">Save</button>
          <button class="btn-clear">Clear</button>
          <button class="btn-switch-mode">Switch to Simulation</button>
        </div>
        <div class="build-canvas-container"></div>
      </div>
      <div class="build-config"></div>
    `;
    this.container.appendChild(layout);
    this.layoutElement = layout;
  }

  /**
   * Initialize components
   * @private
   */
  initializeComponents() {
    const paletteContainer = this.layoutElement.querySelector('.sidebar-palette');
    const canvasContainer = this.layoutElement.querySelector('.build-canvas-container');
    const configContainer = this.layoutElement.querySelector('.build-config');
    const dataBusContainer = this.layoutElement.querySelector('.sidebar-databus');

    this.palette = new ComponentPalette(paletteContainer, this.library, this.eventBus);
    this.canvas = new BuildCanvas(canvasContainer, this.graph, this.renderer, this.eventBus);
    this.configPanel = new ComponentConfigPanel(configContainer, this.graph, this.eventBus);
    this.dataBusManager = new DataBusManager(dataBusContainer, this.graph, this.eventBus);
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    const saveBtn = this.layoutElement.querySelector('.btn-save');
    const clearBtn = this.layoutElement.querySelector('.btn-clear');
    const switchBtn = this.layoutElement.querySelector('.btn-switch-mode');

    saveBtn.addEventListener('click', () => this.save());
    clearBtn.addEventListener('click', () => this.clear());
    switchBtn.addEventListener('click', () => this.switchMode());

    this.eventBus.subscribe('ui:component-dropped', (event) => {
      this.handleComponentDropped(event);
    });

    this.eventBus.subscribe('ui:component-delete-requested', (event) => {
      this.canvas.removeComponent(event.payload.componentId);
    });
  }

  /**
   * Handle component dropped
   * @private
   * @param {Object} event - Drop event
   */
  handleComponentDropped(event) {
    const componentDef = this.library.getComponent(event.payload.componentType);
    if (!componentDef) return;

    const component = this.library.instantiate(event.payload.componentType, {
      id: `${event.payload.componentType}-${Date.now()}`,
      name: event.payload.componentName
    });

    this.canvas.addComponent(component, event.payload.x, event.payload.y);
  }

  /**
   * Save diagram
   * @private
   */
  save() {
    this.eventBus.emit({
      urn: 'ui://build-mode',
      type: 'ui:diagram-save-requested',
      timestamp: new Date().toISOString(),
      payload: {
        components: this.graph.getComponents().map((c) => c.getStateSnapshot()),
        connections: this.graph.getConnections(),
        dataBuses: Array.from(this.dataBusManager.dataBuses.values())
      }
    });
  }

  /**
   * Clear diagram
   * @private
   */
  clear() {
    if (confirm('Clear all components? This cannot be undone.')) {
      this.canvas.clear();
      this.dataBusManager.dataBuses.clear();
      this.dataBusManager.listElement.innerHTML = '';
    }
  }

  /**
   * Switch to simulation mode
   * @private
   */
  switchMode() {
    if (this.graph.getComponents().length === 0) {
      alert('Please add at least one component before switching to simulation mode');
      return;
    }

    this.eventBus.emit({
      urn: 'ui://build-mode',
      type: 'ui:mode-switch-requested',
      timestamp: new Date().toISOString(),
      payload: { targetMode: 'simulation' }
    });
  }
}
