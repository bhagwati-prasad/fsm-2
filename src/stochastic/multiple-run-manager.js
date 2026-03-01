/**
 * Multiple Run Manager
 * Manages multiple simulation runs with stochastic properties
 */

import { Logger } from '../utils/logger';

export class MultipleRunManager {
  /**
   * Create a new multiple run manager
   * @param {SimulationEngine} engine - Simulation engine
   * @param {StochasticConfig} stochasticConfig - Stochastic configuration
   * @param {EventBus} eventBus - Event bus
   */
  constructor(engine, stochasticConfig, eventBus) {
    this.logger = new Logger('MultipleRunManager');
    this.engine = engine;
    this.stochasticConfig = stochasticConfig;
    this.eventBus = eventBus;
    this.runs = [];
    this.currentRunIndex = 0;
    this.isRunning = false;
  }

  /**
   * Execute multiple runs
   * @param {number} runCount - Number of runs
   * @param {Object} initialInputs - Initial inputs
   * @returns {Promise<Object>} - Execution result
   */
  async executeMultipleRuns(runCount, initialInputs) {
    try {
      this.runs = [];
      this.currentRunIndex = 0;
      this.isRunning = true;

      this.eventBus.emit({
        urn: 'system://multiple-runs',
        type: 'system:multiple-runs-started',
        timestamp: new Date().toISOString(),
        payload: { runCount }
      });

      for (let i = 0; i < runCount; i++) {
        this.currentRunIndex = i;
        const runResult = await this.executeSingleRun(i, initialInputs);
        this.runs.push(runResult);

        this.eventBus.emit({
          urn: 'system://multiple-runs',
          type: 'system:run-completed',
          timestamp: new Date().toISOString(),
          payload: {
            runNumber: i + 1,
            totalRuns: runCount,
            result: runResult
          }
        });
      }

      this.isRunning = false;

      this.eventBus.emit({
        urn: 'system://multiple-runs',
        type: 'system:multiple-runs-completed',
        timestamp: new Date().toISOString(),
        payload: {
          totalRuns: runCount,
          results: this.runs
        }
      });

      return { status: 'success', runs: this.runs };
    } catch (error) {
      this.logger.error('Multiple runs execution failed', error);
      this.isRunning = false;
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Execute single run
   * @private
   * @param {number} runNumber - Run number
   * @param {Object} initialInputs - Initial inputs
   * @returns {Promise<Object>} - Run result
   */
  async executeSingleRun(runNumber, initialInputs) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Generate stochastic values
      const stochasticValues = {};
      this.engine.graph.getComponents().forEach((component) => {
        stochasticValues[component.id] = this.stochasticConfig.generateAllValues(component.id);
      });

      // Initialize and run simulation
      const initResult = this.engine.init(initialInputs);
      if (initResult.status !== 'success') {
        resolve({
          runNumber,
          status: 'error',
          message: initResult.message
        });
        return;
      }

      const startResult = this.engine.start();
      if (startResult.status !== 'success') {
        resolve({
          runNumber,
          status: 'error',
          message: startResult.message
        });
        return;
      }

      // Wait for simulation to complete
      const checkCompletion = setInterval(() => {
        const state = this.engine.getSimulationState();
        if (state.status === 'stopped') {
          clearInterval(checkCompletion);
          const duration = Date.now() - startTime;

          resolve({
            runNumber,
            status: 'success',
            duration,
            stochasticValues,
            simulationState: state,
            errors: this.engine.getErrors()
          });
        }
      }, 100);

      // Reset for next run
      this.engine.reset();
    });
  }

  /**
   * Get run results
   * @returns {Array} - Run results
   */
  getRunResults() {
    return this.runs;
  }

  /**
   * Get run statistics
   * @returns {Object} - Statistics
   */
  getRunStatistics() {
    if (this.runs.length === 0) {
      return null;
    }

    const successfulRuns = this.runs.filter((r) => r.status === 'success');
    const durations = successfulRuns.map((r) => r.duration);
    const costs = successfulRuns.map((r) => r.simulationState.totalCost);

    return {
      totalRuns: this.runs.length,
      successfulRuns: successfulRuns.length,
      failedRuns: this.runs.length - successfulRuns.length,
      duration: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        average: durations.reduce((a, b) => a + b, 0) / durations.length
      },
      cost: {
        min: Math.min(...costs),
        max: Math.max(...costs),
        average: costs.reduce((a, b) => a + b, 0) / costs.length
      }
    };
  }
}
