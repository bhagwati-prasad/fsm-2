/**
 * Graph Engine
 * Manages component graph structure and operations
 */

export class Graph {
  /**
   * Create a new graph
   * @param {Object} config - Graph configuration
   * @param {string} [config.id] - Graph ID
   * @param {string} [config.name] - Graph name
   */
  constructor(config = {}) {
    this.id = config.id || 'root';
    this.name = config.name || 'Untitled Graph';
    this.components = new Map();
    this.connections = new Map();
    this.adjacencyList = new Map();
  }

  /**
   * Add component to graph
   * @param {Component} component - Component to add
   */
  addComponent(component) {
    this.components.set(component.id, component);
    this.adjacencyList.set(component.id, []);
  }

  /**
   * Remove component from graph
   * @param {string} componentId - Component ID
   */
  removeComponent(componentId) {
    this.components.delete(componentId);
    this.adjacencyList.delete(componentId);

    // Remove connections involving this component
    const connectionsToRemove = Array.from(this.connections.entries())
      .filter(
        ([_, conn]) =>
          conn.source === componentId || conn.target === componentId
      )
      .map(([id]) => id);

    connectionsToRemove.forEach((id) => this.removeConnection(id));
  }

  /**
   * Get component by ID
   * @param {string} componentId - Component ID
   * @returns {Component|null} - Component or null
   */
  getComponent(componentId) {
    return this.components.get(componentId) || null;
  }

  /**
   * Get all components
   * @returns {Array} - Array of components
   */
  getComponents() {
    return Array.from(this.components.values());
  }

  /**
   * Add connection between components
   * @param {Object} connection - Connection definition
   * @param {string} connection.id - Connection ID
   * @param {string} connection.source - Source component ID
   * @param {string} connection.target - Target component ID
   * @param {string} [connection.channel] - Channel name
   * @param {string} [connection.dataType] - Data type
   */
  addConnection(connection) {
    this.connections.set(connection.id, connection);

    // Update adjacency list
    if (!this.adjacencyList.has(connection.source)) {
      this.adjacencyList.set(connection.source, []);
    }
    this.adjacencyList.get(connection.source).push(connection.target);
  }

  /**
   * Remove connection
   * @param {string} connectionId - Connection ID
   */
  removeConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    this.connections.delete(connectionId);

    // Update adjacency list
    const neighbors = this.adjacencyList.get(connection.source) || [];
    const index = neighbors.indexOf(connection.target);
    if (index > -1) {
      neighbors.splice(index, 1);
    }
  }

  /**
   * Get connection by ID
   * @param {string} connectionId - Connection ID
   * @returns {Object|null} - Connection or null
   */
  getConnection(connectionId) {
    return this.connections.get(connectionId) || null;
  }

  /**
   * Get all connections
   * @returns {Array} - Array of connections
   */
  getConnections() {
    return Array.from(this.connections.values());
  }

  /**
   * Get connections from component
   * @param {string} componentId - Component ID
   * @returns {Array} - Array of connections
   */
  getOutgoingConnections(componentId) {
    return this.getConnections().filter((c) => c.source === componentId);
  }

  /**
   * Get connections to component
   * @param {string} componentId - Component ID
   * @returns {Array} - Array of connections
   */
  getIncomingConnections(componentId) {
    return this.getConnections().filter((c) => c.target === componentId);
  }

  /**
   * Detect cycles in graph
   * @returns {Array} - Array of cycles (each cycle is array of component IDs)
   */
  detectCycles() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (nodeId, path) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = this.adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart !== -1) {
            cycles.push(path.slice(cycleStart).concat(neighbor));
          }
        }
      }

      recursionStack.delete(nodeId);
    };

    for (const componentId of this.components.keys()) {
      if (!visited.has(componentId)) {
        dfs(componentId, []);
      }
    }

    return cycles;
  }

  /**
   * Get topological sort of components
   * @returns {Array} - Topologically sorted component IDs
   */
  topologicalSort() {
    const visited = new Set();
    const stack = [];

    const dfs = (nodeId) => {
      visited.add(nodeId);
      const neighbors = this.adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
      stack.push(nodeId);
    };

    for (const componentId of this.components.keys()) {
      if (!visited.has(componentId)) {
        dfs(componentId);
      }
    }

    return stack.reverse();
  }

  /**
   * Get execution order for components
   * @returns {Array} - Component IDs in execution order
   */
  getExecutionOrder() {
    return this.topologicalSort();
  }

  /**
   * Get component dependencies
   * @param {string} componentId - Component ID
   * @returns {Array} - Array of dependent component IDs
   */
  getDependencies(componentId) {
    const dependencies = [];
    const visited = new Set();

    const dfs = (nodeId) => {
      const neighbors = this.adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          dependencies.push(neighbor);
          dfs(neighbor);
        }
      }
    };

    dfs(componentId);
    return dependencies;
  }

  /**
   * Get component dependents
   * @param {string} componentId - Component ID
   * @returns {Array} - Array of dependent component IDs
   */
  getDependents(componentId) {
    const dependents = [];
    for (const [source, targets] of this.adjacencyList.entries()) {
      if (targets.includes(componentId)) {
        dependents.push(source);
      }
    }
    return dependents;
  }

  /**
   * Validate graph
   * @returns {Object} - Validation result {valid: boolean, errors: []}
   */
  validate() {
    const errors = [];

    // Check for orphaned components
    for (const componentId of this.components.keys()) {
      const incoming = this.getIncomingConnections(componentId);
      const outgoing = this.getOutgoingConnections(componentId);
      if (incoming.length === 0 && outgoing.length === 0) {
        errors.push(`Component '${componentId}' is orphaned (no connections)`);
      }
    }

    // Check for invalid connections
    for (const connection of this.getConnections()) {
      if (!this.components.has(connection.source)) {
        errors.push(`Connection references non-existent source '${connection.source}'`);
      }
      if (!this.components.has(connection.target)) {
        errors.push(`Connection references non-existent target '${connection.target}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get graph statistics
   * @returns {Object} - Graph statistics
   */
  getStatistics() {
    const cycles = this.detectCycles();
    return {
      componentCount: this.components.size,
      connectionCount: this.connections.size,
      cycleCount: cycles.length,
      cycles,
      hasCycles: cycles.length > 0
    };
  }
}
