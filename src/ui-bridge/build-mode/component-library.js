import { Component } from '../../core/component';
import { Logger } from '../../utils/logger';

export class ComponentLibrary {
  constructor() {
    this.logger = new Logger('ComponentLibrary');
    this.components = new Map();
    this.initializeDefaults();
  }

  initializeDefaults() {
    // Register basic component types
    this.registerComponent('database', {
      name: 'Database',
      description: 'Database component',
      category: 'Storage',
      type: 'database',
      ports: {
        input: [{ name: 'query', cardinality: 'single' }],
        output: [{ name: 'result', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: ['idle', 'processing', 'complete', 'error'],
        transitions: {
          idle: ['processing'],
          processing: ['complete', 'error'],
          complete: ['idle'],
          error: ['idle']
        }
      }
    });

    this.registerComponent('compute', {
      name: 'Compute',
      description: 'Compute component',
      category: 'Compute',
      type: 'compute',
      ports: {
        input: [{ name: 'data', cardinality: 'single' }],
        output: [{ name: 'result', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: ['idle', 'processing', 'complete', 'error'],
        transitions: {
          idle: ['processing'],
          processing: ['complete', 'error'],
          complete: ['idle'],
          error: ['idle']
        }
      }
    });

    this.registerComponent('network', {
      name: 'Network',
      description: 'Network component',
      category: 'Network',
      type: 'network',
      ports: {
        input: [{ name: 'request', cardinality: 'single' }],
        output: [{ name: 'response', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: ['idle', 'processing', 'complete', 'error'],
        transitions: {
          idle: ['processing'],
          processing: ['complete', 'error'],
          complete: ['idle'],
          error: ['idle']
        }
      }
    });

    this.registerComponent('messaging', {
      name: 'Messaging',
      description: 'Messaging component',
      category: 'Messaging',
      type: 'messaging',
      ports: {
        input: [{ name: 'message', cardinality: 'single' }],
        output: [{ name: 'ack', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: ['idle', 'processing', 'complete', 'error'],
        transitions: {
          idle: ['processing'],
          processing: ['complete', 'error'],
          complete: ['idle'],
          error: ['idle']
        }
      }
    });
  }

  registerComponent(type, definition) {
    this.components.set(type, definition);
  }

  getComponent(type) {
    return this.components.get(type);
  }

  getComponents() {
    return Array.from(this.components.values());
  }

  instantiate(type, config = {}) {
    const definition = this.getComponent(type);
    if (!definition) {
      this.logger.warn(`Component type not found: ${type}`);
      return null;
    }

    return new Component({
      id: config.id || `${type}-${Date.now()}`,
      name: config.name || definition.name,
      type,
      description: definition.description,
      ports: definition.ports,
      stateMachine: definition.stateMachine,
      ...config
    });
  }
}
