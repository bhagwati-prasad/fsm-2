/**
 * Global Event Bus
 * Manages event emission, subscription, and bubbling
 */

export class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.eventLog = [];
    this.maxLogSize = 10000;
  }

  /**
   * Subscribe to events
   * @param {string} eventType - Event type to subscribe to (supports wildcards)
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType).delete(callback);
    };
  }

  /**
   * Emit event
   * @param {Object} event - Event object
   * @param {string} event.urn - Component URN
   * @param {string} event.type - Event type (namespaced)
   * @param {string} event.timestamp - Event timestamp
   * @param {Object} event.payload - Event payload
   */
  emit(event) {
    // Add metadata
    event.id = this.generateEventId();
    event.bubbled = event.bubbled || false;

    // Log event
    this.logEvent(event);

    // Notify subscribers
    this.notifySubscribers(event);
  }

  /**
   * Notify subscribers of event
   * @private
   * @param {Object} event - Event object
   */
  notifySubscribers(event) {
    // Exact match subscribers
    if (this.subscribers.has(event.type)) {
      this.subscribers.get(event.type).forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event subscriber for ${event.type}:`, error);
        }
      });
    }

    // Wildcard subscribers (e.g., 'component:*')
    const namespace = event.type.split(':')[0];
    const wildcardType = `${namespace}:*`;
    if (this.subscribers.has(wildcardType)) {
      this.subscribers.get(wildcardType).forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event subscriber for ${wildcardType}:`, error);
        }
      });
    }

    // All events wildcard
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event subscriber for *:', error);
        }
      });
    }
  }

  /**
   * Log event to event log
   * @private
   * @param {Object} event - Event object
   */
  logEvent(event) {
    this.eventLog.push({
      ...event,
      logIndex: this.eventLog.length
    });

    // Trim log if too large
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }
  }

  /**
   * Get event log
   * @param {Object} filter - Filter options
   * @param {string} [filter.type] - Filter by event type
   * @param {string} [filter.urn] - Filter by component URN
   * @param {number} [filter.startIndex] - Start index
   * @param {number} [filter.endIndex] - End index
   * @returns {Array} - Filtered event log
   */
  getEventLog(filter = {}) {
    let log = this.eventLog;

    if (filter.type) {
      log = log.filter((e) => e.type === filter.type);
    }

    if (filter.urn) {
      log = log.filter((e) => e.urn === filter.urn);
    }

    if (filter.startIndex !== undefined && filter.endIndex !== undefined) {
      log = log.slice(filter.startIndex, filter.endIndex);
    }

    return log;
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Generate unique event ID
   * @private
   * @returns {string} - Event ID
   */
  generateEventId() {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get event count
   * @returns {number} - Number of events in log
   */
  getEventCount() {
    return this.eventLog.length;
  }
}
