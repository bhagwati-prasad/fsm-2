/**
 * URN Generator
 * Generates unique URNs for components
 */

export class URNGenerator {
  /**
   * Generate URN for component
   * @param {Object} config - URN configuration
   * @param {string} config.componentId - Component ID
   * @param {string} [config.parentId] - Parent component ID
   * @param {string} [config.graphScope] - Graph scope (default: 'root')
   * @returns {string} - Generated URN
   */
  static generate(config) {
    const { componentId, parentId, graphScope = 'root' } = config;

    if (parentId) {
      return `component://${graphScope}/${parentId}/${componentId}`;
    }

    return `component://${graphScope}/${componentId}`;
  }

  /**
   * Parse URN
   * @param {string} urn - URN to parse
   * @returns {Object} - Parsed URN {graphScope, parentChain, componentId}
   */
  static parse(urn) {
    const match = urn.match(/^component:\/\/([^\/]+)\/(.*?)$/);
    if (!match) {
      return null;
    }

    const graphScope = match[1];
    const path = match[2].split('/');
    const componentId = path[path.length - 1];
    const parentChain = path.slice(0, -1);

    return {
      graphScope,
      parentChain,
      componentId,
      parentId: parentChain.length > 0 ? parentChain[parentChain.length - 1] : null
    };
  }

  /**
   * Validate URN format
   * @param {string} urn - URN to validate
   * @returns {boolean} - True if valid
   */
  static isValid(urn) {
    return /^component:\/\/[^\/]+\/[^\/]+/.test(urn);
  }
}
