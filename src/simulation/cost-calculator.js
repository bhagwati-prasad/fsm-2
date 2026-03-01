/**
 * Cost Calculator
 * Calculates and tracks simulation costs
 */

import { Logger } from '../utils/logger';

export class CostCalculator {
  /**
   * Create a new cost calculator
   * @param {Object} costModels - Cost models by component type
   */
  constructor(costModels = {}) {
    this.costModels = costModels;
    this.logger = new Logger('CostCalculator');
    this.transfers = new Map();
    this.executions = new Map();
  }

  /**
   * Calculate component cost for a frame
   * @param {string} componentId - Component ID
   * @param {number} frameNumber - Frame number
   * @returns {number} - Cost
   */
  calculateComponentCost(componentId, frameNumber) {
    // Default cost is 0
    return 0;
  }

  /**
   * Calculate DataBus transfer cost
   * @param {string} dataBusId - DataBus ID
   * @param {number} dataSize - Data size in bytes
   * @returns {number} - Cost
   */
  calculateDataBusCost(dataBusId, dataSize) {
    // Default cost is 0
    return 0;
  }

  /**
   * Calculate total simulation cost
   * @param {Object} simulation - Simulation state
   * @returns {number} - Total cost
   */
  calculateTotalCost(simulation) {
    let totalCost = 0;

    // Sum all transfer costs
    this.transfers.forEach((cost) => {
      totalCost += cost;
    });

    // Sum all execution costs
    this.executions.forEach((cost) => {
      totalCost += cost;
    });

    return totalCost;
  }

  /**
   * Track data transfer
   * @param {string} dataBusId - DataBus ID
   * @param {number} dataSize - Data size in bytes
   */
  trackTransfer(dataBusId, dataSize) {
    const cost = this.calculateDataBusCost(dataBusId, dataSize);
    if (!this.transfers.has(dataBusId)) {
      this.transfers.set(dataBusId, 0);
    }
    this.transfers.set(dataBusId, this.transfers.get(dataBusId) + cost);
  }

  /**
   * Track component execution
   * @param {string} componentId - Component ID
   * @param {number} duration - Execution duration in ms
   */
  trackComponentExecution(componentId, duration) {
    if (!this.executions.has(componentId)) {
      this.executions.set(componentId, 0);
    }
    // Cost based on duration (example: $0.001 per second)
    const cost = (duration / 1000) * 0.001;
    this.executions.set(componentId, this.executions.get(componentId) + cost);
  }

  /**
   * Get cost breakdown
   * @returns {Object} - Cost breakdown
   */
  getCostBreakdown() {
    return {
      transfers: Object.fromEntries(this.transfers),
      executions: Object.fromEntries(this.executions),
      total: this.calculateTotalCost({})
    };
  }

  /**
   * Get cost by component
   * @returns {Object} - Cost by component
   */
  getCostByComponent() {
    return Object.fromEntries(this.executions);
  }

  /**
   * Get cost by DataBus
   * @returns {Object} - Cost by DataBus
   */
  getCostByDataBus() {
    return Object.fromEntries(this.transfers);
  }

  /**
   * Register cost model
   * @param {string} componentType - Component type
   * @param {Object} model - Cost model
   */
  registerCostModel(componentType, model) {
    this.costModels[componentType] = model;
  }

  /**
   * Get cost model
   * @param {string} componentType - Component type
   * @returns {Object} - Cost model
   */
  getCostModel(componentType) {
    return this.costModels[componentType] || null;
  }

  /**
   * Clear all costs
   */
  clear() {
    this.transfers.clear();
    this.executions.clear();
  }
}
