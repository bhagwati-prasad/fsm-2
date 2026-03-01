/**
 * Bottleneck Detector
 * Identifies performance bottlenecks
 */

import { Logger } from '../utils/logger';

export class BottleneckDetector {
  /**
   * Create a new bottleneck detector
   */
  constructor() {
    this.logger = new Logger('BottleneckDetector');
    this.bottlenecks = [];
  }

  /**
   * Detect bottlenecks
   * @param {Object} metrics - Metrics object
   * @returns {Array} - Detected bottlenecks
   */
  detect(metrics) {
    this.bottlenecks = [];

    // Detect high latency
    this.detectHighLatency(metrics);

    // Detect high error rate
    this.detectHighErrorRate(metrics);

    // Detect slow components
    this.detectSlowComponents(metrics);

    // Detect data transfer bottlenecks
    this.detectDataTransferBottlenecks(metrics);

    return this.bottlenecks;
  }

  /**
   * Detect high latency
   * @private
   * @param {Object} metrics - Metrics object
   */
  detectHighLatency(metrics) {
    const latency = metrics.latency;
    const threshold = 1000; // 1 second

    if (parseFloat(latency.average) > threshold) {
      this.bottlenecks.push({
        type: 'high-latency',
        severity: 'high',
        message: `Average latency is ${latency.average}ms (threshold: ${threshold}ms)`,
        metric: latency
      });
    }
  }

  /**
   * Detect high error rate
   * @private
   * @param {Object} metrics - Metrics object
   */
  detectHighErrorRate(metrics) {
    const errorRate = metrics.errorRate;
    const threshold = 5; // 5%

    if (parseFloat(errorRate.errorRate) > threshold) {
      this.bottlenecks.push({
        type: 'high-error-rate',
        severity: 'critical',
        message: `Error rate is ${errorRate.errorRate}% (threshold: ${threshold}%)`,
        metric: errorRate
      });
    }
  }

  /**
   * Detect slow components
   * @private
   * @param {Object} metrics - Metrics object
   */
  detectSlowComponents(metrics) {
    const componentMetrics = metrics.componentMetrics;
    const avgStateChanges = this.calculateAverageStateChanges(componentMetrics);

    Object.entries(componentMetrics).forEach(([componentId, data]) => {
      if (data.stateChanges < avgStateChanges * 0.5) {
        this.bottlenecks.push({
          type: 'slow-component',
          severity: 'medium',
          message: `Component ${componentId} has low state change rate (${data.stateChanges} vs avg ${avgStateChanges.toFixed(0)})`,
          componentId,
          metric: data
        });
      }
    });
  }

  /**
   * Detect data transfer bottlenecks
   * @private
   * @param {Object} metrics - Metrics object
   */
  detectDataTransferBottlenecks(metrics) {
    const dataBusMetrics = metrics.dataBusMetrics;
    const avgTransfers = this.calculateAverageTransfers(dataBusMetrics);

    Object.entries(dataBusMetrics).forEach(([key, data]) => {
      if (data.transferCount < avgTransfers * 0.5) {
        this.bottlenecks.push({
          type: 'low-throughput',
          severity: 'medium',
          message: `DataBus ${key} has low transfer rate (${data.transferCount} vs avg ${avgTransfers.toFixed(0)})`,
          dataBusId: key,
          metric: data
        });
      }
    });
  }

  /**
   * Calculate average state changes
   * @private
   * @param {Object} componentMetrics - Component metrics
   * @returns {number} - Average state changes
   */
  calculateAverageStateChanges(componentMetrics) {
    const values = Object.values(componentMetrics).map((m) => m.stateChanges);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Calculate average transfers
   * @private
   * @param {Object} dataBusMetrics - DataBus metrics
   * @returns {number} - Average transfers
   */
  calculateAverageTransfers(dataBusMetrics) {
    const values = Object.values(dataBusMetrics).map((m) => m.transferCount);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Get bottlenecks
   * @returns {Array} - Detected bottlenecks
   */
  getBottlenecks() {
    return this.bottlenecks;
  }

  /**
   * Get bottlenecks by severity
   * @param {string} severity - Severity level
   * @returns {Array} - Filtered bottlenecks
   */
  getByServerity(severity) {
    return this.bottlenecks.filter((b) => b.severity === severity);
  }
}
