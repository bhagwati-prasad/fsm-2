/**
 * Performance Monitor
 * Tracks performance metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Start measuring
   * @param {string} label - Measurement label
   */
  start(label) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label).push({
      startTime: performance.now()
    });
  }

  /**
   * End measuring
   * @param {string} label - Measurement label
   * @returns {number} - Duration in milliseconds
   */
  end(label) {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) {
      return 0;
    }

    const current = measurements[measurements.length - 1];
    const duration = performance.now() - current.startTime;
    current.duration = duration;
    return duration;
  }

  /**
   * Get metrics for label
   * @param {string} label - Measurement label
   * @returns {Object} - Metrics {count, total, average, min, max}
   */
  getMetrics(label) {
    const measurements = this.metrics.get(label) || [];
    const durations = measurements
      .filter((m) => m.duration !== undefined)
      .map((m) => m.duration);

    if (durations.length === 0) {
      return null;
    }

    return {
      count: durations.length,
      total: durations.reduce((a, b) => a + b, 0),
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }

  /**
   * Clear metrics
   * @param {string} [label] - Optional label to clear specific metrics
   */
  clear(label) {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}
