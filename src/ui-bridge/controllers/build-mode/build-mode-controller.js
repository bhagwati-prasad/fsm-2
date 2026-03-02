/**
 * Build Mode Controller
 * Orchestrates build mode UI components
 */

import { ComponentPalette } from './component-palette';
import { BuildCanvas } from './build-canvas';
import { ComponentConfigPanel } from './component-config-panel';
import { DataBusManager } from './databus-manager';
import { Logger } from '../../../utils/logger';

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
          <button class="btn-annotations">Annotations</button>
          <button class="btn-download">Download</button>
          <button class="btn-upload">Upload</button>
          <button class="btn-clear">Clear</button>
          <button class="btn-switch-mode">Switch to Simulation</button>
          <input type="file" class="file-upload-input" accept="application/json" style="display:none;">
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
    const annotationsBtn = this.layoutElement.querySelector('.btn-annotations');
    const downloadBtn = this.layoutElement.querySelector('.btn-download');
    const uploadBtn = this.layoutElement.querySelector('.btn-upload');
    const clearBtn = this.layoutElement.querySelector('.btn-clear');
    const switchBtn = this.layoutElement.querySelector('.btn-switch-mode');
    const uploadInput = this.layoutElement.querySelector('.file-upload-input');

    saveBtn.addEventListener('click', () => this.save());
    annotationsBtn.addEventListener('click', () => this.editAnnotations());
    downloadBtn.addEventListener('click', () => this.downloadGraph());
    uploadBtn.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', (event) => this.uploadGraph(event));
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
        graph: {
          id: this.graph.id,
          name: this.graph.name,
          annotations: this.graph.getAnnotations ? this.graph.getAnnotations() : { title: '', description: '', metadata: {} }
        },
        components: this.graph.getComponents().map((c) => c.getStateSnapshot()),
        connections: this.graph.getConnections(),
        dataBuses: Array.from(this.dataBusManager.dataBuses.values())
      }
    });
  }

  editAnnotations() {
    const current = this.graph.getAnnotations ? this.graph.getAnnotations() : { title: '', description: '', metadata: {} };

    const title = prompt('Graph annotation title', current.title || '');
    if (title === null) return;

    const description = prompt('Graph annotation description', current.description || '');
    if (description === null) return;

    const metadataInput = prompt(
      'Graph annotation metadata (JSON object)',
      JSON.stringify(current.metadata || {}, null, 2)
    );
    if (metadataInput === null) return;

    let metadata = {};
    try {
      metadata = metadataInput.trim() ? JSON.parse(metadataInput) : {};
      if (typeof metadata !== 'object' || Array.isArray(metadata)) {
        alert('Metadata must be a JSON object');
        return;
      }
    } catch (error) {
      alert(`Invalid metadata JSON: ${error.message}`);
      return;
    }

    this.graph.setAnnotations({ title, description, metadata });

    this.eventBus.emit({
      urn: 'ui://build-mode',
      type: 'ui:graph-annotations-updated',
      timestamp: new Date().toISOString(),
      payload: {
        annotations: this.graph.getAnnotations()
      }
    });
  }

  buildExportPayload() {
    return {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      graph: {
        id: this.graph.id,
        name: this.graph.name,
        annotations: this.graph.getAnnotations ? this.graph.getAnnotations() : { title: '', description: '', metadata: {} }
      },
      components: this.graph.getComponents().map((component) => ({
        id: component.id,
        name: component.name,
        type: component.type,
        ports: component.ports,
        stateMachine: {
          initialState: component.stateMachine.initialState,
          states: component.stateMachine.states,
          transitions: component.stateMachine.transitions
        },
        config: component.config,
        costModel: component.costModel,
        parentId: component.parentId,
        graphScope: component.graphScope,
        metadata: component.metadata,
        stateSnapshot: component.getStateSnapshot()
      })),
      connections: this.graph.getConnections(),
      dataBuses: Array.from(this.dataBusManager.dataBuses.values()).map((bus) => ({
        id: bus.id,
        type: bus.busType || bus.type,
        bandwidth: bus.bandwidth,
        source: bus.source,
        target: bus.target,
        channels: bus.channels
      }))
    };
  }

  downloadGraph() {
    const payload = this.buildExportPayload();
    const json = JSON.stringify(payload, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(this.graph.id || 'graph')}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async uploadGraph(event) {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      this.applyImportedGraph(data);
    } catch (error) {
      alert(`Failed to import graph: ${error.message}`);
    } finally {
      input.value = '';
    }
  }

  applyImportedGraph(data) {
    if (!data || !Array.isArray(data.components) || !Array.isArray(data.connections)) {
      throw new Error('Invalid graph file format');
    }

    this.clear(true);

    if (data.graph) {
      this.graph.id = data.graph.id || this.graph.id;
      this.graph.name = data.graph.name || this.graph.name;
      this.graph.setAnnotations(data.graph.annotations || { title: '', description: '', metadata: {} });
    }

    data.components.forEach((componentData) => {
      const component = this.library.instantiate(componentData.type, {
        id: componentData.id,
        name: componentData.name,
        ports: componentData.ports,
        stateMachine: componentData.stateMachine,
        config: componentData.config,
        costModel: componentData.costModel,
        parentId: componentData.parentId,
        graphScope: componentData.graphScope,
        title: componentData.metadata?.title,
        description: componentData.metadata?.description,
        metadata: componentData.metadata?.metadata
      });

      if (!component) {
        return;
      }

      if (componentData.metadata) {
        component.metadata = componentData.metadata;
      }

      if (componentData.stateSnapshot) {
        component.restoreStateSnapshot(componentData.stateSnapshot);
      }

      this.graph.addComponent(component);
    });

    data.connections.forEach((connection) => {
      this.graph.addConnection(connection);
    });

    this.dataBusManager.dataBuses.clear();
    this.dataBusManager.listElement.innerHTML = '';
    (data.dataBuses || []).forEach((bus) => {
      this.dataBusManager.createDataBus(bus.id, bus.type || bus.busType, bus.bandwidth);
    });

    this.renderer.render();
    this.canvas.showWelcomePrompt();

    this.eventBus.emit({
      urn: 'ui://build-mode',
      type: 'ui:graph-imported',
      timestamp: new Date().toISOString(),
      payload: {
        graph: {
          id: this.graph.id,
          name: this.graph.name,
          annotations: this.graph.getAnnotations()
        },
        componentCount: this.graph.getComponents().length,
        connectionCount: this.graph.getConnections().length
      }
    });
  }

  /**
   * Clear diagram
   * @private
   */
  clear(force = false) {
    if (force || confirm('Clear all components? This cannot be undone.')) {
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
