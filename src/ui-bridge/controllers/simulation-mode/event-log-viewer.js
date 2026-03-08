/**
 * Event Log Viewer
 * Displays simulation events
 */

import { Logger } from '../../../utils/logger';
import { Modal } from '../../../ui-components/modal';

export class EventLogViewer {
  /**
   * Create a new event log viewer
   * @param {HTMLElement} container - Container element
   * @param {SimulationEngine} engine - Simulation engine
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, engine, eventBus) {
    this.logger = new Logger('EventLogViewer');
    this.container = container;
    this.engine = engine;
    this.eventBus = eventBus;
    this.events = [];
    this.maxEvents = 1000;
    this.init();
  }

  /**
   * Initialize viewer
   * @private
   */
  init() {
    this.createViewerUI();
    this.setupEventListeners();
  }

  /**
   * Create viewer UI
   * @private
   */
  createViewerUI() {
    const viewer = document.createElement('div');
    viewer.className = 'event-log-viewer';
    viewer.innerHTML = `
      <div class="viewer-header">
        <h3>Event Log</h3>
        <div class="viewer-controls">
          <input type="text" class="filter-input" placeholder="Filter events...">
          <button class="btn-clear">Clear</button>
        </div>
      </div>
      <div class="event-list"></div>
    `;
    this.container.appendChild(viewer);
    this.viewerElement = viewer;
    this.eventList = viewer.querySelector('.event-list');
    this.filterInput = viewer.querySelector('.filter-input');
    this.clearButton = viewer.querySelector('.btn-clear');

    this.filterInput.addEventListener('input', (e) => this.filterEvents(e.target.value));
    this.clearButton.addEventListener('click', () => this.clear());
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('*', (event) => {
      if (event.type.startsWith('component:') || event.type.startsWith('databus:')) {
        this.addEvent(event);
      }
    });
  }

  /**
   * Add event to log
   * @param {Object} event - Event to add
   */
  addEvent(event) {
    this.events.push(event);

    // Limit event log size
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    this.renderEvent(event);
  }

  /**
   * Render event in list
   * @private
   * @param {Object} event - Event to render
   */
  renderEvent(event) {
    const item = document.createElement('div');
    item.className = `event-item event-${event.type.split(':')[0]}`;
    item.innerHTML = `
      <div class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</div>
      <div class="event-type">${event.type}</div>
      <div class="event-details">${JSON.stringify(event.payload).substring(0, 100)}...</div>
    `;

    item.addEventListener('click', () => this.showEventDetails(event));

    this.eventList.insertBefore(item, this.eventList.firstChild);

    // Limit displayed items
    while (this.eventList.children.length > 100) {
      this.eventList.removeChild(this.eventList.lastChild);
    }
  }

  /**
   * Show event details
   * @private
   * @param {Object} event - Event to show
   */
  showEventDetails(event) {
    const details = JSON.stringify(event, null, 2);
    Modal.alert(details, { title: 'Event Details', size: 'most-of-screen' });
  }

  /**
   * Filter events
   * @private
   * @param {string} term - Filter term
   */
  filterEvents(term) {
    const items = this.eventList.querySelectorAll('.event-item');
    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(term.toLowerCase()) ? 'block' : 'none';
    });
  }

  /**
   * Clear event log
   */
  clear() {
    this.events = [];
    this.eventList.innerHTML = '';
  }
}
