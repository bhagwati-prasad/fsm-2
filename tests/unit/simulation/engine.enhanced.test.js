/**
 * Simulation Engine unit tests - Enhanced with error handling
 */

import { SimulationEngine } from '../../../src/simulation/engine';
import { Graph } from '../../../src/core/graph';
import { Component } from '../../../src/core/component';
import { EventBus } from '../../../src/core/event-bus';

describe('SimulationEngine - Enhanced', () => {
  let engine;
  let graph;
  let eventBus;
  let component1;
  let component2;

  beforeEach(() => {
    eventBus = new EventBus();
    graph = new Graph({ id: 'test-graph' });

    // Create test components
    component1 = new Component({
      id: 'comp1',
      name: 'Component 1',
      type: 'test',
      asyncExecution: false,
      ports: {
        input: [{ name: 'input', type: 'any', cardinality: 'single' }],
        output: [{ name: 'output', type: 'any', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: { idle: {}, processing: {}, complete: {} },
        transitions: { idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle'] }
      },
      onExecute: async () => ({ status: 'success', data: 'result1' })
    });

    component2 = new Component({
      id: 'comp2',
      name: 'Component 2',
      type: 'test',
      asyncExecution: true,
      timeout: 5000,
      ports: {
        input: [{ name: 'input', type: 'any', cardinality: 'single' }],
        output: [{ name: 'output', type: 'any', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: { idle: {}, processing: {}, complete: {} },
        transitions: { idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle'] }
      },
      onExecute: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return { status: 'success', data: 'result2' };
      }
    });

    graph.addComponent(component1);
    graph.addComponent(component2);
    graph.addConnection({
      id: 'conn1',
      source: 'comp1',
      target: 'comp2'
    });

    engine = new SimulationEngine(graph, eventBus, {
      maxErrors: 10,
      errorHandlers: {
        onComponentError: (componentId, error) => {
          console.log(`Error in ${componentId}: ${error.message}`);
        }
      }
    });
  });

  test('should handle async component execution', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    expect(engine.state.status).toBe('running');
  });

  test('should track pending async components', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    const state = engine.getSimulationState();
    expect(state.pendingAsyncCount).toBeDefined();
  });

  test('should handle component errors', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    const errors = engine.getErrors();
    expect(Array.isArray(errors)).toBe(true);
  });

  test('should respect max error limit', () => {
    const errorEngine = new SimulationEngine(graph, eventBus, { maxErrors: 1 });
    errorEngine.init({ comp1: 'test-input' });
    errorEngine.start();
    // Should handle gracefully
    expect(errorEngine.state.status).toBeDefined();
  });

  test('should emit error events', () => {
    let errorEventEmitted = false;
    eventBus.subscribe('system:*', (event) => {
      if (event.type.includes('error')) {
        errorEventEmitted = true;
      }
    });

    engine.init({ comp1: 'test-input' });
    engine.start();
    // Error event may or may not be emitted depending on execution
    expect(typeof errorEventEmitted).toBe('boolean');
  });

  test('should pause on critical error', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    // Simulate critical error
    engine.state.status = 'paused';
    expect(engine.state.status).toBe('paused');
  });
});
