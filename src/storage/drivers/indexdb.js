/**
 * IndexDB Driver
 * Stores data in browser IndexDB for large datasets
 */

import { Logger } from '../../utils/logger';

export class IndexDBDriver {
  /**
   * Create a new IndexDB driver
   * @param {string} dbName - Database name
   * @param {string} storeName - Object store name
   */
  constructor(dbName = 'fsm-tool', storeName = 'data') {
    this.logger = new Logger('IndexDBDriver');
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  /**
   * Initialize database
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * Save data to IndexDB
   * @param {string} key - Data key
   * @param {*} data - Data to save
   * @returns {Promise<Object>} - Save result
   */
  async save(key, data) {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(data, key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve({ status: 'success' });
      });
    } catch (error) {
      this.logger.error(`Save failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Load data from IndexDB
   * @param {string} key - Data key
   * @returns {Promise<*>} - Loaded data
   */
  async load(key) {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      this.logger.error(`Load failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Delete data from IndexDB
   * @param {string} key - Data key
   * @returns {Promise<Object>} - Delete result
   */
  async delete(key) {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve({ status: 'success' });
      });
    } catch (error) {
      this.logger.error(`Delete failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Clear all data
   * @returns {Promise<Object>} - Clear result
   */
  async clear() {
    try {
      if (!this.db) await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve({ status: 'success' });
      });
    } catch (error) {
      this.logger.error('Clear failed', error);
      return { status: 'error', message: error.message };
    }
  }
}
