/**
 * Simulation Engine - Enhanced with error handling and async support
 * Orchestrates component execution and frame-based simulation
 */

import { Executor } from './executor';
import { Timeline } from './timeline';
import { Checkpoint } from './checkpoint';
import { CostCalculator } from './cost-calculator';
import { Logger } from '../utils/logger';

export class SimulationEngine {
  /**
   * Create a new simulation engine
   * @param {Graph} graph - Component graph
   * @param {EventBus} eventBus - Global event bus
   * @param {Object} config - Engine configuration
   */
  constructor(graph, eventBus, config = {}) {
    this.graph = graph;
    this.eventBus = eventBus;
    this.config = config;
    this.logger = new Logger('SimulationEngine');

    // Initialize components
    this.executor = new Executor(graph, eventBus);
    this.timeline = new Timeline(config.maxFrames || 10000);
    this.checkpoint = new Checkpoint(config.maxCheckpoints || 100);
    this.costCalculator = new CostCalculator(config.costModels || {});

    // Simulation state
    this.state = {
      status: 'idle', // idle, running, paused, stopped
      currentFrame: 0,
      totalFrames: 0,
      startTime: null,
      endTime: null,
      componentStates: new Map(),
      totalCost: 0,
      errors: [],
      initialInputs: null,
      pendingAsyncComponents: new Set()
    };

    // Configuration
    this.globalFrameDuration = config.globalFrameDuration || 1000;
    this.autoCheckpoint = config.autoCheckpoint !== false;
    this.maxErrors = config.maxErrors || 10;
    this.errorHandlers = config.errorHandlers || {};
  }

  /**
   * Initialize simulation with inputs
   * @param {Object} initialInputs - Initial inputs for entry points
   * @returns {Object} - Initialization result
   */
  init(initialInputs) {
    try {
      // Validate inputs
      const validation = this.validateInputs(initialInputs);
      if (!validation.valid) {
        return {
          status: 'error',
          message: 'Invalid inputs',
          errors: validation.errors
        };
      }

      // Initialize all components
      this.graph.getComponents().forEach((component) => {
        component.init(this.eventBus);
      });

      // Store initial inputs
      this.state.initialInputs = initialInputs;
      this.state.status = 'idle';

      // Emit init event
      this.eventBus.emit({
        urn: 'system://simulation-engine',
        type: 'system:simulation-init',
        timestamp: new Date().toISOString(),
        payload: {
          inputCount: Object.keys(initialInputs).length
        }
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Initialization failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Start simulation
   * @returns {Object} - Start result
   */
  start() {
    if (this.state.status === 'running') {
      return { status: 'error', message: 'Simulation already running' };
    }

    if (!this.state.initialInputs) {
      return { status: 'error', message: 'Simulation not initialized' };
    }

    try {
      this.state.status = 'running';
      this.state.startTime = new Date().toISOString();
      this.state.totalFrames = 0;
      this.state.currentFrame = 0;
      this.state.errors = [];
      this.state.totalCost = 0;
      this.state.pendingAsyncComponents.clear();

      // Distribute initial inputs
      this.distributeInitialInputs();

      // Execute first frame
      this.executeFrame();

      // Emit start event
      this.eventBus.emit({
        urn: 'system://simulation-engine',
        type: 'system:simulation-start',
        timestamp: new Date().toISOString(),
        payload: {
          componentCount: this.graph.getComponents().length
        }
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Start failed', error);
      this.state.status = 'idle';
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Pause simulation
   * @returns {Object} - Pause result
   */
  pause() {
    if (this.state.status !== 'running') {
      return { status: 'error', message: 'Simulation not running' };
    }

    this.state.status = 'paused';

    // Emit pause event
    this.eventBus.emit({
      urn: 'system://simulation-engine',
      type: 'system:simulation-pause',
      timestamp: new Date().toISOString(),
      payload: {
        currentFrame: this.state.currentFrame
      }
    });

    return { status: 'success' };
  }

  /**
   * Resume simulation
   * @returns {Object} - Resume result
   */
  resume() {
    if (this.state.status !== 'paused') {
      return { status: 'error', message: 'Simulation not paused' };
    }

    this.state.status = 'running';

    // Emit resume event
    this.eventBus.emit({
      urn: 'system://simulation-engine',
      type: 'system:simulation-resume',
      timestamp: new Date().toISOString(),
      payload: {
        currentFrame: this.state.currentFrame
      }
    });

    return { status: 'success' };
  }

  /**
   * Stop simulation
   * @returns {Object} - Stop result
   */
  stop() {
    if (this.state.status === 'idle') {
      return { status: 'error', message: 'Simulation not running' };
    }

    this.state.status = 'stopped';
    this.state.endTime = new Date().toISOString();
    this.state.currentFrame = 0;

    // Emit stop event
    this.eventBus.emit({
      urn: 'system://simulation-engine',
      type: 'system:simulation-stop',
      timestamp: new Date().toISOString(),
      payload: {
          currentFrame: this.state.currentFrame,
        totalFrames: this.state.totalFrames,
        totalCost: this.state.totalCost,
        errorCount: this.state.errors.length
      }
    });

    this.eventBus.emit({
      urn: 'system://simulation-engine',
      type: 'system:frame-scrub',
      timestamp: new Date().toISOString(),
      payload: {
        currentFrame: this.state.currentFrame,
        targetFrame: this.state.currentFrame
      }
    });

    return { status: 'success' };
  }

  /**
   * Reset simulation
   * @returns {Object} - Reset result
   */
  reset() {
    try {
      // Reset all components
      this.graph.getComponents().forEach((component) => {
        component.reset();
      });

      // Reset state
      this.state.status = 'idle';
      this.state.currentFrame = 0;
      this.state.totalFrames = 0;
      this.state.startTime = null;
      this.state.endTime = null;
      this.state.componentStates.clear();
      this.state.totalCost = 0;
      this.state.errors = [];
      this.state.pendingAsyncComponents.clear();

      // Clear timeline and checkpoints
      this.timeline.clearHistory();
      this.checkpoint.clear();

      // Emit reset event
      this.eventBus.emit({
        urn: 'system://simulation-engine',
        type: 'system:simulation-reset',
        timestamp: new Date().toISOString(),
        payload: {}
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Reset failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Execute next frame
   * @returns {Object} - Execution result
   */
  nextFrame() {
    if (this.state.status === 'idle') {
      return { status: 'error', message: 'Simulation not started' };
    }

    try {
      this.executeFrame();
      return { status: 'success', frame: this.state.currentFrame };
    } catch (error) {
      this.logger.error('Frame execution failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Execute previous frame
   * @returns {Object} - Execution result
   */
  previousFrame() {
    if (this.state.currentFrame === 0) {
      return { status: 'error', message: 'Already at first frame' };
    }

    try {
      this.state.currentFrame--;
      const checkpoint = this.checkpoint.restore(this.state.currentFrame);

      if (checkpoint) {
        this.restoreCheckpoint(checkpoint);
      }

      // Emit frame change event
      this.eventBus.emit({
        urn: 'system://simulation-engine',
        type: 'system:frame-rewind',
        timestamp: new Date().toISOString(),
        payload: {
          currentFrame: this.state.currentFrame
        }
      });

      return { status: 'success', frame: this.state.currentFrame };
    } catch (error) {
      this.logger.error('Previous frame failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Jump to specific frame
   * @param {number} frameNumber - Target frame number
   * @returns {Object} - Jump result
   */
  jumpToFrame(frameNumber) {
    if (frameNumber < 0 || frameNumber > this.state.totalFrames) {
      return { status: 'error', message: 'Invalid frame number' };
    }

    try {
      this.state.currentFrame = frameNumber;
      const checkpoint = this.checkpoint.restore(frameNumber);

      if (checkpoint) {
        this.restoreCheckpoint(checkpoint);
      }

      // Emit scrub event
      this.eventBus.emit({
        urn: 'system://simulation-engine',
        type: 'system:frame-scrub',
        timestamp: new Date().toISOString(),
        payload: {
          currentFrame: this.state.currentFrame,
          targetFrame: frameNumber
        }
      });

      return { status: 'success', frame: this.state.currentFrame };
    } catch (error) {
      this.logger.error('Jump to frame failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Execute current frame
   * @private
   */
  executeFrame() {
    try {
      // Execute all components in order
      const executionOrder = this.graph.getExecutionOrder();
      const frameErrors = [];

      for (const componentId of executionOrder) {
        const component = this.graph.getComponent(componentId);
        if (!component) continue;

        try {
          // Execute component with retry logic
          const result = this.executor.executeComponent(componentId, {
            frame: this.state.currentFrame,
            globalFrameDuration: this.globalFrameDuration
          });

          if (result.status === 'error') {
            frameErrors.push({
              componentId,
              message: result.message,
              timestamp: new Date().toISOString()
            });

            // Handle error
            const errorHandled = this.handleComponentError(componentId, result);
            if (!errorHandled && result.critical) {
              this.state.status = 'paused';
              this.state.errors.push(...frameErrors);
              throw new Error(`Critical error in ${componentId}: ${result.message}`);
            }
          }

          // Calculate cost
          const cost = this.costCalculator.calculateComponentCost(componentId, this.state.currentFrame);
          this.state.totalCost += cost;

          // Update component state
          this.state.componentStates.set(componentId, component.getStateSnapshot());
        } catch (error) {
          frameErrors.push({
            componentId,
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Store errors
      if (frameErrors.length > 0) {
        this.state.errors.push(...frameErrors);
      }

      // Check error limit
      if (this.state.errors.length > this.maxErrors) {
        this.state.status = 'paused';
        throw new Error(`Max errors (${this.maxErrors}) exceeded`);
      }

      // Save checkpoint
      if (this.autoCheckpoint) {
        this.checkpoint.save(this.state.currentFrame, {
          componentStates: new Map(this.state.componentStates),
          globalState: {
            totalCost: this.state.totalCost,
            eventCount: this.eventBus.getEventCount()
          }
        });
      }

      // Advance frame
      this.state.currentFrame++;
      this.state.totalFrames = Math.max(this.state.totalFrames, this.state.currentFrame);

      // Emit frame advance event
      this.eventBus.emit({
        urn: 'system://simulation-engine',
        type: 'system:frame-advance',
        timestamp: new Date().toISOString(),
        payload: {
          currentFrame: this.state.currentFrame,
          totalCost: this.state.totalCost,
          errorCount: frameErrors.length
        }
      });
    } catch (error) {
      this.logger.error('Frame execution error', error);
      throw error;
    }
  }

  /**
   * Handle component error
   * @private
   * @param {string} componentId - Component ID
   * @param {Object} error - Error result
   * @returns {boolean} - True if handled
   */
  handleComponentError(componentId, error) {
    // Check for component-level handler
    const component = this.graph.getComponent(componentId);
    if (component && component.hooks.onError) {
      try {
        component.hooks.onError(component, error);
        return true;
      } catch (e) {
        this.logger.error('Component error handler failed', e);
      }
    }

    // Check for global handler
    if (this.errorHandlers.onComponentError) {
      try {
        this.errorHandlers.onComponentError(componentId, error);
        return true;
      } catch (e) {
        this.logger.error('Global error handler failed', e);
      }
    }

    return false;
  }

  /**
   * Distribute initial inputs to entry points
   * @private
   */
  distributeInitialInputs() {
    Object.entries(this.state.initialInputs).forEach(([entryPointId, data]) => {
      const component = this.graph.getComponent(entryPointId);
      if (component) {
        // Find input port
        const inputPort = component.inputPorts[0];
        if (inputPort) {
          component.receiveInput(inputPort.name, data);
        }
      }
    });
  }

  /**
   * Validate initial inputs
   * @private
   * @param {Object} inputs - Inputs to validate
   * @returns {Object} - Validation result
   */
  validateInputs(inputs) {
    const errors = [];

    if (!inputs || typeof inputs !== 'object') {
      errors.push('Inputs must be an object');
    }

    Object.entries(inputs || {}).forEach(([componentId, data]) => {
      const component = this.graph.getComponent(componentId);
      if (!component) {
        errors.push(`Component '${componentId}' not found`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Restore state from checkpoint
   * @private
   * @param {Object} checkpoint - Checkpoint to restore
   */
  restoreCheckpoint(checkpoint) {
    checkpoint.componentStates.forEach((state, componentId) => {
      const component = this.graph.getComponent(componentId);
      if (component) {
        component.restoreStateSnapshot(state);
      }
    });

    this.state.totalCost = checkpoint.globalState.totalCost;
  }

  /**
   * Get current simulation state
   * @returns {Object} - Current state
   */
  getSimulationState() {
    return {
      status: this.state.status,
      currentFrame: this.state.currentFrame,
      totalFrames: this.state.totalFrames,
      totalCost: this.state.totalCost,
      errorCount: this.state.errors.length,
      componentCount: this.graph.getComponents().length,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      pendingAsyncCount: this.state.pendingAsyncComponents.size
    };
  }

  /**
   * Get current frame number
   * @returns {number} - Current frame
   */
  getCurrentFrame() {
    return this.state.currentFrame;
  }

  /**
   * Get total frame count
   * @returns {number} - Total frames
   */
  getFrameCount() {
    return this.state.totalFrames;
  }

  /**
   * Get component state at current frame
   * @param {string} componentId - Component ID
   * @returns {Object} - Component state
   */
  getComponentState(componentId) {
    return this.state.componentStates.get(componentId);
  }

  /**
   * Get all errors
   * @returns {Array} - Errors
   */
  getErrors() {
    return this.state.errors;
  }

  /**
   * Get total cost
   * @returns {number} - Total cost
   */
  getTotalCost() {
    return this.state.totalCost;
  }
}
