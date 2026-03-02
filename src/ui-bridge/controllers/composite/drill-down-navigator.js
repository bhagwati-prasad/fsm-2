/**
 * Drill-Down Navigator
 * Handles navigation into composite components
 */

import { Logger } from '../../../utils/logger';

export class DrillDownNavigator {
  /**
   * Create a new drill-down navigator
   * @param {HTMLElement} container - Container element
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, eventBus) {
    this.logger = new Logger('DrillDownNavigator');
    this.container = container;
    this.eventBus = eventBus;
    this.breadcrumb = [];
    this.init();
  }

  /**
   * Initialize navigator
   * @private
   */
  init() {
    this.createNavigatorUI();
    this.setupEventListeners();
  }

  /**
   * Create navigator UI
   * @private
   */
  createNavigatorUI() {
    const nav = document.createElement('div');
    nav.className = 'drill-down-navigator';
    nav.innerHTML = `
      <div class="breadcrumb-trail">
        <button class="breadcrumb-item active" data-level="0">Root</button>
      </div>
    `;
    this.container.appendChild(nav);
    this.navElement = nav;
    this.breadcrumbTrail = nav.querySelector('.breadcrumb-trail');
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('ui:composite-drilled', (event) => {
      this.drillDown(event.payload.componentId, event.payload.componentName);
    });

    this.eventBus.subscribe('ui:drill-up', () => {
      this.drillUp();
    });
  }

  /**
   * Drill down into composite
   * @param {string} componentId - Component ID
   * @param {string} componentName - Component name
   */
  drillDown(componentId, componentName) {
    this.breadcrumb.push({ id: componentId, name: componentName });
    this.updateBreadcrumb();

    this.eventBus.emit({
      urn: 'ui://navigator',
      type: 'ui:drilled-down',
      timestamp: new Date().toISOString(),
      payload: {
        componentId,
        componentName,
        depth: this.breadcrumb.length
      }
    });
  }

  /**
   * Drill up to parent
   */
  drillUp() {
    if (this.breadcrumb.length > 0) {
      this.breadcrumb.pop();
      this.updateBreadcrumb();

      this.eventBus.emit({
        urn: 'ui://navigator',
        type: 'ui:drilled-up',
        timestamp: new Date().toISOString(),
        payload: {
          depth: this.breadcrumb.length
        }
      });
    }
  }

  /**
   * Navigate to level
   * @param {number} level - Breadcrumb level
   */
  navigateToLevel(level) {
    this.breadcrumb = this.breadcrumb.slice(0, level);
    this.updateBreadcrumb();

    this.eventBus.emit({
      urn: 'ui://navigator',
      type: 'ui:navigated-to-level',
      timestamp: new Date().toISOString(),
      payload: { level }
    });
  }

  /**
   * Update breadcrumb display
   * @private
   */
  updateBreadcrumb() {
    this.breadcrumbTrail.innerHTML = '<button class="breadcrumb-item" data-level="0">Root</button>';

    this.breadcrumb.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'breadcrumb-item';
      button.setAttribute('data-level', index + 1);
      button.textContent = item.name;
      button.addEventListener('click', () => this.navigateToLevel(index + 1));
      this.breadcrumbTrail.appendChild(button);
    });

    // Mark last as active
    const items = this.breadcrumbTrail.querySelectorAll('.breadcrumb-item');
    items.forEach((item) => item.classList.remove('active'));
    items[items.length - 1].classList.add('active');
  }

  /**
   * Get current depth
   * @returns {number} - Current depth
   */
  getCurrentDepth() {
    return this.breadcrumb.length;
  }

  /**
   * Get breadcrumb path
   * @returns {Array} - Breadcrumb path
   */
  getBreadcrumbPath() {
    return [...this.breadcrumb];
  }
}
