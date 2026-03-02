/**
 * Composite Library
 * Manages pre-built composite component definitions
 */

import { CompositeComponent } from '../composite-component';
import { Logger } from '../../utils/logger';
import { defaultCompositeDefinitions } from './definitions';

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
    defaultCompositeDefinitions.forEach((definition) => {
      this.registerComposite(definition.type, definition);
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

    definition.innerComponents.forEach((componentDefinition) => {
      const innerComponent = new CompositeComponent({
        id: componentDefinition.id,
        name: componentDefinition.name,
        type: componentDefinition.type,
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
    return Array.from(this.composites.values()).filter((composite) => composite.category === category);
  }
}
