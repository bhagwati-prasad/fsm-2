/**
 * SessionStorage Driver
 * Stores data in browser SessionStorage
 */

import { Logger } from '../../utils/logger';

export class SessionStorageDriver {
  constructor() {
    this.logger = new Logger('SessionStorageDriver');
    this.prefix = 'fsm-tool-session:';
  }

  /**
   * Save data to SessionStorage
   * @param {string} key - Data key
   * @param {*} data - Data to save
   * @returns {Promise<Object>} - Save result
   */
  async save(key, data) {
    try {
      const storageKey = this.prefix + key;
      const serialized = JSON.stringify(data);
      sessionStorage.setItem(storageKey, serialized);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Save failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Load data from SessionStorage
   * @param {string} key - Data key
   * @returns {Promise<*>} - Loaded data
   */
  async load(key) {
    try {
      const storageKey = this.prefix + key;
      const serialized = sessionStorage.getItem(storageKey);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      this.logger.error(`Load failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Delete data from SessionStorage
   * @param {string} key - Data key
   * @returns {Promise<Object>} - Delete result
   */
  async delete(key) {
    try {
      const storageKey = this.prefix + key;
      sessionStorage.removeItem(storageKey);
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
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Clear failed', error);
      return { status: 'error', message: error.message };
    }
  }
}
