/**
 * Storage Manager
 * Abstracts storage operations across multiple drivers
 */

import { Logger } from '../utils/logger';

export class StorageManager {
  /**
   * Create a new storage manager
   * @param {Object} config - Storage configuration
   * @param {Object} config.drivers - Available storage drivers
   * @param {string} config.defaultDriver - Default driver to use
   */
  constructor(config = {}) {
    this.drivers = config.drivers || {};
    this.defaultDriver = config.defaultDriver || 'local';
    this.logger = new Logger('StorageManager');
    this.syncStrategy = config.syncStrategy || 'offline-first';
    this.syncInterval = config.syncInterval || 5000;
    this.pendingSync = new Map();
  }

  /**
   * Register a storage driver
   * @param {string} name - Driver name
   * @param {Object} driver - Driver instance
   */
  registerDriver(name, driver) {
    this.drivers[name] = driver;
    this.logger.info(`Driver '${name}' registered`);
  }

  /**
   * Get a driver
   * @param {string} name - Driver name
   * @returns {Object} - Driver instance
   */
  getDriver(name = this.defaultDriver) {
    return this.drivers[name];
  }

  /**
   * Save data
   * @param {string} key - Data key
   * @param {*} data - Data to save
   * @param {string} driver - Driver name (optional)
   * @returns {Promise<Object>} - Save result
   */
  async save(key, data, driver = this.defaultDriver) {
    try {
      const storageDriver = this.getDriver(driver);
      if (!storageDriver) {
        return { status: 'error', message: `Driver '${driver}' not found` };
      }

      // Save to local storage first (offline-first)
      if (this.syncStrategy === 'offline-first') {
        const localDriver = this.getDriver('local');
        if (localDriver && driver !== 'local') {
          await localDriver.save(key, data);
        }
      }

      // Save to specified driver
      const result = await storageDriver.save(key, data);

      // Track for sync if remote driver
      if (driver !== 'local' && driver !== 'session') {
        this.pendingSync.set(key, {
          data,
          driver,
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Save failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Load data
   * @param {string} key - Data key
   * @param {string} driver - Driver name (optional)
   * @returns {Promise<*>} - Loaded data
   */
  async load(key, driver = this.defaultDriver) {
    try {
      const storageDriver = this.getDriver(driver);
      if (!storageDriver) {
        return null;
      }

      const data = await storageDriver.load(key);
      return data;
    } catch (error) {
      this.logger.error(`Load failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Delete data
   * @param {string} key - Data key
   * @param {string} driver - Driver name (optional)
   * @returns {Promise<Object>} - Delete result
   */
  async delete(key, driver = this.defaultDriver) {
    try {
      const storageDriver = this.getDriver(driver);
      if (!storageDriver) {
        return { status: 'error', message: `Driver '${driver}' not found` };
      }

      const result = await storageDriver.delete(key);
      this.pendingSync.delete(key);
      return result;
    } catch (error) {
      this.logger.error(`Delete failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Sync pending changes to remote
   * @param {string} remoteDriver - Remote driver name
   * @returns {Promise<Object>} - Sync result
   */
  async sync(remoteDriver = 'rest') {
    try {
      const driver = this.getDriver(remoteDriver);
      if (!driver) {
        return { status: 'error', message: `Driver '${remoteDriver}' not found` };
      }

      let syncedCount = 0;
      const errors = [];

      for (const [key, item] of this.pendingSync.entries()) {
        try {
          await driver.save(key, item.data);
          this.pendingSync.delete(key);
          syncedCount++;
        } catch (error) {
          errors.push({ key, error: error.message });
        }
      }

      return {
        status: 'success',
        syncedCount,
        pendingCount: this.pendingSync.size,
        errors
      };
    } catch (error) {
      this.logger.error('Sync failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Export data as JSON
   * @param {string} key - Data key
   * @returns {Promise<string>} - JSON string
   */
  async export(key) {
    try {
      const data = await this.load(key);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      this.logger.error(`Export failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Import data from JSON
   * @param {string} key - Data key
   * @param {string} jsonData - JSON string
   * @returns {Promise<Object>} - Import result
   */
  async import(key, jsonData) {
    try {
      const data = JSON.parse(jsonData);
      return await this.save(key, data);
    } catch (error) {
      this.logger.error(`Import failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get pending sync count
   * @returns {number} - Pending items count
   */
  getPendingSyncCount() {
    return this.pendingSync.size;
  }

  /**
   * Clear all pending sync
   */
  clearPendingSync() {
    this.pendingSync.clear();
  }
}
