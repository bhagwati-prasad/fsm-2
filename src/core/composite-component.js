/**
 * Composite Component
 * Represents a component that contains other components
 */

import { Component } from './component';
import { Graph } from './graph';

export class CompositeComponent extends Component {
  /**
   * Create a new composite component
   * @param {Object} config - Component configuration
   * @param {Graph} config.innerGraph - Inner component graph
   */
  constructor(config) {
    super({
      ...config,
      type: 'composite'
    });

    this.innerGraph = config.innerGraph || new Graph({ id: `${config.id}-inner` });
    this.isExpanded = false;
    this.exposedPorts = config.exposedPorts || { input: [], output: [] };
  }

  /**
   * Add inner component
   * @param {Component} component - Component to add
   */
  addInnerComponent(component) {
    this.innerGraph.addComponent(component);
  }

  /**
   * Remove inner component
   * @param {string} componentId - Component ID
   */
  removeInnerComponent(componentId) {
    this.innerGraph.removeComponent(componentId);
  }

  /**
   * Get inner components
   * @returns {Array} - Inner components
   */
  getInnerComponents() {
    return this.innerGraph.getComponents();
  }

  /**
   * Add inner connection
   * @param {Object} connection - Connection definition
   */
  addInnerConnection(connection) {
    this.innerGraph.addConnection(connection);
  }

  /**
   * Get inner connections
   * @returns {Array} - Inner connections
   */
  getInnerConnections() {
    return this.innerGraph.getConnections();
  }

  /**
   * Expose port from inner component
   * @param {string} innerComponentId - Inner component ID
   * @param {string} portName - Port name
   * @param {string} direction - 'input' or 'output'
   * @param {string} exposedName - Exposed port name
   */
  exposePort(innerComponentId, portName, direction, exposedName) {
    const innerComponent = this.innerGraph.getComponent(innerComponentId);
    if (!innerComponent) return;

    const port = {
      name: exposedName,
      type: 'any',
      cardinality: 'single',
      innerComponentId,
      innerPortName: portName
    };

    if (direction === 'input') {
      this.exposedPorts.input.push(port);
      this.inputPorts.push(port);
    } else {
      this.exposedPorts.output.push(port);
      this.outputPorts.push(port);
    }
  }

  /**
   * Hide exposed port
   * @param {string} exposedName - Exposed port name
   * @param {string} direction - 'input' or 'output'
   */
  hidePort(exposedName, direction) {
    const ports = direction === 'input' ? this.exposedPorts.input : this.exposedPorts.output;
    const index = ports.findIndex((p) => p.name === exposedName);
    if (index > -1) {
      ports.splice(index, 1);
    }
  }

  /**
   * Toggle expansion
   */
  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Get state snapshot
   * @returns {Object} - State snapshot
   */
  getStateSnapshot() {
    const snapshot = super.getStateSnapshot();
    snapshot.isExpanded = this.isExpanded;
    snapshot.innerComponents = this.getInnerComponents().map((c) => c.getStateSnapshot());
    snapshot.innerConnections = this.getInnerConnections();
    return snapshot;
  }

  /**
   * Restore state from snapshot
   * @param {Object} snapshot - State snapshot
   */
  restoreStateSnapshot(snapshot) {
    super.restoreStateSnapshot(snapshot);
    this.isExpanded = snapshot.isExpanded || false;
  }
}
