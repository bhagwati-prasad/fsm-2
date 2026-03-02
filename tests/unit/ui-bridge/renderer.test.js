/**
 * UIBridge and Renderer unit tests
 */

import { UIBridge } from '../../../src/ui-bridge/ui-bridge';
import { D3Renderer } from '../../../src/ui-bridge/adapters/renderers/d3-renderer';
import { CanvasRenderer } from '../../../src/ui-bridge/adapters/renderers/canvas-renderer';
import { Graph } from '../../../src/core/graph';
import { Component } from '../../../src/core/component';
import { EventBus } from '../../../src/core/event-bus';

describe('UIBridge', () => {
  let bridge;

  beforeEach(() => {
    bridge = new UIBridge();
  });

  test('should create UIBridge instance', () => {
    expect(bridge).toBeDefined();
    expect(bridge.selectedComponent).toBeNull();
  });

  test('should throw error on render', () => {
    expect(() => bridge.render()).toThrow();
  });

  test('should throw error on updateComponent', () => {
    expect(() => bridge.updateComponent('comp1', {})).toThrow();
  });

  test('should throw error on animate', () => {
    expect(() => bridge.animate('comp1', 'class', 100)).toThrow();
  });
});

describe('D3Renderer', () => {
  let renderer;
  let graph;
  let eventBus;
  let container;
  let component1;
  let component2;

  beforeEach(() => {
    // Create mock container
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    // Create graph
    eventBus = new EventBus();
    graph = new Graph({ id: 'test-graph' });

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
      onExecute: async () => ({ status: 'success' })
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
      onExecute: async () => ({ status: 'success' })
    });

    graph.addComponent(component1);
    graph.addComponent(component2);
    graph.addConnection({
      id: 'conn1',
      source: 'comp1',
      target: 'comp2'
    });

    renderer = new D3Renderer();
    renderer.init(container, graph, eventBus);
  });

  afterEach(() => {
    renderer.destroy();
    document.body.removeChild(container);
  });

  test('should initialize D3 renderer', () => {
    expect(renderer.svg).toBeDefined();
    expect(renderer.nodes.length).toBe(2);
    expect(renderer.links.length).toBe(1);
  });

  test('should render graph', () => {
    expect(renderer.svg.children.length).toBeGreaterThan(0);
  });

  test('should select component', () => {
    renderer.selectComponent('comp1');
    expect(renderer.selectedNode).toBe('comp1');
  });

  test('should deselect component', () => {
    renderer.selectComponent('comp1');
    renderer.deselectComponent();
    expect(renderer.selectedNode).toBeNull();
  });

  test('should zoom in', () => {
    const initialZoom = renderer.zoom.scale;
    renderer.zoomIn();
    expect(renderer.zoom.scale).toBeGreaterThan(initialZoom);
  });

  test('should zoom out', () => {
    renderer.zoomIn();
    const zoomedIn = renderer.zoom.scale;
    renderer.zoomOut();
    expect(renderer.zoom.scale).toBeLessThan(zoomedIn);
  });

  test('should reset zoom', () => {
    renderer.zoomIn();
    renderer.resetZoom();
    expect(renderer.zoom.scale).toBe(1);
  });

  test('should fit to view', () => {
    renderer.fitToView();
    expect(renderer.zoom.scale).toBeGreaterThan(0);
  });
});

describe('CanvasRenderer', () => {
  let renderer;
  let graph;
  let eventBus;
  let container;
  let component1;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    eventBus = new EventBus();
    graph = new Graph({ id: 'test-graph' });

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
      onExecute: async () => ({ status: 'success' })
    });

    graph.addComponent(component1);

    renderer = new CanvasRenderer();
    renderer.init(container, graph, eventBus);
  });

  afterEach(() => {
    renderer.destroy();
    document.body.removeChild(container);
  });

  test('should initialize Canvas renderer', () => {
    expect(renderer.canvas).toBeDefined();
    expect(renderer.ctx).toBeDefined();
    expect(renderer.nodes.length).toBe(1);
  });

  test('should render graph', () => {
    expect(renderer.canvas.width).toBeGreaterThan(0);
    expect(renderer.canvas.height).toBeGreaterThan(0);
  });

  test('should select component', () => {
    renderer.selectComponent('comp1');
    expect(renderer.selectedNode).toBe('comp1');
  });

  test('should zoom in', () => {
    const initialZoom = renderer.zoom;
    renderer.zoomIn();
    expect(renderer.zoom).toBeGreaterThan(initialZoom);
  });

  test('should reset zoom', () => {
    renderer.zoomIn();
    renderer.resetZoom();
    expect(renderer.zoom).toBe(1);
  });
});
