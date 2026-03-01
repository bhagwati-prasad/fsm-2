/**
 * Snap-Attach Handler
 * Handles snap-to-attach behavior for connections
 */

import { Logger } from '../../utils/logger';

export class SnapAttachHandler {
  /**
   * Create a new snap-attach handler
   * @param {HTMLElement} container - Container element
   * @param {EventBus} eventBus - Event bus
   * @param {Object} config - Configuration
   */
  constructor(container, eventBus, config = {}) {
    this.logger = new Logger('SnapAttachHandler');
    this.container = container;
    this.eventBus = eventBus;
    this.snapDistance = config.snapDistance || 50;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.container.addEventListener('drop', (e) => this.handleDrop(e));
  }

  /**
   * Handle drag over
   * @private
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    const snapTarget = this.findSnapTarget(e.clientX, e.clientY);
    if (snapTarget) {
      snapTarget.classList.add('snap-target');
      e.dataTransfer.dropEffect = 'link';
    }
  }

  /**
   * Handle drop
   * @private
   * @param {DragEvent} e - Drag event
   */
  handleDrop(e) {
    const snapTarget = this.findSnapTarget(e.clientX, e.clientY);
    if (snapTarget) {
      snapTarget.classList.remove('snap-target');

      try {
        const draggedData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetId = snapTarget.getAttribute('data-component-id');

        this.eventBus.emit({
          urn: 'ui://snap-attach',
          type: 'ui:snap-attach',
          timestamp: new Date().toISOString(),
          payload: {
            sourceId: draggedData.id,
            targetId,
            snapDistance: this.snapDistance
          }
        });
      } catch (error) {
        this.logger.error('Error parsing drag data', error);
      }
    }
  }

  /**
   * Find snap target
   * @private
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {HTMLElement|null} - Snap target element
   */
  findSnapTarget(x, y) {
    const elements = this.container.querySelectorAll('[data-component-id]');
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const distance = Math.sqrt(
        Math.pow(x - (rect.left + rect.width / 2), 2) +
          Math.pow(y - (rect.top + rect.height / 2), 2)
      );

      if (distance < this.snapDistance) {
        return element;
      }
    }
    return null;
  }
}
