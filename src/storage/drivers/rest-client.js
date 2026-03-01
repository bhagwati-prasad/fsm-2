/**
 * REST Client Driver
 * Syncs data with remote REST API
 */

import { Logger } from '../../utils/logger';

export class RESTClient {
  /**
   * Create a new REST client
   * @param {string} baseUrl - Base API URL
   * @param {Object} config - Configuration
   */
  constructor(baseUrl, config = {}) {
    this.logger = new Logger('RESTClient');
    this.baseUrl = baseUrl;
    this.timeout = config.timeout || 30000;
    this.headers = config.headers || { 'Content-Type': 'application/json' };
  }

  /**
   * Save data via REST API
   * @param {string} key - Data key
   * @param {*} data - Data to save
   * @returns {Promise<Object>} - Save result
   */
  async save(key, data) {
    try {
      const response = await this.request('POST', `/data/${key}`, data);
      return { status: 'success', data: response };
    } catch (error) {
      this.logger.error(`Save failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Load data via REST API
   * @param {string} key - Data key
   * @returns {Promise<*>} - Loaded data
   */
  async load(key) {
    try {
      const response = await this.request('GET', `/data/${key}`);
      return response;
    } catch (error) {
      this.logger.error(`Load failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Delete data via REST API
   * @param {string} key - Data key
   * @returns {Promise<Object>} - Delete result
   */
  async delete(key) {
    try {
      await this.request('DELETE', `/data/${key}`);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Delete failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Make HTTP request
   * @private
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {*} body - Request body
   * @returns {Promise<*>} - Response data
   */
  async request(method, path, body = null) {
    const url = this.baseUrl + path;
    const options = {
      method,
      headers: this.headers,
      timeout: this.timeout
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
