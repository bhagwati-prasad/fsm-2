/**
 * Metrics Calculator
 * Calculates performance metrics from events
 */

import { Logger } from '../utils/logger';

export class Metrics {
  /**
   * Create a new metrics calculator
   */
  constructor() {
    this.logger = new Logger('Metrics');
    this.events = [];
    this.metrics = {};
  }

  /**
   * Calculate metrics from events
   * @param {Array} events - Events to analyze
   * @returns {Object} - Calculated metrics
   */
  calculate(events) {
    this.events = events;
    this.metrics = {
      throughput: this.calculateThroughput(),
      latency: this.calculateLatency(),
      errorRate: this.calculateErrorRate(),
      componentMetrics: this.calculateComponentMetrics(),
      dataBusMetrics: this.calculateDataBusMetrics()
    };

    return this.metrics;
  }

  /**
   * Calculate throughput
   * @private
   * @returns {Object} - Throughput metrics
   */
  calculateThroughput() {
    if (this.events.length === 0) {
      return { eventsPerSecond: 0, totalEvents: 0 };
    }

    const times = this.events.map((e) => new Date(e.timestamp).getTime());
    const duration = (Math.max(...times) - Math.min(...times)) / 1000;
    const throughput = duration > 0 ? this.events.length / duration : 0;

    return {
      eventsPerSecond: throughput.toFixed(2),
      totalEvents: this.events.length,
      duration: duration.toFixed(2)
    };
  }

  /**
   * Calculate latency
   * @private
   * @returns {Object} - Latency metrics
   */
  calculateLatency() {
    const stateChanges = this.events.filter((e) => e.type === 'component:state-change');
    if (stateChanges.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }

    const latencies = [];
    for (let i = 0; i < stateChanges.length - 1; i++) {
      const current = new Date(stateChanges[i].timestamp).getTime();
      const next = new Date(stateChanges[i + 1].timestamp).getTime();
      latencies.push(next - current);
    }

    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const average = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      average: average.toFixed(2),
      unit: 'ms'
    };
  }

  /**
   * Calculate error rate
   * @private
   * @returns {Object} - Error rate metrics
   */
  calculateErrorRate() {
    const errors = this.events.filter((e) => e.type.includes('error'));
    const errorRate = this.events.length > 0 ? (errors.length / this.events.length) * 100 : 0;

    return {
      errorCount: errors.length,
      totalEvents: this.events.length,
      errorRate: errorRate.toFixed(2),
      unit: '%'
    };
  }

  /**
   * Calculate component metrics
   * @private
   * @returns {Object} - Component metrics
   */
  calculateComponentMetrics() {
    const componentMetrics = {};

    this.events.forEach((event) => {
      const componentId = event.payload.componentId;
      if (!componentId) return;

      if (!componentMetrics[componentId]) {
        componentMetrics[componentId] = {
          eventCount: 0,
          stateChanges: 0,
          errors: 0
        };
      }

      componentMetrics[componentId].eventCount++;

      if (event.type === 'component:state-change') {
        componentMetrics[componentId].stateChanges++;
      }
      if (event.type.includes('error')) {
        componentMetrics[componentId].errors++;
      }
    });

    return componentMetrics;
  }

  /**
   * Calculate DataBus metrics
   * @private
   * @returns {Object} - DataBus metrics
   */
  calculateDataBusMetrics() {
    const transfers = this.events.filter((e) => e.type === 'databus:transfer');
    const dataBusMetrics = {};

    transfers.forEach((event) => {
      const source = event.payload.source;
      const target = event.payload.target;
      const key = `${source}-${target}`;

      if (!dataBusMetrics[key]) {
        dataBusMetrics[key] = {
          transferCount: 0,
          totalDataSize: 0
        };
      }

      dataBusMetrics[key].transferCount++;
      dataBusMetrics[key].totalDataSize += event.payload.dataSize || 0;
    });

    return dataBusMetrics;
  }

  /**
   * Get metrics
   * @returns {Object} - Calculated metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Get component metrics
   * @param {string} componentId - Component ID
   * @returns {Object} - Component metrics
   */
  getComponentMetrics(componentId) {
    return this.metrics.componentMetrics?.[componentId] || null;
  }
}
