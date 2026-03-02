import { Component } from '../component';
import { Logger } from '../../utils/logger';
import { defaultComponentDefinitions } from './definitions';

export class ComponentLibrary {
  constructor() {
    this.logger = new Logger('ComponentLibrary');
    this.components = new Map();
    this.initializeDefaults();
  }

  initializeDefaults() {
    defaultComponentDefinitions.forEach((definition) => {
      this.registerComponent(definition.type, definition);
    });
  }

  registerComponent(type, definition) {
    this.components.set(type, definition);
  }

  getComponent(type) {
    return this.components.get(type);
  }

  getComponents() {
    return Array.from(this.components.values());
  }

  instantiate(type, config = {}) {
    const definition = this.getComponent(type);
    if (!definition) {
      this.logger.warn(`Component type not found: ${type}`);
      return null;
    }

    return new Component({
      ...config,
      id: config.id || `${type}-${Date.now()}`,
      name: config.name || definition.name,
      type,
      description: config.description ?? definition.description,
      capabilities: config.capabilities ?? definition.capabilities,
      usage: config.usage ?? definition.usage,
      ports: config.ports || definition.ports,
      stateMachine: config.stateMachine || definition.stateMachine
    });
  }
}
