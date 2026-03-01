/**
 * Log Parser
 * Parses component logs for analysis
 */

import { Logger } from '../utils/logger';

export class LogParser {
  /**
   * Create a new log parser
   */
  constructor() {
    this.logger = new Logger('LogParser');
    this.logs = [];
    this.parsedEvents = [];
  }

  /**
   * Parse log file
   * @param {string} logContent - Log file content
   * @returns {Object} - Parse result
   */
  parseLog(logContent) {
    try {
      const lines = logContent.split('\n').filter((line) => line.trim());
      const events = [];
      const errors = [];

      lines.forEach((line, index) => {
        try {
          const event = JSON.parse(line);
          this.validateEvent(event);
          events.push(event);
        } catch (error) {
          errors.push({
            lineNumber: index + 1,
            content: line,
            error: error.message
          });
        }
      });

      this.parsedEvents = events;
      this.logs.push({
        timestamp: new Date().toISOString(),
        eventCount: events.length,
        errorCount: errors.length,
        events,
        errors
      });

      return {
        status: 'success',
        eventCount: events.length,
        errorCount: errors.length,
        events,
        errors
      };
    } catch (error) {
      this.logger.error('Log parsing failed', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Validate event structure
   * @private
   * @param {Object} event - Event to validate
   */
  validateEvent(event) {
    if (!event.timestamp) {
      throw new Error('Missing timestamp');
    }
    if (!event.type) {
      throw new Error('Missing event type');
    }
    if (!event.payload) {
      throw new Error('Missing payload');
    }
  }

  /**
   * Get parsed events
   * @returns {Array} - Parsed events
   */
  getParsedEvents() {
    return this.parsedEvents;
  }

  /**
   * Filter events by type
   * @param {string} type - Event type
   * @returns {Array} - Filtered events
   */
  filterByType(type) {
    return this.parsedEvents.filter((event) => event.type === type);
  }

  /**
   * Filter events by component
   * @param {string} componentId - Component ID
   * @returns {Array} - Filtered events
   */
  filterByComponent(componentId) {
    return this.parsedEvents.filter((event) => event.payload.componentId === componentId);
  }

  /**
   * Get events in time range
   * @param {string} startTime - Start time (ISO 8601)
   * @param {string} endTime - End time (ISO 8601)
   * @returns {Array} - Events in range
   */
  getEventsInRange(startTime, endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return this.parsedEvents.filter((event) => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime >= start && eventTime <= end;
    });
  }

  /**
   * Get event statistics
   * @returns {Object} - Statistics
   */
  getStatistics() {
    const stats = {
      totalEvents: this.parsedEvents.length,
      eventsByType: {},
      eventsByComponent: {},
      timeRange: null
    };

    if (this.parsedEvents.length === 0) {
      return stats;
    }

    // Count by type
    this.parsedEvents.forEach((event) => {
      stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
      const componentId = event.payload.componentId;
      if (componentId) {
        stats.eventsByComponent[componentId] = (stats.eventsByComponent[componentId] || 0) + 1;
      }
    });

    // Time range
    const times = this.parsedEvents.map((e) => new Date(e.timestamp).getTime());
    stats.timeRange = {
      start: new Date(Math.min(...times)).toISOString(),
      end: new Date(Math.max(...times)).toISOString(),
      duration: Math.max(...times) - Math.min(...times)
    };

    return stats;
  }
}
