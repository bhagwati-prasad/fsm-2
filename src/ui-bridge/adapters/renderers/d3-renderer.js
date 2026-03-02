/**
 * D3.js Renderer
 * Renders graph using D3.js with force-directed layout
 */

import { UIBridge } from '../../ui-bridge';
import { Logger } from '../../../utils/logger';

export class D3Renderer extends UIBridge {
  /**
   * Create a new D3 renderer
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    super(config);
    this.logger = new Logger('D3Renderer');
    this.svg = null;
    this.simulation = null;
    this.nodes = [];
    this.links = [];
    this.zoom = null;
    this.zoomLevel = 1;
    this.nodeElements = null;
    this.linkElements = null;
    this.selectedNode = null;
  }

  getContainerDimensions() {
    const rect = this.container?.getBoundingClientRect?.() || { width: 0, height: 0 };
    const width = this.container?.clientWidth || rect.width || this.config.defaultWidth || 800;
    const height = this.container?.clientHeight || rect.height || this.config.defaultHeight || 600;

    return {
      width: Math.max(1, Math.floor(width)),
      height: Math.max(1, Math.floor(height))
    };
  }

  /**
   * Initialize D3 renderer
   * @param {HTMLElement} container - DOM container
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Event bus
   */
  init(container, graph, eventBus) {
    super.init(container, graph, eventBus);

    // Create SVG
    const { width, height } = this.getContainerDimensions();

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('class', 'fsm-graph');
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
    container.appendChild(this.svg);

    // Initialize data
    this.initializeData();

    // Create simulation
    this.createSimulation(width, height);

    // Setup zoom
    this.setupZoom(width, height);

    this.logger.info('D3Renderer initialized');
  }

  /**
   * Initialize graph data
   * @private
   */
  initializeData() {
    const existingNodes = new Map(this.nodes.map((node) => [node.id, node]));

    // Create nodes from components
    this.nodes = this.graph.getComponents().map((component) => ({
      ...(existingNodes.get(component.id) || {}),
      id: component.id,
      urn: component.urn,
      name: component.name,
      type: component.type,
      x: existingNodes.get(component.id)?.x ?? Math.random() * 400,
      y: existingNodes.get(component.id)?.y ?? Math.random() * 400
    }));

    // Create links from connections
    this.links = this.graph.getConnections().map((connection) => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      channel: connection.channel
    }));
  }

  /**
   * Create force simulation
   * @private
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  createSimulation(width, height) {
    // Simplified physics simulation
    this.simulation = {
      width,
      height,
      alpha: 1,
      alphaDecay: 0.02,
      tick: () => {
        // Update node positions
        this.nodes.forEach((node) => {
          node.vx = (node.vx || 0) * 0.9;
          node.vy = (node.vy || 0) * 0.9;
          node.x += node.vx;
          node.y += node.vy;

          // Boundary constraints
          if (node.x < 0) node.x = 0;
          if (node.x > width) node.x = width;
          if (node.y < 0) node.y = 0;
          if (node.y > height) node.y = height;
        });
      }
    };
  }

  /**
   * Setup zoom behavior
   * @private
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  setupZoom(width, height) {
    this.zoom = {
      scale: 1,
      translateX: 0,
      translateY: 0
    };

    // Add wheel event listener
    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom.scale *= delta;
      this.updateTransform();
    });
  }

  /**
   * Update transform
   * @private
   */
  updateTransform() {
    const g = this.svg.querySelector('g');
    if (g) {
      g.setAttribute(
        'transform',
        `translate(${this.zoom.translateX},${this.zoom.translateY}) scale(${this.zoom.scale})`
      );
    }
  }

  /**
   * Render graph
   */
  render() {
    const { width, height } = this.getContainerDimensions();
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    if (this.simulation) {
      this.simulation.width = width;
      this.simulation.height = height;
    }

    this.initializeData();

    // Clear SVG
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    // Create main group
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(g);

    // Draw links
    this.links.forEach((link) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const sourceNode = this.nodes.find((n) => n.id === link.source);
      const targetNode = this.nodes.find((n) => n.id === link.target);

      if (sourceNode && targetNode) {
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('class', `databus-${link.id}`);
        line.setAttribute('stroke', '#999');
        line.setAttribute('stroke-width', '2');
        g.appendChild(line);
      }
    });

    // Draw nodes
    this.nodes.forEach((node) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', '30');
      circle.setAttribute('class', `component-${node.type} component-${node.id}`);
      circle.setAttribute('fill', '#e8f4f8');
      circle.setAttribute('stroke', '#0066cc');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('data-component-id', node.id);

      // Add click handler
      circle.addEventListener('click', () => this.selectComponent(node.id));

      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dy', '0.3em');
      text.setAttribute('font-size', '12');
      text.setAttribute('pointer-events', 'none');
      text.textContent = node.name;

      const infoIconBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      infoIconBg.setAttribute('cx', node.x + 22);
      infoIconBg.setAttribute('cy', node.y - 22);
      infoIconBg.setAttribute('r', '8');
      infoIconBg.setAttribute('fill', '#ffffff');
      infoIconBg.setAttribute('stroke', '#0066cc');
      infoIconBg.setAttribute('stroke-width', '1.5');
      infoIconBg.setAttribute('class', `component-info-icon info-${node.id}`);

      const infoIconText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      infoIconText.setAttribute('x', node.x + 22);
      infoIconText.setAttribute('y', node.y - 22);
      infoIconText.setAttribute('text-anchor', 'middle');
      infoIconText.setAttribute('dy', '0.35em');
      infoIconText.setAttribute('font-size', '10');
      infoIconText.setAttribute('fill', '#0066cc');
      infoIconText.setAttribute('cursor', 'pointer');
      infoIconText.textContent = 'i';

      infoIconBg.addEventListener('click', (event) => {
        event.stopPropagation();
        this.showComponentDetails(node.id);
      });

      infoIconText.addEventListener('click', (event) => {
        event.stopPropagation();
        this.showComponentDetails(node.id);
      });

      g.appendChild(circle);
      g.appendChild(text);
      g.appendChild(infoIconBg);
      g.appendChild(infoIconText);
    });

    this.updateTransform();
    this.logger.info('Graph rendered');
  }

  /**
   * Update component visual
   * @param {string} componentId - Component ID
   * @param {Object} state - Component state
   */
  updateComponent(componentId, state) {
    const element = this.svg.querySelector(`[data-component-id="${componentId}"]`);
    if (element) {
      const stateClass = `state-${state.currentState}`;
      element.setAttribute('class', `component-${state.type} component-${componentId} ${stateClass}`);
    }
  }

  /**
   * Animate component
   * @param {string} componentId - Component ID
   * @param {string} cssClass - CSS class to apply
   * @param {number} duration - Animation duration in ms
   */
  animate(componentId, cssClass, duration) {
    const element = this.svg.querySelector(`[data-component-id="${componentId}"]`);
    if (element) {
      element.classList.add(cssClass);
      setTimeout(() => {
        element.classList.remove(cssClass);
      }, duration);
    }
  }

  /**
   * Select component
   * @param {string} componentId - Component ID
   */
  selectComponent(componentId) {
    // Deselect previous
    if (this.selectedNode) {
      const prevElement = this.svg.querySelector(`[data-component-id="${this.selectedNode}"]`);
      if (prevElement) {
        prevElement.setAttribute('stroke-width', '2');
      }
    }

    // Select new
    const element = this.svg.querySelector(`[data-component-id="${componentId}"]`);
    if (element) {
      element.setAttribute('stroke-width', '4');
      this.selectedNode = componentId;
      this.showComponentDetails(componentId);

      // Emit selection event
      this.eventBus.emit({
        urn: `ui://renderer`,
        type: 'ui:component-selected',
        timestamp: new Date().toISOString(),
        payload: { componentId }
      });
    }
  }

  /**
   * Deselect component
   */
  deselectComponent() {
    if (this.selectedNode) {
      const element = this.svg.querySelector(`[data-component-id="${this.selectedNode}"]`);
      if (element) {
        element.setAttribute('stroke-width', '2');
      }
      this.selectedNode = null;
      this.hideComponentDetails();
    }
  }

  /**
   * Show component details
   * @param {string} componentId - Component ID
   */
  showComponentDetails(componentId) {
    const component = this.graph.getComponent(componentId);
    if (component) {
      this.eventBus.emit({
        urn: `ui://renderer`,
        type: 'ui:show-details',
        timestamp: new Date().toISOString(),
        payload: {
          component: {
            id: component.id,
            name: component.name,
            title: component.metadata?.title || component.name,
            description: component.metadata?.description || component.description || '',
            capabilities: component.capabilities || [],
            usage: component.usage || ''
          }
        }
      });
    }
  }

  /**
   * Hide component details
   */
  hideComponentDetails() {
    this.eventBus.emit({
      urn: `ui://renderer`,
      type: 'ui:hide-details',
      timestamp: new Date().toISOString(),
      payload: {}
    });
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.zoom.scale *= 1.2;
    this.updateTransform();
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.zoom.scale *= 0.8;
    this.updateTransform();
  }

  /**
   * Reset zoom
   */
  resetZoom() {
    this.zoom.scale = 1;
    this.zoom.translateX = 0;
    this.zoom.translateY = 0;
    this.updateTransform();
  }

  /**
   * Pan to component
   * @param {string} componentId - Component ID
   */
  panToComponent(componentId) {
    const node = this.nodes.find((n) => n.id === componentId);
    if (node) {
      const width = this.svg.getAttribute('width');
      const height = this.svg.getAttribute('height');
      this.zoom.translateX = width / 2 - node.x * this.zoom.scale;
      this.zoom.translateY = height / 2 - node.y * this.zoom.scale;
      this.updateTransform();
    }
  }

  /**
   * Fit to view
   */
  fitToView() {
    if (this.nodes.length === 0) return;

    const minX = Math.min(...this.nodes.map((n) => n.x));
    const maxX = Math.max(...this.nodes.map((n) => n.x));
    const minY = Math.min(...this.nodes.map((n) => n.y));
    const maxY = Math.max(...this.nodes.map((n) => n.y));

    const width = this.svg.getAttribute('width');
    const height = this.svg.getAttribute('height');

    const scaleX = (width * 0.8) / (maxX - minX);
    const scaleY = (height * 0.8) / (maxY - minY);
    this.zoom.scale = Math.min(scaleX, scaleY);

    this.zoom.translateX = width / 2 - ((minX + maxX) / 2) * this.zoom.scale;
    this.zoom.translateY = height / 2 - ((minY + maxY) / 2) * this.zoom.scale;

    this.updateTransform();
  }

  /**
   * Clear canvas
   */
  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.nodes = [];
    this.links = [];
    this.selectedNode = null;
  }

  /**
   * Destroy renderer
   */
  destroy() {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
    this.simulation = null;
  }
}
