/**
 * Executor unit tests - Enhanced with async and retry
 */

import { Executor } from '../../../src/simulation/executor';
import { Graph } from '../../../src/core/graph';
import { Component } from '../../../src/core/component';
import { EventBus } from '../../../src/core/event-bus';

describe('Executor', () => {
  let executor;
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

    executor = new Executor(graph, eventBus);
  });

  test('should execute sync component', async () => {
    const result = await executor.executeComponent('comp1');
    expect(result.status).toBe('success');
    expect(result.data).toBe('result1');
  });

  test('should execute async component', async () => {
    component2.receiveInput('input', 'test-data');
    const result = await executor.executeComponent('comp2');
    expect(result.status).toBe('success');
    expect(result.data).toBe('result2');
  });

  test('should route outputs to connected components', async () => {
    const result = await executor.executeComponent('comp1');
    expect(result.status).toBe('success');
    executor.routeOutputs('comp1', result);
    expect(component2.getInput('input')).toBe('result1');
  });

  test('should get execution order', () => {
    const order = executor.getExecutionOrder();
    expect(order).toContain('comp1');
    expect(order).toContain('comp2');
  });

  test('should get component state', async () => {
    await executor.executeComponent('comp1');
    const state = executor.getComponentState('comp1');
    expect(state).toBeDefined();
    expect(state.id).toBe('comp1');
  });

  test('should check if component is executing', () => {
    const isExecuting = executor.isComponentExecuting('comp1');
    expect(typeof isExecuting).toBe('boolean');
  });

  test('should handle non-existent component', async () => {
    const result = await executor.executeComponent('non-existent');
    expect(result.status).toBe('error');
  });
});
