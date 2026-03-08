/**
 * Build Mode Controller
 * Orchestrates build mode UI components
 */

import { ComponentPalette } from './component-palette';
import { BuildCanvas } from './build-canvas';
import { ComponentConfigPanel } from './component-config-panel';
import { DataBusManager } from './databus-manager';
import { Logger } from '../../../utils/logger';
import { Modal } from '../../../ui-components/modal';

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
    const ensureChild = (parent, selector, tagName = 'div', className = null) => {
      if (!parent) {
        return null;
      }

      let child = parent.querySelector(selector);
      if (!child) {
        child = document.createElement(tagName);
        if (className) {
          child.className = className;
        }
        parent.appendChild(child);
      }
      return child;
    };

    // Use the build mode container from index.html as the single source of truth.
    this.layoutElement = this.container;
    //this.layoutElement.classList.add('build-mode-layout');

    const sidebar = this.layoutElement.querySelector('.build-sidebar, .palette-sidebar');
    const main = this.layoutElement.querySelector('.build-main, .canvas-area');
    const config = this.layoutElement.querySelector('.build-config, .config-panel');

    if (!sidebar || !main || !config) {
      throw new Error('Build mode container is missing required sections in index.html');
    }

    sidebar.classList.add('build-sidebar');
    main.classList.add('build-main');
    config.classList.add('build-config');

    ensureChild(sidebar, '.sidebar-palette', 'div', 'sidebar-palette');
    ensureChild(sidebar, '.sidebar-databus', 'div', 'sidebar-databus');

    const toolbar = ensureChild(main, '.build-toolbar', 'div', 'build-toolbar');
    if (toolbar && toolbar.children.length === 0) {
      toolbar.innerHTML = `
        <button class="btn-save">Save</button>
        <button class="btn-annotations">Annotations</button>
        <button class="btn-download">Download</button>
        <button class="btn-upload">Upload</button>
        <button class="btn-clear">Clear</button>
        <button class="btn-switch-mode">Switch to Simulation</button>
        <input type="file" class="file-upload-input" accept="application/json" style="display:none;">
      `;
    }

    ensureChild(main, '.build-canvas-container', 'div', 'build-canvas-container');
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

    this.eventBus.subscribe('ui:show-details', (event) => {
      this.showComponentDetails(event.payload.component);
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
    this.dataBusManager.createDefaultDataBusesForComponent(component.id);
  }

  showComponentDetails(component) {
    if (!component) {
      return;
    }

    const capabilities = Array.isArray(component.capabilities)
      ? component.capabilities.join(', ')
      : 'N/A';

    const details = [
      `Title: ${component.title || component.name || component.id}`,
      `Description: ${component.description || ''}`,
      `Capabilities: ${capabilities || 'N/A'}`,
      `Usage: ${component.usage || 'N/A'}`
    ].join('\n');

    Modal.alert(details, { title: 'Component Details' });
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

  async editAnnotations() {
    const current = this.graph.getAnnotations ? this.graph.getAnnotations() : { title: '', description: '', metadata: {} };

    const annotationValues = await this.showAnnotationsDialog(current);
    if (!annotationValues) {
      return;
    }

    const { title, description, metadataInput } = annotationValues;

    let metadata = {};
    try {
      metadata = metadataInput.trim() ? JSON.parse(metadataInput) : {};
      if (typeof metadata !== 'object' || Array.isArray(metadata)) {
        Modal.alert('Metadata must be a JSON object', { title: 'Invalid Metadata' });
        return;
      }
    } catch (error) {
      Modal.alert(`Invalid metadata JSON: ${error.message}`, { title: 'Invalid Metadata' });
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

  showAnnotationsDialog(current) {
    return new Promise((resolve) => {
      const modal = new Modal({
        title: 'Edit Graph Annotations',
        size: 'medium'
      });

      const form = document.createElement('div');
      form.className = 'modal-form';
      form.innerHTML = `
        <div class="modal-form-field">
          <label>Graph annotation title</label>
          <input type="text" class="annotations-title">
        </div>
        <div class="modal-form-field">
          <label>Graph annotation description</label>
          <textarea class="annotations-description" rows="4"></textarea>
        </div>
        <div class="modal-form-field">
          <label>Graph annotation metadata (JSON object)</label>
          <textarea class="annotations-metadata" rows="10"></textarea>
        </div>
      `;

      const actions = document.createElement('div');
      actions.className = 'app-modal-actions';
      actions.innerHTML = `
        <button class="app-modal-btn app-modal-btn-primary btn-save-annotations">Save</button>
        <button class="app-modal-btn btn-cancel-annotations">Cancel</button>
      `;

      modal.setBody(form);
      modal.setFooter(actions);

      const titleInput = form.querySelector('.annotations-title');
      const descriptionInput = form.querySelector('.annotations-description');
      const metadataInput = form.querySelector('.annotations-metadata');

      titleInput.value = current.title || '';
      descriptionInput.value = current.description || '';
      metadataInput.value = JSON.stringify(current.metadata || {}, null, 2);

      const saveButton = actions.querySelector('.btn-save-annotations');
      const cancelButton = actions.querySelector('.btn-cancel-annotations');

      let resolved = false;
      const finish = (value) => {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve(value);
      };

      saveButton.addEventListener('click', () => {
        finish({
          title: titleInput.value,
          description: descriptionInput.value,
          metadataInput: metadataInput.value
        });
        modal.close();
      });

      cancelButton.addEventListener('click', () => {
        modal.close();
      });

      modal.onClose(() => {
        finish(null);
      });

      modal.open();
      titleInput.focus();
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
        description: component.description,
        capabilities: component.capabilities,
        usage: component.usage,
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
      Modal.alert(`Failed to import graph: ${error.message}`, { title: 'Import Failed' });
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
        description: componentData.description,
        capabilities: componentData.capabilities,
        usage: componentData.usage,
        title: componentData.metadata?.title,
        metadataDescription: componentData.metadata?.description,
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

    this.canvas.render();
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
      Modal.alert('Please add at least one component before switching to simulation mode', { title: 'Cannot Switch Mode' });
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
