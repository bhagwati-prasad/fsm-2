/**
 * State Animator
 * Handles state-based animations
 */

import { Logger } from '../../utils/logger';

export class StateAnimator {
  /**
   * Create a new state animator
   * @param {HTMLElement} container - Container element
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, eventBus) {
    this.logger = new Logger('StateAnimator');
    this.container = container;
    this.eventBus = eventBus;
    this.animations = new Map();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('component:state-change', (event) => {
      this.animateStateChange(event);
    });
  }

  /**
   * Animate state change
   * @private
   * @param {Object} event - State change event
   */
  animateStateChange(event) {
    const componentId = event.payload.componentId;
    const newState = event.payload.newState;

    const element = this.container.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) return;

    // Remove previous state class
    element.classList.forEach((cls) => {
      if (cls.startsWith('state-')) {
        element.classList.remove(cls);
      }
    });

    // Add new state class
    const stateClass = `state-${newState}`;
    element.classList.add(stateClass);

    // Emit animation event
    this.eventBus.emit({
      urn: 'ui://animator',
      type: 'ui:state-animated',
      timestamp: new Date().toISOString(),
      payload: {
        componentId,
        newState,
        animationClass: stateClass
      }
    });
  }

  /**
   * Animate component
   * @param {string} componentId - Component ID
   * @param {string} animationClass - Animation class
   * @param {number} duration - Duration in ms
   */
  animate(componentId, animationClass, duration) {
    const element = this.container.querySelector(`[data-component-id="${componentId}"]`);
    if (!element) return;

    element.classList.add(animationClass);

    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }
}
