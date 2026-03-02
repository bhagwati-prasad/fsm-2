/**
 * Build Canvas
 * Main canvas for building diagrams
 */

import { Logger } from '../../../utils/logger';

export class BuildCanvas {
  /**
   * Create a new build canvas
   * @param {HTMLElement} container - Container element
   * @param {Graph} graph - Component graph
   * @param {UIBridge} renderer - Renderer instance
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, graph, renderer, eventBus) {
    this.logger = new Logger('BuildCanvas');
    this.container = container;
    this.graph = graph;
    this.renderer = renderer;
    this.eventBus = eventBus;
    this.isEmpty = true;
    this.init();
  }

  /**
   * Initialize canvas
   * @private
   */
  init() {
    this.createCanvasUI();
    this.ensureRendererReady();
    this.setupEventListeners();
    this.showWelcomePrompt();
  }

  ensureRendererReady() {
    if (!this.renderer) {
      return;
    }

    const isAlreadyBound = this.renderer.container === this.contentElement;
    if (isAlreadyBound) {
      return;
    }

    if (typeof this.renderer.destroy === 'function') {
      try {
        this.renderer.destroy();
      } catch (error) {
        this.logger.warn('Renderer destroy failed during rebind', error);
      }
    }

    this.contentElement.innerHTML = '';
    this.renderer.init(this.contentElement, this.graph, this.eventBus);
  }

  render() {
    this.ensureRendererReady();
    this.renderer.render();
  }

  /**
   * Create canvas UI
   * @private
   */
  createCanvasUI() {
    const canvas = document.createElement('div');
    canvas.className = 'build-canvas';
    canvas.setAttribute('data-drop-zone', 'true');
    canvas.setAttribute('data-drop-zone-id', 'canvas');
    canvas.innerHTML = `
      <div class="canvas-content"></div>
      <div class="canvas-welcome"></div>
    `;
    this.container.appendChild(canvas);
    this.canvasElement = canvas;
    this.contentElement = canvas.querySelector('.canvas-content');
    this.welcomeElement = canvas.querySelector('.canvas-welcome');
  }

  /**
   * Show welcome prompt
   * @private
   */
  showWelcomePrompt() {
    if (this.graph.getComponents().length === 0) {
      this.welcomeElement.innerHTML = `
        <div class="welcome-prompt">
          <div class="welcome-icon">📐</div>
          <h2>Welcome to Build Mode</h2>
          <p>Drag components from the palette to start building your architecture</p>
          <div class="welcome-tips">
            <h4>Tips:</h4>
            <ul>
              <li>Drag components from the left palette</li>
              <li>Connect components by dragging from output to input</li>
              <li>Click on components to configure them</li>
              <li>Use the toolbar to save and switch modes</li>
            </ul>
          </div>
        </div>
      `;
      this.isEmpty = true;
    } else {
      this.welcomeElement.innerHTML = '';
      this.isEmpty = false;
    }
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.canvasElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      this.canvasElement.classList.add('drag-over');
    });

    this.canvasElement.addEventListener('dragleave', () => {
      this.canvasElement.classList.remove('drag-over');
    });

    this.canvasElement.addEventListener('drop', (e) => {
      e.preventDefault();
      this.canvasElement.classList.remove('drag-over');
      this.handleComponentDrop(e);
    });
  }

  /**
   * Handle component drop
   * @private
   * @param {DragEvent} e - Drop event
   */
  handleComponentDrop(e) {
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (data.type !== 'component') return;

    const x = e.clientX - this.canvasElement.getBoundingClientRect().left;
    const y = e.clientY - this.canvasElement.getBoundingClientRect().top;

    this.eventBus.emit({
      urn: 'ui://canvas',
      type: 'ui:component-dropped',
      timestamp: new Date().toISOString(),
      payload: {
        componentType: data.componentType,
        componentName: data.componentName,
        x,
        y
      }
    });

    // Hide welcome prompt
    if (this.isEmpty) {
      this.showWelcomePrompt();
    }
  }

  /**
   * Add component to canvas
   * @param {Component} component - Component to add
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  addComponent(component, x, y) {
    this.graph.addComponent(component);
    this.render();
    this.showWelcomePrompt();

    this.eventBus.emit({
      urn: 'ui://canvas',
      type: 'ui:component-added',
      timestamp: new Date().toISOString(),
      payload: {
        componentId: component.id,
        componentType: component.type,
        x,
        y
      }
    });
  }

  /**
   * Remove component from canvas
   * @param {string} componentId - Component ID
   */
  removeComponent(componentId) {
    this.graph.removeComponent(componentId);
    this.render();
    this.showWelcomePrompt();

    this.eventBus.emit({
      urn: 'ui://canvas',
      type: 'ui:component-removed',
      timestamp: new Date().toISOString(),
      payload: { componentId }
    });
  }

  /**
   * Clear canvas
   */
  clear() {
    this.ensureRendererReady();
    this.graph.getComponents().forEach((component) => {
      this.graph.removeComponent(component.id);
    });
    this.renderer.clear();
    this.showWelcomePrompt();
  }
}
