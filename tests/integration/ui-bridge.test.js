/**
 * Integration tests for UIBridge and renderers
 */

import { D3Renderer } from '../../../src/ui-bridge/renderers/d3-renderer';
import { CanvasRenderer } from '../../../src/ui-bridge/renderers/canvas-renderer';
import { DragDropHandler } from '../../../src/ui-bridge/interactions/drag-drop';
import { StateAnimator } from '../../../src/ui-bridge/animations/state-animator';
import { Graph } from '../../../src/core/graph';
import { Component } from '../../../src/core/component';
import { EventBus } from '../../../src/core/event-bus';

describe('UIBridge Integration Tests', () => {
  let graph;
  let eventBus;
  let container;
  let renderer;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    eventBus = new EventBus();
    graph = new Graph({ id: 'test-graph' });

    // Create test components
    const comp1 = new Component({
      id: 'comp1',
      name: 'Input',
      type: 'input',
      ports: {
        input: [],
        output: [{ name: 'output', type: 'any', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: { idle: {}, processing: {}, complete: {} },
        transitions: { idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle'] }
      },
      onExecute: async () => ({ status: 'success', data: 'test' })
    });

    const comp2 = new Component({
      id: 'comp2',
      name: 'Process',
      type: 'process',
      ports: {
        input: [{ name: 'input', type: 'any', cardinality: 'single' }],
        output: [{ name: 'output', type: 'any', cardinality: 'single' }]
      },
      stateMachine: {
        initialState: 'idle',
        states: { idle: {}, processing: {}, complete: {} },
        transitions: { idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle'] }
      },
      onExecute: async () => ({ status: 'success', data: 'processed' })
    });

    const comp3 = new Component({
      id: 'comp3',
      name: 'Output',
      type: 'output',
      ports: {
        input: [{ name: 'input', type: 'any', cardinality: 'single' }],
        output: []
      },
      stateMachine: {
        initialState: 'idle',
        states: { idle: {}, processing: {}, complete: {} },
        transitions: { idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle'] }
      },
      onExecute: async () => ({ status: 'success' })
    });

    graph.addComponent(comp1);
    graph.addComponent(comp2);
    graph.addComponent(comp3);
    graph.addConnection({ id: 'conn1', source: 'comp1', target: 'comp2' });
    graph.addConnection({ id: 'conn2', source: 'comp2', target: 'comp3' });
  });

  afterEach(() => {
    if (renderer) {
      renderer.destroy();
    }
    document.body.removeChild(container);
  });

  test('should render D3 graph with 3 components', () => {
    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);

    expect(renderer.nodes.length).toBe(3);
    expect(renderer.links.length).toBe(2);
    expect(renderer.svg).toBeDefined();
  });

  test('should render Canvas graph with 3 components', () => {
    renderer = new CanvasRenderer();
    renderer.init(container, graph, eventBus);

    expect(renderer.nodes.length).toBe(3);
    expect(renderer.links.length).toBe(2);
    expect(renderer.canvas).toBeDefined();
  });

  test('should handle component selection and animation', () => {
    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);

    const animator = new StateAnimator(container, eventBus);

    renderer.selectComponent('comp1');
    expect(renderer.selectedNode).toBe('comp1');

    animator.animate('comp1', 'pulse', 300);
  });

  test('should handle drag-drop interactions', () => {
    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);

    const dragDropHandler = new DragDropHandler(container, eventBus);

    let dragStarted = false;
    eventBus.subscribe('ui:drag-start', () => {
      dragStarted = true;
    });

    expect(dragDropHandler).toBeDefined();
  });

  test('should emit events on state changes', (done) => {
    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);

    eventBus.subscribe('ui:component-selected', (event) => {
      expect(event.payload.componentId).toBe('comp1');
      done();
    });

    renderer.selectComponent('comp1');
  });

  test('should handle zoom operations', () => {
    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);

    const initialZoom = renderer.zoom.scale;
    renderer.zoomIn();
    expect(renderer.zoom.scale).toBeGreaterThan(initialZoom);

    renderer.zoomOut();
    expect(renderer.zoom.scale).toBeLessThan(renderer.zoom.scale);

    renderer.resetZoom();
    expect(renderer.zoom.scale).toBe(1);
  });

  test('should fit graph to view', () => {
    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);

    renderer.fitToView();
    expect(renderer.zoom.scale).toBeGreaterThan(0);
  });
});
