/**
 * DataBus Manager
 * Manages DataBus creation and configuration
 */

import { Logger } from '../../../utils/logger';
import { DataBus } from '../../../core/databus';
import { Modal } from '../../../ui-components/modal';

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
    const modal = new Modal({
      title: 'Create DataBus'
    });

    const form = document.createElement('div');
    form.className = 'modal-form';
    form.innerHTML = `
      <div class="modal-form-field">
        <label>DataBus ID</label>
        <input type="text" class="dialog-id" placeholder="e.g., databus-1">
      </div>
      <div class="modal-form-field">
        <label>Type</label>
        <select class="dialog-type">
          <option value="one-to-one">One-to-One</option>
          <option value="one-to-many">One-to-Many</option>
          <option value="many-to-one">Many-to-One</option>
          <option value="many-to-many">Many-to-Many</option>
        </select>
      </div>
      <div class="modal-form-field">
        <label>Bandwidth (bytes/frame)</label>
        <input type="number" class="dialog-bandwidth" placeholder="e.g., 1000">
      </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'app-modal-actions';
    actions.innerHTML = `
      <button class="app-modal-btn app-modal-btn-primary btn-create">Create</button>
      <button class="app-modal-btn btn-cancel">Cancel</button>
    `;

    modal.setBody(form);
    modal.setFooter(actions);

    const createBtn = actions.querySelector('.btn-create');
    const cancelBtn = actions.querySelector('.btn-cancel');
    const idInput = form.querySelector('.dialog-id');
    const typeSelect = form.querySelector('.dialog-type');
    const bandwidthInput = form.querySelector('.dialog-bandwidth');

    createBtn.addEventListener('click', () => {
      const id = idInput.value;
      const type = typeSelect.value;
      const bandwidth = parseInt(bandwidthInput.value) || null;

      if (!id) {
        Modal.alert('Please enter a DataBus ID', { title: 'Missing DataBus ID' });
        return;
      }

      this.createDataBus(id, type, bandwidth);
      modal.close();
    });

    cancelBtn.addEventListener('click', () => {
      modal.close();
    });

    modal.open();
    idInput.focus();
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
