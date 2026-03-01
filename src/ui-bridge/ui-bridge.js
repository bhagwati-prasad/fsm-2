/**
 * UIBridge
 * Abstract renderer interface for different visualization backends
 */

import { Logger } from '../utils/logger';

export class UIBridge {
  /**
   * Create a new UIBridge
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.logger = new Logger('UIBridge');
    this.config = config;
    this.container = null;
    this.graph = null;
    this.eventBus = null;
    this.selectedComponent = null;
    this.hoveredComponent = null;
  }

  /**
   * Initialize renderer
   * @param {HTMLElement} container - DOM container
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Event bus
   */
  init(container, graph, eventBus) {
    this.container = container;
    this.graph = graph;
    this.eventBus = eventBus;
    this.logger.info('UIBridge initialized');
  }

  /**
   * Render graph
   * @abstract
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Update component visual
   * @abstract
   * @param {string} componentId - Component ID
   * @param {Object} state - Component state
   */
  updateComponent(componentId, state) {
    throw new Error('updateComponent() must be implemented by subclass');
  }

  /**
   * Animate component
   * @abstract
   * @param {string} componentId - Component ID
   * @param {string} cssClass - CSS class to apply
   * @param {number} duration - Animation duration in ms
   */
  animate(componentId, cssClass, duration) {
    throw new Error('animate() must be implemented by subclass');
  }

  /**
   * Select component
   * @abstract
   * @param {string} componentId - Component ID
   */
  selectComponent(componentId) {
    throw new Error('selectComponent() must be implemented by subclass');
  }

  /**
   * Deselect component
   * @abstract
   */
  deselectComponent() {
    throw new Error('deselectComponent() must be implemented by subclass');
  }

  /**
   * Show component details
   * @abstract
   * @param {string} componentId - Component ID
   */
  showComponentDetails(componentId) {
    throw new Error('showComponentDetails() must be implemented by subclass');
  }

  /**
   * Hide component details
   * @abstract
   */
  hideComponentDetails() {
    throw new Error('hideComponentDetails() must be implemented by subclass');
  }

  /**
   * Zoom in
   * @abstract
   */
  zoomIn() {
    throw new Error('zoomIn() must be implemented by subclass');
  }

  /**
   * Zoom out
   * @abstract
   */
  zoomOut() {
    throw new Error('zoomOut() must be implemented by subclass');
  }

  /**
   * Reset zoom
   * @abstract
   */
  resetZoom() {
    throw new Error('resetZoom() must be implemented by subclass');
  }

  /**
   * Pan to component
   * @abstract
   * @param {string} componentId - Component ID
   */
  panToComponent(componentId) {
    throw new Error('panToComponent() must be implemented by subclass');
  }

  /**
   * Fit to view
   * @abstract
   */
  fitToView() {
    throw new Error('fitToView() must be implemented by subclass');
  }

  /**
   * Clear canvas
   * @abstract
   */
  clear() {
    throw new Error('clear() must be implemented by subclass');
  }

  /**
   * Destroy renderer
   * @abstract
   */
  destroy() {
    throw new Error('destroy() must be implemented by subclass');
  }
}
