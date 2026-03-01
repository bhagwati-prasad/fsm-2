/**
 * Composite Library
 * Manages pre-built composite component definitions
 */

import { CompositeComponent } from '../../core/composite-component';
import { Logger } from '../../utils/logger';

export class CompositeLibrary {
  /**
   * Create a new composite library
   */
  constructor() {
    this.logger = new Logger('CompositeLibrary');
    this.composites = new Map();
    this.initializeDefaults();
  }

  /**
   * Initialize default composites
   * @private
   */
  initializeDefaults() {
    // API Gateway Composite
    this.registerComposite('api-gateway', {
      name: 'API Gateway',
      description: 'API Gateway with load balancer and rate limiter',
      category: 'Network',
      innerComponents: [
        { id: 'lb', name: 'Load Balancer', type: 'network' },
        { id: 'rl', name: 'Rate Limiter', type: 'network' },
        { id: 'auth', name: 'Auth Service', type: 'compute' }
      ],
      exposedPorts: {
        input: [{ name: 'request', innerComponentId: 'lb', innerPortName: 'input' }],
        output: [{ name: 'response', innerComponentId: 'auth', innerPortName: 'output' }]
      }
    });

    // Database Cluster Composite
    this.registerComposite('db-cluster', {
      name: 'Database Cluster',
      description: 'Primary-replica database cluster',
      category: 'Storage',
      innerComponents: [
        { id: 'primary', name: 'Primary DB', type: 'database' },
        { id: 'replica1', name: 'Replica 1', type: 'database' },
        { id: 'replica2', name: 'Replica 2', type: 'database' }
      ],
      exposedPorts: {
        input: [{ name: 'write', innerComponentId: 'primary', innerPortName: 'input' }],
        output: [{ name: 'read', innerComponentId: 'replica1', innerPortName: 'output' }]
      }
    });

    // Microservice Composite
    this.registerComposite('microservice', {
      name: 'Microservice',
      description: 'Microservice with cache and queue',
      category: 'Compute',
      innerComponents: [
        { id: 'service', name: 'Service', type: 'compute' },
        { id: 'cache', name: 'Cache', type: 'storage' },
        { id: 'queue', name: 'Queue', type: 'messaging' }
      ],
      exposedPorts: {
        input: [{ name: 'request', innerComponentId: 'service', innerPortName: 'input' }],
        output: [{ name: 'response', innerComponentId: 'service', innerPortName: 'output' }]
      }
    });
  }

  /**
   * Register composite definition
   * @param {string} type - Composite type
   * @param {Object} definition - Composite definition
   */
  registerComposite(type, definition) {
    this.composites.set(type, definition);
  }

  /**
   * Get composite definition
   * @param {string} type - Composite type
   * @returns {Object} - Composite definition
   */
  getComposite(type) {
    return this.composites.get(type);
  }

  /**
   * Get all composites
   * @returns {Array} - All composite definitions
   */
  getAllComposites() {
    return Array.from(this.composites.values());
  }

  /**
   * Instantiate composite
   * @param {string} type - Composite type
   * @param {Object} config - Configuration
   * @returns {CompositeComponent} - Composite component instance
   */
  instantiate(type, config = {}) {
    const definition = this.getComposite(type);
    if (!definition) {
      return null;
    }

    const composite = new CompositeComponent({
      id: config.id || `${type}-${Date.now()}`,
      name: config.name || definition.name,
      type,
      description: definition.description,
      category: definition.category,
      exposedPorts: definition.exposedPorts
    });

    // Add inner components
    definition.innerComponents.forEach((compDef) => {
      const innerComponent = new CompositeComponent({
        id: compDef.id,
        name: compDef.name,
        type: compDef.type,
        parentId: composite.id
      });
      composite.addInnerComponent(innerComponent);
    });

    return composite;
  }

  /**
   * Get composites by category
   * @param {string} category - Category name
   * @returns {Array} - Composites in category
   */
  getByCategory(category) {
    return Array.from(this.composites.values()).filter((c) => c.category === category);
  }
}
