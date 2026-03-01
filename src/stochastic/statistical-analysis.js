/**
 * Statistical Analysis
 * Analyzes results from multiple runs
 */

import { Logger } from '../utils/logger';

export class StatisticalAnalysis {
  /**
   * Create a new statistical analysis
   */
  constructor() {
    this.logger = new Logger('StatisticalAnalysis');
  }

  /**
   * Analyze run results
   * @param {Array} runs - Run results
   * @returns {Object} - Analysis results
   */
  analyze(runs) {
    const successfulRuns = runs.filter((r) => r.status === 'success');

    if (successfulRuns.length === 0) {
      return { status: 'error', message: 'No successful runs to analyze' };
    }

    return {
      status: 'success',
      summary: this.calculateSummary(successfulRuns),
      distribution: this.analyzeDistribution(successfulRuns),
      confidence: this.calculateConfidenceIntervals(successfulRuns),
      variance: this.calculateVariance(successfulRuns)
    };
  }

  /**
   * Calculate summary statistics
   * @private
   * @param {Array} runs - Successful runs
   * @returns {Object} - Summary statistics
   */
  calculateSummary(runs) {
    const durations = runs.map((r) => r.duration);
    const costs = runs.map((r) => r.simulationState.totalCost);
    const errors = runs.map((r) => r.errors.length);

    return {
      duration: this.calculateStats(durations),
      cost: this.calculateStats(costs),
      errors: this.calculateStats(errors)
    };
  }

  /**
   * Calculate basic statistics
   * @private
   * @param {Array} values - Values to analyze
   * @returns {Object} - Statistics
   */
  calculateStats(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    return { mean, median, min, max, stdDev };
  }

  /**
   * Analyze distribution
   * @private
   * @param {Array} runs - Successful runs
   * @returns {Object} - Distribution analysis
   */
  analyzeDistribution(runs) {
    const costs = runs.map((r) => r.simulationState.totalCost);
    const bins = this.createHistogram(costs, 10);

    return {
      histogram: bins,
      skewness: this.calculateSkewness(costs),
      kurtosis: this.calculateKurtosis(costs)
    };
  }

  /**
   * Create histogram
   * @private
   * @param {Array} values - Values to bin
   * @param {number} binCount - Number of bins
   * @returns {Array} - Histogram bins
   */
  createHistogram(values, binCount) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount;
    const bins = Array(binCount).fill(0);

    values.forEach((value) => {
      const binIndex = Math.floor((value - min) / binSize);
      if (binIndex < binCount) {
        bins[binIndex]++;
      }
    });

    return bins;
  }

  /**
   * Calculate skewness
   * @private
   * @param {Array} values - Values to analyze
   * @returns {number} - Skewness
   */
  calculateSkewness(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    const skewness =
      values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / values.length;
    return skewness;
  }

  /**
   * Calculate kurtosis
   * @private
   * @param {Array} values - Values to analyze
   * @returns {number} - Kurtosis
   */
  calculateKurtosis(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    const kurtosis =
      values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / values.length - 3;
    return kurtosis;
  }

  /**
   * Calculate confidence intervals
   * @private
   * @param {Array} runs - Successful runs
   * @returns {Object} - Confidence intervals
   */
  calculateConfidenceIntervals(runs) {
    const costs = runs.map((r) => r.simulationState.totalCost);
    const stats = this.calculateStats(costs);
    const n = costs.length;
    const se = stats.stdDev / Math.sqrt(n);
    const z = 1.96; // 95% confidence

    return {
      cost: {
        mean: stats.mean,
        lowerBound: stats.mean - z * se,
        upperBound: stats.mean + z * se,
        confidenceLevel: 0.95
      }
    };
  }

  /**
   * Calculate variance
   * @private
   * @param {Array} runs - Successful runs
   * @returns {Object} - Variance analysis
   */
  calculateVariance(runs) {
    const costs = runs.map((r) => r.simulationState.totalCost);
    const durations = runs.map((r) => r.duration);

    const costVariance = this.calculateStats(costs).stdDev ** 2;
    const durationVariance = this.calculateStats(durations).stdDev ** 2;

    return {
      cost: costVariance,
      duration: durationVariance,
      costCoefficient: (Math.sqrt(costVariance) / this.calculateStats(costs).mean) * 100,
      durationCoefficient: (Math.sqrt(durationVariance) / this.calculateStats(durations).mean) * 100
    };
  }
}
