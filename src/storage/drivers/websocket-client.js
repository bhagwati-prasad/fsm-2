/**
 * WebSocket Client Driver
 * Real-time sync with WebSocket server
 */

import { Logger } from '../../utils/logger';

export class WebSocketClient {
  /**
   * Create a new WebSocket client
   * @param {string} url - WebSocket URL
   * @param {Object} config - Configuration
   */
  constructor(url, config = {}) {
    this.logger = new Logger('WebSocketClient');
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = config.reconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 1000;
    this.messageHandlers = new Map();
    this.isConnected = false;
  }

  /**
   * Connect to WebSocket server
   * @returns {Promise<void>}
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.logger.info('WebSocket connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          this.logger.error('WebSocket error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.logger.info('WebSocket disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }

  /**
   * Save data via WebSocket
   * @param {string} key - Data key
   * @param {*} data - Data to save
   * @returns {Promise<Object>} - Save result
   */
  async save(key, data) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      return new Promise((resolve, reject) => {
        const messageId = this.generateMessageId();
        this.messageHandlers.set(messageId, (response) => {
          if (response.status === 'success') {
            resolve({ status: 'success' });
          } else {
            reject(new Error(response.message));
          }
        });

        this.ws.send(
          JSON.stringify({
            id: messageId,
            type: 'save',
            key,
            data
          })
        );

        // Timeout after 30s
        setTimeout(() => {
          this.messageHandlers.delete(messageId);
          reject(new Error('Request timeout'));
        }, 30000);
      });
    } catch (error) {
      this.logger.error(`Save failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Load data via WebSocket
   * @param {string} key - Data key
   * @returns {Promise<*>} - Loaded data
   */
  async load(key) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      return new Promise((resolve, reject) => {
        const messageId = this.generateMessageId();
        this.messageHandlers.set(messageId, (response) => {
          if (response.status === 'success') {
            resolve(response.data);
          } else {
            reject(new Error(response.message));
          }
        });

        this.ws.send(
          JSON.stringify({
            id: messageId,
            type: 'load',
            key
          })
        );

        // Timeout after 30s
        setTimeout(() => {
          this.messageHandlers.delete(messageId);
          reject(new Error('Request timeout'));
        }, 30000);
      });
    } catch (error) {
      this.logger.error(`Load failed for key '${key}'`, error);
      return null;
    }
  }

  /**
   * Delete data via WebSocket
   * @param {string} key - Data key
   * @returns {Promise<Object>} - Delete result
   */
  async delete(key) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      return new Promise((resolve, reject) => {
        const messageId = this.generateMessageId();
        this.messageHandlers.set(messageId, (response) => {
          if (response.status === 'success') {
            resolve({ status: 'success' });
          } else {
            reject(new Error(response.message));
          }
        });

        this.ws.send(
          JSON.stringify({
            id: messageId,
            type: 'delete',
            key
          })
        );

        // Timeout after 30s
        setTimeout(() => {
          this.messageHandlers.delete(messageId);
          reject(new Error('Request timeout'));
        }, 30000);
      });
    } catch (error) {
      this.logger.error(`Delete failed for key '${key}'`, error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Handle incoming message
   * @private
   * @param {Object} message - Message object
   */
  handleMessage(message) {
    const handler = this.messageHandlers.get(message.id);
    if (handler) {
      handler(message);
      this.messageHandlers.delete(message.id);
    }
  }

  /**
   * Generate unique message ID
   * @private
   * @returns {string} - Message ID
   */
  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
