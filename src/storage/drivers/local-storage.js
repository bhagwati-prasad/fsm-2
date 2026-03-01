/**
 * LocalStorage Driver
 * Stores data in browser LocalStorage
 */

import { Logger } from '../../utils/logger';

export class LocalStorageDriver {
  constructor() {
    this.logger = new Logger('LocalStorageDriver');
    this.prefix = 'fsm-tool:';
  }

  /**
   * Save data to LocalStorage
   * @param {string} key - Data key
   * @param {*} data - Data to save
   * @returns {Promise<Object>} - Save result
   */
  async save(key, data) {
    try {
      const storageKey = this.prefix + key;
      const serialized = JSON.stringify(data);
      localStorage.setItem(storageKey, serialized);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Save failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Load data from LocalStorage
   * @param {string} key - Data key
   * @returns {Promise<*>} - Loaded data
   */
  async load(key) {
    try {
      const storageKey = this.prefix + key;
      const serialized = localStorage.getItem(storageKey);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      this.logger.error(`Load failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Delete data from LocalStorage
   * @param {string} key - Data key
   * @returns {Promise<Object>} - Delete result
   */
  async delete(key) {
    try {
      const storageKey = this.prefix + key;
      localStorage.removeItem(storageKey);
      return { status: 'success' };
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
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Clear failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get storage size
   * @returns {number} - Size in bytes
   */
  getSize() {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        size += localStorage.getItem(key).length;
      }
    });
    return size;
  }
}
