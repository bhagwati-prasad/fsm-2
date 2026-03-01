/**
 * Interaction handlers unit tests
 */

import { DragDropHandler } from '../../../src/ui-bridge/interactions/drag-drop';
import { SnapAttachHandler } from '../../../src/ui-bridge/interactions/snap-attach';
import { EventBus } from '../../../src/core/event-bus';

describe('DragDropHandler', () => {
  let handler;
  let container;
  let eventBus;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus = new EventBus();
    handler = new DragDropHandler(container, eventBus);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create DragDropHandler', () => {
    expect(handler).toBeDefined();
    expect(handler.container).toBe(container);
  });

  test('should track dragged element', () => {
    const element = document.createElement('div');
    element.setAttribute('data-draggable', 'true');
    element.setAttribute('data-component-id', 'comp1');
    element.setAttribute('data-component-type', 'test');
    container.appendChild(element);

    const dragEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });

    element.dispatchEvent(dragEvent);
    expect(handler.draggedElement).toBe(element);
  });
});

describe('SnapAttachHandler', () => {
  let handler;
  let container;
  let eventBus;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    eventBus = new EventBus();
    handler = new SnapAttachHandler(container, eventBus, { snapDistance: 50 });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('should create SnapAttachHandler', () => {
    expect(handler).toBeDefined();
    expect(handler.snapDistance).toBe(50);
  });

  test('should find snap target', () => {
    const element = document.createElement('div');
    element.setAttribute('data-component-id', 'comp1');
    element.style.position = 'absolute';
    element.style.left = '100px';
    element.style.top = '100px';
    element.style.width = '60px';
    element.style.height = '60px';
    container.appendChild(element);

    const target = handler.findSnapTarget(130, 130);
    expect(target).toBe(element);
  });
});
