/**
 * Drag-Drop Handler
 * Handles drag and drop interactions
 */

import { Logger } from '../../utils/logger';

export class DragDropHandler {
  /**
   * Create a new drag-drop handler
   * @param {HTMLElement} container - Container element
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, eventBus) {
    this.logger = new Logger('DragDropHandler');
    this.container = container;
    this.eventBus = eventBus;
    this.draggedElement = null;
    this.draggedData = null;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.container.addEventListener('dragstart', (e) => this.handleDragStart(e));
    this.container.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.container.addEventListener('drop', (e) => this.handleDrop(e));
    this.container.addEventListener('dragend', (e) => this.handleDragEnd(e));
  }

  /**
   * Handle drag start
   * @private
   * @param {DragEvent} e - Drag event
   */
  handleDragStart(e) {
    const element = e.target.closest('[data-draggable]');
    if (!element) return;

    this.draggedElement = element;
    this.draggedData = {
      id: element.getAttribute('data-component-id'),
      type: element.getAttribute('data-component-type'),
      x: e.clientX,
      y: e.clientY
    };

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedData));

    element.classList.add('dragging');

    this.eventBus.emit({
      urn: 'ui://drag-drop',
      type: 'ui:drag-start',
      timestamp: new Date().toISOString(),
      payload: this.draggedData
    });
  }

  /**
   * Handle drag over
   * @private
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const dropZone = e.target.closest('[data-drop-zone]');
    if (dropZone) {
      dropZone.classList.add('drag-over');
    }
  }

  /**
   * Handle drop
   * @private
   * @param {DragEvent} e - Drag event
   */
  handleDrop(e) {
    e.preventDefault();

    const dropZone = e.target.closest('[data-drop-zone]');
    if (!dropZone || !this.draggedData) return;

    dropZone.classList.remove('drag-over');

    const dropData = {
      x: e.clientX,
      y: e.clientY,
      targetId: dropZone.getAttribute('data-drop-zone-id')
    };

    this.eventBus.emit({
      urn: 'ui://drag-drop',
      type: 'ui:drop',
      timestamp: new Date().toISOString(),
      payload: {
        draggedData: this.draggedData,
        dropData
      }
    });
  }

  /**
   * Handle drag end
   * @private
   * @param {DragEvent} e - Drag event
   */
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }

    // Remove drag-over class from all elements
    this.container.querySelectorAll('.drag-over').forEach((el) => {
      el.classList.remove('drag-over');
    });

    this.draggedElement = null;
    this.draggedData = null;

    this.eventBus.emit({
      urn: 'ui://drag-drop',
      type: 'ui:drag-end',
      timestamp: new Date().toISOString(),
      payload: {}
    });
  }
}
