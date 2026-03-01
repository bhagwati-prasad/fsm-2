/**
 * Logger utility
 * Provides logging functionality
 */

export class Logger {
  constructor(name = 'FSMTool') {
    this.name = name;
    this.level = 'info';
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  /**
   * Set log level
   * @param {string} level - Log level (debug, info, warn, error)
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  debug(message, data) {
    if (this.levels[this.level] <= this.levels.debug) {
      console.debug(`[${this.name}] ${message}`, data || '');
    }
  }

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  info(message, data) {
    if (this.levels[this.level] <= this.levels.info) {
      console.info(`[${this.name}] ${message}`, data || '');
    }
  }

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  warn(message, data) {
    if (this.levels[this.level] <= this.levels.warn) {
      console.warn(`[${this.name}] ${message}`, data || '');
    }
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   */
  error(message, data) {
    if (this.levels[this.level] <= this.levels.error) {
      console.error(`[${this.name}] ${message}`, data || '');
    }
  }
}
