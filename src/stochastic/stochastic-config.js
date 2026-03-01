/**
 * Stochastic Configuration
 * Manages probabilistic component properties
 */

import { Logger } from '../utils/logger';

export class StochasticConfig {
  /**
   * Create a new stochastic configuration
   */
  constructor() {
    this.logger = new Logger('StochasticConfig');
    this.distributions = new Map();
    this.componentConfigs = new Map();
    this.initializeDistributions();
  }

  /**
   * Initialize default distributions
   * @private
   */
  initializeDistributions() {
    // Normal distribution
    this.registerDistribution('normal', {
      name: 'Normal Distribution',
      parameters: ['mean', 'stdDev'],
      generate: (mean, stdDev) => {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z * stdDev;
      }
    });

    // Uniform distribution
    this.registerDistribution('uniform', {
      name: 'Uniform Distribution',
      parameters: ['min', 'max'],
      generate: (min, max) => {
        return min + Math.random() * (max - min);
      }
    });

    // Exponential distribution
    this.registerDistribution('exponential', {
      name: 'Exponential Distribution',
      parameters: ['lambda'],
      generate: (lambda) => {
        return -Math.log(Math.random()) / lambda;
      }
    });

    // Poisson distribution
    this.registerDistribution('poisson', {
      name: 'Poisson Distribution',
      parameters: ['lambda'],
      generate: (lambda) => {
        let k = 0;
        let p = 1;
        const L = Math.exp(-lambda);
        while (p > L) {
          k++;
          p *= Math.random();
        }
        return k - 1;
      }
    });
  }

  /**
   * Register distribution
   * @param {string} name - Distribution name
   * @param {Object} definition - Distribution definition
   */
  registerDistribution(name, definition) {
    this.distributions.set(name, definition);
  }

  /**
   * Get distribution
   * @param {string} name - Distribution name
   * @returns {Object} - Distribution definition
   */
  getDistribution(name) {
    return this.distributions.get(name);
  }

  /**
   * Configure component property
   * @param {string} componentId - Component ID
   * @param {string} property - Property name
   * @param {string} distributionType - Distribution type
   * @param {Object} parameters - Distribution parameters
   */
  configureProperty(componentId, property, distributionType, parameters) {
    if (!this.componentConfigs.has(componentId)) {
      this.componentConfigs.set(componentId, {});
    }

    const config = this.componentConfigs.get(componentId);
    config[property] = {
      distributionType,
      parameters,
      distribution: this.getDistribution(distributionType)
    };
  }

  /**
   * Get component configuration
   * @param {string} componentId - Component ID
   * @returns {Object} - Component configuration
   */
  getComponentConfig(componentId) {
    return this.componentConfigs.get(componentId) || {};
  }

  /**
   * Generate value for property
   * @param {string} componentId - Component ID
   * @param {string} property - Property name
   * @returns {number} - Generated value
   */
  generateValue(componentId, property) {
    const config = this.getComponentConfig(componentId);
    const propConfig = config[property];

    if (!propConfig || !propConfig.distribution) {
      return null;
    }

    const { distribution, parameters } = propConfig;
    return distribution.generate(...Object.values(parameters));
  }

  /**
   * Generate all values for component
   * @param {string} componentId - Component ID
   * @returns {Object} - Generated values
   */
  generateAllValues(componentId) {
    const config = this.getComponentConfig(componentId);
    const values = {};

    Object.entries(config).forEach(([property, propConfig]) => {
      values[property] = this.generateValue(componentId, property);
    });

    return values;
  }

  /**
   * Get all distributions
   * @returns {Array} - All distributions
   */
  getAllDistributions() {
    return Array.from(this.distributions.values());
  }
}
