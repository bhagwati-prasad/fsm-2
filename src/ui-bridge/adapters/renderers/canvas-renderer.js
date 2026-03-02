/**
 * Canvas Renderer
 * Fallback renderer using HTML5 Canvas for large graphs
 */

import { UIBridge } from '../../ui-bridge';
import { Logger } from '../../../utils/logger';

export class CanvasRenderer extends UIBridge {
  /**
   * Create a new Canvas renderer
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    super(config);
    this.logger = new Logger('CanvasRenderer');
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.links = [];
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.selectedNode = null;
  }

  /**
   * Initialize Canvas renderer
   * @param {HTMLElement} container - DOM container
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Event bus
   */
  init(container, graph, eventBus) {
    super.init(container, graph, eventBus);

    // Create canvas
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.className = 'fsm-graph-canvas';
    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    // Initialize data
    this.initializeData();

    // Setup event handlers
    this.setupEventHandlers();

    this.logger.info('CanvasRenderer initialized');
  }

  /**
   * Initialize graph data
   * @private
   */
  initializeData() {
    this.nodes = this.graph.getComponents().map((component) => ({
      id: component.id,
      name: component.name,
      type: component.type,
      x: Math.random() * 400,
      y: Math.random() * 400,
      radius: 30
    }));

    this.links = this.graph.getConnections().map((connection) => ({
      id: connection.id,
      source: connection.source,
      target: connection.target
    }));
  }

  /**
   * Setup event handlers
   * @private
   */
  setupEventHandlers() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  /**
   * Handle click event
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoom;
    const y = (e.clientY - rect.top - this.panY) / this.zoom;

    // Check if clicked on a node
    for (const node of this.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius) {
        this.selectComponent(node.id);
        return;
      }
    }

    this.deselectComponent();
  }

  /**
   * Handle wheel event
   * @private
   * @param {WheelEvent} e - Wheel event
   */
  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom *= delta;
    this.render();
  }

  /**
   * Handle mouse move event
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.panX) / this.zoom;
    const y = (e.clientY - rect.top - this.panY) / this.zoom;

    // Check if hovering over a node
    let hovering = false;
    for (const node of this.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius) {
        this.canvas.style.cursor = 'pointer';
        hovering = true;
        break;
      }
    }

    if (!hovering) {
      this.canvas.style.cursor = 'default';
    }
  }

  /**
   * Render graph
   */
  render() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, width, height);

    // Apply transformations
    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw links
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 2 / this.zoom;
    this.links.forEach((link) => {
      const sourceNode = this.nodes.find((n) => n.id === link.source);
      const targetNode = this.nodes.find((n) => n.id === link.target);

      if (sourceNode && targetNode) {
        this.ctx.beginPath();
        this.ctx.moveTo(sourceNode.x, sourceNode.y);
        this.ctx.lineTo(targetNode.x, targetNode.y);
        this.ctx.stroke();
      }
    });

    // Draw nodes
    this.nodes.forEach((node) => {
      const isSelected = node.id === this.selectedNode;
      const strokeWidth = isSelected ? 4 : 2;

      this.ctx.fillStyle = '#e8f4f8';
      this.ctx.strokeStyle = '#0066cc';
      this.ctx.lineWidth = strokeWidth / this.zoom;

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();

      // Draw label
      this.ctx.fillStyle = '#000';
      this.ctx.font = `${12 / this.zoom}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.name, node.x, node.y);
    });

    this.ctx.restore();
  }

  /**
   * Update component visual
   * @param {string} componentId - Component ID
   * @param {Object} state - Component state
   */
  updateComponent(componentId, state) {
    this.render();
  }

  /**
   * Animate component
   * @param {string} componentId - Component ID
   * @param {string} cssClass - CSS class to apply
   * @param {number} duration - Animation duration in ms
   */
  animate(componentId, cssClass, duration) {
    this.render();
  }

  /**
   * Select component
   * @param {string} componentId - Component ID
   */
  selectComponent(componentId) {
    this.selectedNode = componentId;
    this.showComponentDetails(componentId);
    this.render();

    this.eventBus.emit({
      urn: `ui://renderer`,
      type: 'ui:component-selected',
      timestamp: new Date().toISOString(),
      payload: { componentId }
    });
  }

  /**
   * Deselect component
   */
  deselectComponent() {
    this.selectedNode = null;
    this.hideComponentDetails();
    this.render();
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
        payload: { component: component.getStateSnapshot ? component.getStateSnapshot() : {} }
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
    this.zoom *= 1.2;
    this.render();
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.zoom *= 0.8;
    this.render();
  }

  /**
   * Reset zoom
   */
  resetZoom() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  /**
   * Pan to component
   * @param {string} componentId - Component ID
   */
  panToComponent(componentId) {
    const node = this.nodes.find((n) => n.id === componentId);
    if (node) {
      this.panX = this.canvas.width / 2 - node.x * this.zoom;
      this.panY = this.canvas.height / 2 - node.y * this.zoom;
      this.render();
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

    const scaleX = (this.canvas.width * 0.8) / (maxX - minX);
    const scaleY = (this.canvas.height * 0.8) / (maxY - minY);
    this.zoom = Math.min(scaleX, scaleY);

    this.panX = this.canvas.width / 2 - ((minX + maxX) / 2) * this.zoom;
    this.panY = this.canvas.height / 2 - ((minY + maxY) / 2) * this.zoom;

    this.render();
  }

  /**
   * Clear canvas
   */
  clear() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.nodes = [];
    this.links = [];
    this.selectedNode = null;
  }

  /**
   * Destroy renderer
   */
  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}
