/**
 * Base Component class
 * Represents a component in the FSM system
 */

import { StateMachine } from './state-machine';
import { URNGenerator } from '../utils/urn-generator';

export class Component {
  /**
   * Create a new component
   * @param {Object} config - Component configuration
   * @param {string} config.id - Unique component ID within scope
   * @param {string} config.name - Component name
   * @param {string} config.type - Component type (e.g., 'database', 'compute')
   * @param {Object} config.ports - Port definitions {input: [], output: []}
   * @param {Object} config.stateMachine - State machine definition
   * @param {Object} config.config - Component-specific configuration
   * @param {Object} config.costModel - Cost model definition
   * @param {string} [config.parentId] - Parent component ID for nested components
   * @param {string} [config.graphScope] - Graph scope (default: 'root')
   */
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.ports = config.ports || { input: [], output: [] };
    this.config = config.config || {};
    this.costModel = config.costModel || {};
    this.parentId = config.parentId || null;
    this.graphScope = config.graphScope || 'root';

    // Generate URN
    this.urn = URNGenerator.generate({
      componentId: this.id,
      parentId: this.parentId,
      graphScope: this.graphScope
    });

    // Initialize state machine
    this.stateMachine = new StateMachine(config.stateMachine);

    // Component state
    this.state = {
      id: this.id,
      urn: this.urn,
      currentState: this.stateMachine.initialState,
      lastStateChange: new Date().toISOString(),
      ...config.initialState
    };

    // Metadata
    this.metadata = {
      title: config.title || this.name,
      description: config.description || '',
      metadata: config.metadata || {}
    };

    // Lifecycle hooks
    this.hooks = {
      onInit: config.onInit || (() => {}),
      onStateChange: config.onStateChange || (() => {}),
      onExecute: config.onExecute || (() => {}),
      onError: config.onError || (() => {}),
      onDestroy: config.onDestroy || (() => {})
    };

    // Execution properties
    this.asyncExecution = config.asyncExecution || false;
    this.frameDuration = config.frameDuration || null;
    this.maxRetries = config.maxRetries || 0;
    this.retryDelay = config.retryDelay || 0;
    this.timeout = config.timeout || null;

    // Input tracking
    this.inputPorts = this.ports.input || [];
    this.outputPorts = this.ports.output || [];
    this.requiredInputs = new Set(
      this.inputPorts
        .filter((p) => p.cardinality === 'single')
        .map((p) => p.name)
    );
    this.receivedInputs = new Map();

    // Execution state
    this.isInitialized = false;
    this.isExecuting = false;
    this.retryCount = 0;
  }

  /**
   * Initialize component
   * @param {EventBus} eventBus - Global event bus
   */
  init(eventBus) {
    if (this.isInitialized) {
      return;
    }

    this.eventBus = eventBus;
    this.isInitialized = true;

    // Call init hook
    this.hooks.onInit(this);

    // Emit init event
    this.eventBus.emit({
      urn: this.urn,
      type: 'component:init',
      timestamp: new Date().toISOString(),
      payload: {
        componentId: this.id,
        componentType: this.type
      }
    });
  }

  /**
   * Transition to new state
   * @param {string} newState - New state name
   * @param {Object} payload - State transition payload
   * @returns {boolean} - True if transition successful
   */
  transitionState(newState, payload = {}) {
    if (!this.stateMachine.canTransition(this.state.currentState, newState)) {
      return false;
    }

    const oldState = this.state.currentState;
    this.state.currentState = newState;
    this.state.lastStateChange = new Date().toISOString();

    // Call state change hook
    this.hooks.onStateChange(this, oldState, newState, payload);

    // Emit state change event
    if (this.eventBus) {
      this.eventBus.emit({
        urn: this.urn,
        type: 'component:state-change',
        timestamp: new Date().toISOString(),
        payload: {
          componentId: this.id,
          oldState,
          newState,
          ...payload
        }
      });
    }

    return true;
  }

  /**
   * Receive input on a port
   * @param {string} portName - Input port name
   * @param {*} data - Input data
   */
  receiveInput(portName, data) {
    if (!this.receivedInputs.has(portName)) {
      this.receivedInputs.set(portName, []);
    }

    this.receivedInputs.get(portName).push(data);

    // Check if all required inputs received
    if (this.requiredInputs.size > 0) {
      const allReceived = Array.from(this.requiredInputs).every((port) =>
        this.receivedInputs.has(port) && this.receivedInputs.get(port).length > 0
      );

      if (allReceived && this.state.currentState === 'waiting') {
        this.transitionState('processing', { reason: 'all-inputs-received' });
      }
    } else if (this.state.currentState === 'idle') {
      // Single input component, transition to processing
      this.transitionState('processing', { reason: 'input-received' });
    }
  }

  /**
   * Get received input
   * @param {string} portName - Input port name
   * @returns {*} - Input data
   */
  getInput(portName) {
    const inputs = this.receivedInputs.get(portName);
    return inputs && inputs.length > 0 ? inputs[0] : null;
  }

  /**
   * Get all received inputs for a port
   * @param {string} portName - Input port name
   * @returns {Array} - All input data
   */
  getAllInputs(portName) {
    return this.receivedInputs.get(portName) || [];
  }

  /**
   * Clear received inputs
   */
  clearInputs() {
    this.receivedInputs.clear();
  }

  /**
   * Execute component
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Execution result
   */
  async execute(context = {}) {
    if (this.isExecuting) {
      return { status: 'already-executing' };
    }

    this.isExecuting = true;
    this.retryCount = 0;

    try {
      // Call execute hook
      const result = await this.hooks.onExecute(this, context);

      // Emit execute event
      if (this.eventBus) {
        this.eventBus.emit({
          urn: this.urn,
          type: 'component:execute',
          timestamp: new Date().toISOString(),
          payload: {
            componentId: this.id,
            result
          }
        });
      }

      this.isExecuting = false;
      return result || { status: 'success' };
    } catch (error) {
      this.isExecuting = false;
      return this.handleError(error, context);
    }
  }

  /**
   * Handle execution error
   * @param {Error} error - Error object
   * @param {Object} context - Execution context
   * @returns {Object} - Error result
   */
  handleError(error, context = {}) {
    const isCritical = error.critical || false;
    const errorType = isCritical ? 'component:critical-error' : 'component:error';

    // Call error hook
    this.hooks.onError(this, error);

    // Emit error event
    if (this.eventBus) {
      this.eventBus.emit({
        urn: this.urn,
        type: errorType,
        timestamp: new Date().toISOString(),
        payload: {
          componentId: this.id,
          message: error.message,
          code: error.code || 'UNKNOWN',
          retryCount: this.retryCount,
          maxRetries: this.maxRetries,
          critical: isCritical
        }
      });
    }

    this.transitionState('error', { reason: 'execution-error', error: error.message });

    return {
      status: 'error',
      message: error.message,
      critical: isCritical
    };
  }

  /**
   * Reset component state
   */
  reset() {
    this.state.currentState = this.stateMachine.initialState;
    this.state.lastStateChange = new Date().toISOString();
    this.receivedInputs.clear();
    this.isExecuting = false;
    this.retryCount = 0;
  }

  /**
   * Destroy component
   */
  destroy() {
    // Call destroy hook
    this.hooks.onDestroy(this);

    // Emit destroy event
    if (this.eventBus) {
      this.eventBus.emit({
        urn: this.urn,
        type: 'component:destroy',
        timestamp: new Date().toISOString(),
        payload: {
          componentId: this.id
        }
      });
    }

    this.isInitialized = false;
    this.receivedInputs.clear();
  }

  /**
   * Get component state snapshot
   * @returns {Object} - State snapshot
   */
  getStateSnapshot() {
    return {
      id: this.id,
      urn: this.urn,
      currentState: this.state.currentState,
      lastStateChange: this.state.lastStateChange,
      receivedInputs: Object.fromEntries(this.receivedInputs),
      isExecuting: this.isExecuting,
      retryCount: this.retryCount,
      ...this.state
    };
  }

  /**
   * Restore component state from snapshot
   * @param {Object} snapshot - State snapshot
   */
  restoreStateSnapshot(snapshot) {
    this.state.currentState = snapshot.currentState;
    this.state.lastStateChange = snapshot.lastStateChange;
    this.isExecuting = snapshot.isExecuting;
    this.retryCount = snapshot.retryCount;

    // Restore received inputs
    this.receivedInputs.clear();
    if (snapshot.receivedInputs) {
      Object.entries(snapshot.receivedInputs).forEach(([port, data]) => {
        this.receivedInputs.set(port, data);
      });
    }
  }
}
