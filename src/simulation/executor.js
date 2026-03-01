/**
 * Executor - Enhanced with async support and retry logic
 * Executes individual components and manages data flow
 */

import { Logger } from '../utils/logger';

export class Executor {
  /**
   * Create a new executor
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Global event bus
   */
  constructor(graph, eventBus) {
    this.graph = graph;
    this.eventBus = eventBus;
    this.logger = new Logger('Executor');
    this.executionOrder = graph.getExecutionOrder();
    this.asyncExecutions = new Map();
    this.retryQueue = [];
  }

  /**
   * Execute a component
   * @param {string} componentId - Component ID
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async executeComponent(componentId, context = {}) {
    try {
      const component = this.graph.getComponent(componentId);
      if (!component) {
        return { status: 'error', message: `Component '${componentId}' not found` };
      }

      // Check if component is in waiting state
      if (component.state.currentState === 'waiting') {
        // Check if all required inputs received
        const allInputsReceived = Array.from(component.requiredInputs).every(
          (port) => component.receivedInputs.has(port) && component.receivedInputs.get(port).length > 0
        );

        if (!allInputsReceived) {
          return { status: 'waiting', message: 'Waiting for inputs' };
        }
      }

      // Check if component is already executing (async)
      if (component.isExecuting && component.asyncExecution) {
        return { status: 'async-pending', message: 'Async execution in progress' };
      }

      // Execute component
      let result;
      if (component.asyncExecution) {
        result = await this.executeAsync(component, context);
      } else {
        result = await component.execute(context);
      }

      // Route outputs to connected components
      if (result.status === 'success') {
        this.routeOutputs(componentId, result);
      }

      return result;
    } catch (error) {
      this.logger.error(`Execution failed for ${componentId}`, error);
      return {
        status: 'error',
        message: error.message,
        critical: error.critical || false
      };
    }
  }

  /**
   * Execute async component
   * @private
   * @param {Component} component - Component to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async executeAsync(component, context) {
    try {
      // Set async execution flag
      component.isExecuting = true;

      // Execute with timeout
      const timeout = component.timeout || 30000;
      const result = await Promise.race([
        component.execute(context),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        )
      ]);

      component.isExecuting = false;
      return result;
    } catch (error) {
      component.isExecuting = false;
      return {
        status: 'error',
        message: error.message,
        critical: false
      };
    }
  }

  /**
   * Execute component with retry logic
   * @param {string} componentId - Component ID
   * @param {number} maxRetries - Maximum retries
   * @returns {Promise<Object>} - Execution result
   */
  async executeWithRetry(componentId, maxRetries = 3) {
    const component = this.graph.getComponent(componentId);
    if (!component) {
      return { status: 'error', message: `Component '${componentId}' not found` };
    }

    let lastError = null;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const result = await this.executeComponent(componentId, {});

        if (result.status === 'success') {
          return result;
        }

        if (result.critical) {
          return result;
        }

        lastError = result;
        retryCount++;

        // Emit retry event
        this.eventBus.emit({
          urn: component.urn,
          type: 'component:retry',
          timestamp: new Date().toISOString(),
          payload: {
            componentId,
            retryCount,
            maxRetries,
            reason: result.message
          }
        });

        // Wait before retry
        if (retryCount <= maxRetries) {
          await this.delay(component.retryDelay || 1000);
        }
      } catch (error) {
        lastError = error;
        retryCount++;
      }
    }

    return {
      status: 'error',
      message: `Max retries (${maxRetries}) exceeded`,
      lastError: lastError?.message,
      critical: true
    };
  }

  /**
   * Route component outputs to connected components
   * @private
   * @param {string} sourceId - Source component ID
   * @param {Object} result - Execution result
   */
  routeOutputs(sourceId, result) {
    const outgoingConnections = this.graph.getOutgoingConnections(sourceId);

    outgoingConnections.forEach((connection) => {
      const targetComponent = this.graph.getComponent(connection.target);
      if (!targetComponent) return;

      // Get output data from result
      const outputData = result.outputs || {};
      const dataToRoute = outputData[connection.channel] || result.data;

      if (dataToRoute !== undefined) {
        // Find target input port
        const targetInputPort = targetComponent.inputPorts[0];
        if (targetInputPort) {
          targetComponent.receiveInput(targetInputPort.name, dataToRoute);

          // Emit data transfer event
          this.eventBus.emit({
            urn: `databus://${connection.id}`,
            type: 'databus:transfer',
            timestamp: new Date().toISOString(),
            payload: {
              source: sourceId,
              target: connection.target,
              channel: connection.channel,
              dataSize: this.estimateDataSize(dataToRoute)
            }
          });
        }
      }
    });
  }

  /**
   * Estimate data size
   * @private
   * @param {*} data - Data to estimate
   * @returns {number} - Estimated size in bytes
   */
  estimateDataSize(data) {
    if (typeof data === 'string') {
      return data.length;
    }
    if (typeof data === 'object') {
      return JSON.stringify(data).length;
    }
    return 1;
  }

  /**
   * Delay execution
   * @private
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get execution order
   * @returns {Array} - Component IDs in execution order
   */
  getExecutionOrder() {
    return this.executionOrder;
  }

  /**
   * Get component state
   * @param {string} componentId - Component ID
   * @returns {Object} - Component state
   */
  getComponentState(componentId) {
    const component = this.graph.getComponent(componentId);
    return component ? component.getStateSnapshot() : null;
  }

  /**
   * Check if component is executing
   * @param {string} componentId - Component ID
   * @returns {boolean} - True if executing
   */
  isComponentExecuting(componentId) {
    const component = this.graph.getComponent(componentId);
    return component ? component.isExecuting : false;
  }
}
