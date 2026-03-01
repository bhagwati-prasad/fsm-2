/**
 * DataBus Animator
 * Handles data flow animations
 */

import { Logger } from '../../utils/logger';

export class DataBusAnimator {
  /**
   * Create a new databus animator
   * @param {HTMLElement} container - Container element
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, eventBus) {
    this.logger = new Logger('DataBusAnimator');
    this.container = container;
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('databus:transfer', (event) => {
      this.animateTransfer(event);
    });
  }

  /**
   * Animate data transfer
   * @private
   * @param {Object} event - Transfer event
   */
  animateTransfer(event) {
    const connectionId = event.payload.source + '-' + event.payload.target;
    const element = this.container.querySelector(`[data-connection-id="${connectionId}"]`);

    if (!element) return;

    // Add animation class
    element.classList.add('transferring');

    // Remove after animation
    setTimeout(() => {
      element.classList.remove('transferring');
    }, 500);

    // Emit animation event
    this.eventBus.emit({
      urn: 'ui://animator',
      type: 'ui:transfer-animated',
      timestamp: new Date().toISOString(),
      payload: {
        connectionId,
        dataSize: event.payload.dataSize
      }
    });
  }

  /**
   * Animate data flow
   * @param {string} sourceId - Source component ID
   * @param {string} targetId - Target component ID
   * @param {number} duration - Duration in ms
   */
  animateFlow(sourceId, targetId, duration) {
    const connectionId = sourceId + '-' + targetId;
    const element = this.container.querySelector(`[data-connection-id="${connectionId}"]`);

    if (!element) return;

    element.classList.add('flowing');

    setTimeout(() => {
      element.classList.remove('flowing');
    }, duration);
  }
}
