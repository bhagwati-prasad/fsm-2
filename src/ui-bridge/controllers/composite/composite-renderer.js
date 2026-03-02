/**
 * Composite Renderer
 * Renders composite components with expand/collapse
 */

import { Logger } from '../../../utils/logger';

export class CompositeRenderer {
  /**
   * Create a new composite renderer
   * @param {UIBridge} baseRenderer - Base renderer instance
   * @param {EventBus} eventBus - Event bus
   */
  constructor(baseRenderer, eventBus) {
    this.logger = new Logger('CompositeRenderer');
    this.baseRenderer = baseRenderer;
    this.eventBus = eventBus;
    this.expandedComposites = new Set();
  }

  /**
   * Render composite component
   * @param {CompositeComponent} component - Composite component
   * @param {HTMLElement} container - Container element
   */
  renderComposite(component, container) {
    const compositeDiv = document.createElement('div');
    compositeDiv.className = 'composite-component';
    compositeDiv.setAttribute('data-component-id', component.id);
    compositeDiv.innerHTML = `
      <div class="composite-header">
        <button class="expand-button">${component.isExpanded ? '▼' : '▶'}</button>
        <span class="composite-name">${component.name}</span>
        <span class="component-count">${component.getInnerComponents().length}</span>
      </div>
      <div class="composite-content" style="display: ${component.isExpanded ? 'block' : 'none'}">
        <div class="inner-canvas"></div>
      </div>
    `;

    const expandButton = compositeDiv.querySelector('.expand-button');
    expandButton.addEventListener('click', () => this.toggleExpanded(component, compositeDiv));

    container.appendChild(compositeDiv);

    if (component.isExpanded) {
      this.renderInnerGraph(component, compositeDiv.querySelector('.inner-canvas'));
    }
  }

  /**
   * Toggle composite expansion
   * @private
   * @param {CompositeComponent} component - Composite component
   * @param {HTMLElement} element - Component element
   */
  toggleExpanded(component, element) {
    component.toggleExpanded();
    const button = element.querySelector('.expand-button');
    const content = element.querySelector('.composite-content');
    const canvas = element.querySelector('.inner-canvas');

    button.textContent = component.isExpanded ? '▼' : '▶';
    content.style.display = component.isExpanded ? 'block' : 'none';

    if (component.isExpanded && canvas.children.length === 0) {
      this.renderInnerGraph(component, canvas);
    }

    this.eventBus.emit({
      urn: `component://${component.urn}`,
      type: 'ui:composite-toggled',
      timestamp: new Date().toISOString(),
      payload: {
        componentId: component.id,
        isExpanded: component.isExpanded
      }
    });
  }

  /**
   * Render inner graph
   * @private
   * @param {CompositeComponent} component - Composite component
   * @param {HTMLElement} container - Container element
   */
  renderInnerGraph(component, container) {
    const innerComponents = component.getInnerComponents();
    const innerConnections = component.getInnerConnections();

    // Create SVG for inner graph
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    svg.setAttribute('class', 'inner-graph');

    // Draw connections
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    innerConnections.forEach((conn) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '50');
      line.setAttribute('y1', '50');
      line.setAttribute('x2', '150');
      line.setAttribute('y2', '50');
      line.setAttribute('stroke', '#999');
      line.setAttribute('stroke-width', '2');
      g.appendChild(line);
    });

    // Draw components
    innerComponents.forEach((comp, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 50 + index * 100);
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '30');
      circle.setAttribute('fill', '#e8f4f8');
      circle.setAttribute('stroke', '#0066cc');
      circle.setAttribute('stroke-width', '2');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', 50 + index * 100);
      text.setAttribute('y', '55');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.textContent = comp.name;
      g.appendChild(text);
    });

    svg.appendChild(g);
    container.appendChild(svg);
  }
}
