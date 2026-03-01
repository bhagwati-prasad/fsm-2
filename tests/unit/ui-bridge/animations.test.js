/**
 * Animator unit tests
 */

import { StateAnimator } from '../../../src/ui-bridge/animations/state-animator';
import { DataBusAnimator } from '../../../src/ui-bridge/animations/databus-animator';
import { EventBus } from '../../../src/core/event-bus';

describe('StateAnimator', () => {
  let animator;
  let container;
  let eventBus;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus = new EventBus();
    animator = new StateAnimator(container, eventBus);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create StateAnimator', () => {
    expect(animator).toBeDefined();
    expect(animator.container).toBe(container);
  });

  test('should animate component', () => {
    const element = document.createElement('div');
    element.setAttribute('data-component-id', 'comp1');
    container.appendChild(element);

    animator.animate('comp1', 'pulse', 500);
    expect(element.classList.contains('pulse')).toBe(true);
  });

  test('should handle state change events', (done) => {
    const element = document.createElement('div');
    element.setAttribute('data-component-id', 'comp1');
    container.appendChild(element);

    eventBus.subscribe('component:state-change', () => {
      expect(element.classList.contains('state-processing')).toBe(true);
      done();
    });

    eventBus.emit({
      urn: 'component://root/comp1',
      type: 'component:state-change',
      timestamp: new Date().toISOString(),
      payload: {
        componentId: 'comp1',
        oldState: 'idle',
        newState: 'processing'
      }
    });
  });
});

describe('DataBusAnimator', () => {
  let animator;
  let container;
  let eventBus;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus = new EventBus();
    animator = new DataBusAnimator(container, eventBus);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create DataBusAnimator', () => {
    expect(animator).toBeDefined();
    expect(animator.container).toBe(container);
  });

  test('should animate data flow', () => {
    const element = document.createElement('div');
    element.setAttribute('data-connection-id', 'comp1-comp2');
    container.appendChild(element);

    animator.animateFlow('comp1', 'comp2', 500);
    expect(element.classList.contains('flowing')).toBe(true);
  });

  test('should handle transfer events', (done) => {
    const element = document.createElement('div');
    element.setAttribute('data-connection-id', 'comp1-comp2');
    container.appendChild(element);

    eventBus.subscribe('databus:transfer', () => {
      expect(element.classList.contains('transferring')).toBe(true);
      done();
    });

    eventBus.emit({
      urn: 'databus://conn1',
      type: 'databus:transfer',
      timestamp: new Date().toISOString(),
      payload: {
        source: 'comp1',
        target: 'comp2',
        channel: 'default',
        dataSize: 1024
      }
    });
  });
});
