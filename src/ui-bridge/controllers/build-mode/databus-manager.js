/**
 * DataBus Manager
 * Manages DataBus creation and configuration
 */

import { Logger } from '../../../utils/logger';
import { DataBus } from '../../../core/databus';

export class DataBusManager {
  /**
   * Create a new DataBus manager
   * @param {HTMLElement} container - Container element
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, graph, eventBus) {
    this.logger = new Logger('DataBusManager');
    this.container = container;
    this.graph = graph;
    this.eventBus = eventBus;
    this.dataBuses = new Map();
    this.init();
  }

  /**
   * Initialize manager
   * @private
   */
  init() {
    this.createManagerUI();
    this.setupEventListeners();
  }

  /**
   * Create manager UI
   * @private
   */
  createManagerUI() {
    const manager = document.createElement('div');
    manager.className = 'databus-manager';
    manager.innerHTML = `
      <div class="manager-header">
        <h3>DataBuses</h3>
        <button class="btn-add-databus">+ Add DataBus</button>
      </div>
      <div class="databus-list"></div>
    `;
    this.container.appendChild(manager);
    this.managerElement = manager;
    this.listElement = manager.querySelector('.databus-list');
    this.addButton = manager.querySelector('.btn-add-databus');
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.addButton.addEventListener('click', () => this.showAddDialog());
  }

  /**
   * Show add DataBus dialog
   * @private
   */
  showAddDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'databus-dialog';
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Create DataBus</h3>
        <div class="dialog-field">
          <label>DataBus ID</label>
          <input type="text" class="dialog-id" placeholder="e.g., databus-1">
        </div>
        <div class="dialog-field">
          <label>Type</label>
          <select class="dialog-type">
            <option value="one-to-one">One-to-One</option>
            <option value="one-to-many">One-to-Many</option>
            <option value="many-to-one">Many-to-One</option>
            <option value="many-to-many">Many-to-Many</option>
          </select>
        </div>
        <div class="dialog-field">
          <label>Bandwidth (bytes/frame)</label>
          <input type="number" class="dialog-bandwidth" placeholder="e.g., 1000">
        </div>
        <div class="dialog-actions">
          <button class="btn-create">Create</button>
          <button class="btn-cancel">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const createBtn = dialog.querySelector('.btn-create');
    const cancelBtn = dialog.querySelector('.btn-cancel');
    const idInput = dialog.querySelector('.dialog-id');
    const typeSelect = dialog.querySelector('.dialog-type');
    const bandwidthInput = dialog.querySelector('.dialog-bandwidth');

    createBtn.addEventListener('click', () => {
      const id = idInput.value;
      const type = typeSelect.value;
      const bandwidth = parseInt(bandwidthInput.value) || null;

      if (!id) {
        alert('Please enter a DataBus ID');
        return;
      }

      this.createDataBus(id, type, bandwidth);
      document.body.removeChild(dialog);
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }

  /**
   * Create DataBus
   * @private
   * @param {string} id - DataBus ID
   * @param {string} type - DataBus type
   * @param {number} bandwidth - Bandwidth limit
   */
  createDataBus(id, type, bandwidth, source = [], target = []) {
    const dataBus = new DataBus({
      id,
      type,
      bandwidth,
      source,
      target
    });

    this.dataBuses.set(id, dataBus);
    this.addDataBusToList(dataBus);

    this.eventBus.emit({
      urn: 'ui://databus-manager',
      type: 'ui:databus-created',
      timestamp: new Date().toISOString(),
      payload: {
        dataBusId: id,
        dataBusType: type,
        bandwidth
      }
    });
  }

  createDefaultDataBusesForComponent(componentId) {
    const inboundId = `${componentId}-in`;
    const outboundId = `${componentId}-out`;

    if (!this.dataBuses.has(inboundId)) {
      this.createDataBus(inboundId, 'one-to-one', null, [], [componentId]);
    }

    if (!this.dataBuses.has(outboundId)) {
      this.createDataBus(outboundId, 'one-to-one', null, [componentId], []);
    }
  }

  /**
   * Add DataBus to list
   * @private
   * @param {DataBus} dataBus - DataBus to add
   */
  addDataBusToList(dataBus) {
    const item = document.createElement('div');
    item.className = 'databus-item';
    item.setAttribute('data-databus-id', dataBus.id);
    item.innerHTML = `
      <div class="item-info">
        <div class="item-id">${dataBus.id}</div>
        <div class="item-type">${dataBus.busType}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
      </div>
    `;

    const editBtn = item.querySelector('.btn-edit');
    const deleteBtn = item.querySelector('.btn-delete');

    editBtn.addEventListener('click', () => this.editDataBus(dataBus.id));
    deleteBtn.addEventListener('click', () => this.deleteDataBus(dataBus.id));

    this.listElement.appendChild(item);
  }

  /**
   * Edit DataBus
   * @private
   * @param {string} dataBusId - DataBus ID
   */
  editDataBus(dataBusId) {
    const dataBus = this.dataBuses.get(dataBusId);
    if (!dataBus) return;

    this.eventBus.emit({
      urn: 'ui://databus-manager',
      type: 'ui:databus-edit-requested',
      timestamp: new Date().toISOString(),
      payload: { dataBusId }
    });
  }

  /**
   * Delete DataBus
   * @private
   * @param {string} dataBusId - DataBus ID
   */
  deleteDataBus(dataBusId) {
    if (confirm(`Delete DataBus "${dataBusId}"?`)) {
      this.dataBuses.delete(dataBusId);
      const item = this.listElement.querySelector(`[data-databus-id="${dataBusId}"]`);
      if (item) {
        this.listElement.removeChild(item);
      }

      this.eventBus.emit({
        urn: 'ui://databus-manager',
        type: 'ui:databus-deleted',
        timestamp: new Date().toISOString(),
        payload: { dataBusId }
      });
    }
  }
}
