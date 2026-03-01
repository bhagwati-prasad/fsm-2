/**
 * Simulation Engine unit tests
 */

import { SimulationEngine } from '../../../src/simulation/engine';
import { Graph } from '../../../src/core/graph';
import { Component } from '../../../src/core/component';
import { EventBus } from '../../../src/core/event-bus';

describe('SimulationEngine', () => {
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
      ports: {
        input: [{ name: 'input', type: 'any', cardinality: 'single' }],
        output: [{ name: 'output', type: 'any', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: { idle: {}, processing: {}, complete: {} },
        transitions: { idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle'] }
      },
      onExecute: async () => ({ status: 'success', data: 'result2' })
    });

    graph.addComponent(component1);
    graph.addComponent(component2);
    graph.addConnection({
      id: 'conn1',
      source: 'comp1',
      target: 'comp2'
    });

    engine = new SimulationEngine(graph, eventBus);
  });

  test('should create engine with correct properties', () => {
    expect(engine.graph).toBe(graph);
    expect(engine.eventBus).toBe(eventBus);
    expect(engine.state.status).toBe('idle');
  });

  test('should initialize with inputs', () => {
    const result = engine.init({ comp1: 'test-input' });
    expect(result.status).toBe('success');
    expect(engine.state.initialInputs).toEqual({ comp1: 'test-input' });
  });

  test('should start simulation', () => {
    engine.init({ comp1: 'test-input' });
    const result = engine.start();
    expect(result.status).toBe('success');
    expect(engine.state.status).toBe('running');
  });

  test('should pause simulation', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    const result = engine.pause();
    expect(result.status).toBe('success');
    expect(engine.state.status).toBe('paused');
  });

  test('should resume simulation', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    engine.pause();
    const result = engine.resume();
    expect(result.status).toBe('success');
    expect(engine.state.status).toBe('running');
  });

  test('should stop simulation', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    const result = engine.stop();
    expect(result.status).toBe('success');
    expect(engine.state.status).toBe('stopped');
  });

  test('should reset simulation', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    const result = engine.reset();
    expect(result.status).toBe('success');
    expect(engine.state.status).toBe('idle');
    expect(engine.state.currentFrame).toBe(0);
  });

  test('should get simulation state', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    const state = engine.getSimulationState();
    expect(state.status).toBe('running');
    expect(state.componentCount).toBe(2);
  });

  test('should track errors', () => {
    engine.init({ comp1: 'test-input' });
    engine.start();
    expect(engine.getErrors()).toEqual([]);
  });
});
