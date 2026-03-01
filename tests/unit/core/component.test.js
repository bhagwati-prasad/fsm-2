/**
 * Component unit tests
 */

import { Component } from '../src/core/component';
import { EventBus } from '../src/core/event-bus';

describe('Component', () => {
  let component;
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();

    component = new Component({
      id: 'test-component',
      name: 'Test Component',
      type: 'test',
      ports: {
        input: [
          {
            name: 'input1',
            type: 'string',
            cardinality: 'single'
          }
        ],
        output: [
          {
            name: 'output1',
            type: 'string',
            cardinality: 'single'
          }
        ]
      },
      stateMachine: {
        initialState: 'idle',
        states: {
          idle: {},
          processing: {},
          complete: {}
        },
        transitions: {
          idle: ['processing'],
          processing: ['complete', 'idle'],
          complete: ['idle']
        }
      },
      onExecute: async () => ({ status: 'success' })
    });
  });

  test('should create component with correct properties', () => {
    expect(component.id).toBe('test-component');
    expect(component.name).toBe('Test Component');
    expect(component.type).toBe('test');
    expect(component.state.currentState).toBe('idle');
  });

  test('should initialize component', () => {
    component.init(eventBus);
    expect(component.isInitialized).toBe(true);
  });

  test('should transition state', () => {
    component.init(eventBus);
    const result = component.transitionState('processing');
    expect(result).toBe(true);
    expect(component.state.currentState).toBe('processing');
  });

  test('should not transition to invalid state', () => {
    component.init(eventBus);
    const result = component.transitionState('complete');
    expect(result).toBe(false);
    expect(component.state.currentState).toBe('idle');
  });

  test('should receive input', () => {
    component.receiveInput('input1', 'test data');
    expect(component.getInput('input1')).toBe('test data');
  });

  test('should reset component', () => {
    component.init(eventBus);
    component.transitionState('processing');
    component.receiveInput('input1', 'test data');
    component.reset();
    expect(component.state.currentState).toBe('idle');
    expect(component.getInput('input1')).toBeNull();
  });

  test('should get state snapshot', () => {
    component.init(eventBus);
    component.transitionState('processing');
    const snapshot = component.getStateSnapshot();
    expect(snapshot.currentState).toBe('processing');
    expect(snapshot.id).toBe('test-component');
  });
});
