/**
 * DataBus Component
 * Routes data between components
 */

import { Component } from './component';

export class DataBus extends Component {
  /**
   * Create a new DataBus
   * @param {Object} config - DataBus configuration
   * @param {string} config.id - Unique DataBus ID
   * @param {string} config.type - DataBus type (one-to-one, one-to-many, many-to-one, many-to-many)
   * @param {string|Array} config.source - Source component ID(s)
   * @param {string|Array} config.target - Target component ID(s)
   * @param {Array} config.channels - Channel definitions
   * @param {number} [config.bandwidth] - Bandwidth limit (bytes/frame)
   * @param {string} [config.distributionStrategy] - Distribution strategy for one-to-many
   * @param {string} [config.aggregationStrategy] - Aggregation strategy for many-to-one
   * @param {string} [config.routingStrategy] - Routing strategy for many-to-many
   */
  constructor(config) {
    const stateMachineConfig = {
      initialState: 'idle',
      states: {
        idle: {},
        transferring: {},
        throttled: {},
        error: {}
      },
      transitions: {
        idle: ['transferring', 'error'],
        transferring: ['idle', 'throttled', 'error'],
        throttled: ['transferring', 'error'],
        error: ['idle']
      }
    };

    super({
      ...config,
      name: config.name || 'DataBus',
      type: 'databus',
      ports: {
        input: [
          {
            name: 'in',
            type: 'any',
            cardinality: 'multiple',
            schema: { type: 'object' }
          }
        ],
        output: [
          {
            name: 'out',
            type: 'any',
            cardinality: 'multiple',
            schema: { type: 'object' }
          }
        ]
      },
      stateMachine: stateMachineConfig,
      initialState: {
        activeChannels: 0,
        queuedMessages: 0,
        totalTransferred: 0,
        throttled: false,
        errorCount: 0
      }
    });

    this.busType = config.type || 'one-to-one';
    this.source = Array.isArray(config.source) ? config.source : [config.source];
    this.target = Array.isArray(config.target) ? config.target : [config.target];
    this.channels = config.channels || [
      {
        name: 'default',
        capacity: 1000,
        priority: 1,
        dataType: 'any'
      }
    ];
    this.bandwidth = config.bandwidth || null;
    this.distributionStrategy = config.distributionStrategy || 'round-robin';
    this.aggregationStrategy = config.aggregationStrategy || 'merge';
    this.routingStrategy = config.routingStrategy || 'broadcast';

    // Channel state
    this.channelQueues = new Map();
    this.channelBandwidth = new Map();
    this.initializeChannels();
  }

  /**
   * Initialize channels
   * @private
   */
  initializeChannels() {
    this.channels.forEach((channel) => {
      this.channelQueues.set(channel.name, []);
      this.channelBandwidth.set(channel.name, 0);
    });
  }

  /**
   * Transfer data through DataBus
   * @param {string} channelName - Channel name
   * @param {*} data - Data to transfer
   * @returns {Object} - Transfer result
   */
  transfer(channelName, data) {
    const channel = this.channels.find((c) => c.name === channelName);
    if (!channel) {
      return { status: 'error', message: `Channel '${channelName}' not found` };
    }

    // Check bandwidth
    if (this.bandwidth) {
      const channelCapacity = this.bandwidth / this.channels.length;
      const currentBandwidth = this.channelBandwidth.get(channelName) || 0;
      const dataSize = this.estimateDataSize(data);

      if (currentBandwidth + dataSize > channelCapacity) {
        this.transitionState('throttled', { reason: 'bandwidth-exceeded' });
        this.channelQueues.get(channelName).push(data);
        this.state.queuedMessages++;
        return { status: 'throttled', message: 'Bandwidth limit exceeded' };
      }

      this.channelBandwidth.set(channelName, currentBandwidth + dataSize);
    }

    // Transfer data
    this.transitionState('transferring', { channel: channelName });
    this.state.totalTransferred += this.estimateDataSize(data);
    this.state.activeChannels = this.channels.filter(
      (c) => this.channelQueues.get(c.name).length > 0
    ).length;

    return {
      status: 'success',
      channel: channelName,
      dataSize: this.estimateDataSize(data)
    };
  }

  /**
   * Estimate data size in bytes
   * @private
   * @param {*} data - Data to estimate
   * @returns {number} - Estimated size in bytes
   */
  estimateDataSize(data) {
    if (typeof data === 'string') {
      return data.length;
    }
    if (typeof data === 'object') {
      return JSON.stringify(data).length;
    }
    return 1;
  }

  /**
   * Get channel queue
   * @param {string} channelName - Channel name
   * @returns {Array} - Channel queue
   */
  getChannelQueue(channelName) {
    return this.channelQueues.get(channelName) || [];
  }

  /**
   * Clear channel queue
   * @param {string} channelName - Channel name
   */
  clearChannelQueue(channelName) {
    if (this.channelQueues.has(channelName)) {
      this.channelQueues.set(channelName, []);
    }
  }

  /**
   * Reset DataBus state
   */
  reset() {
    super.reset();
    this.initializeChannels();
    this.state.activeChannels = 0;
    this.state.queuedMessages = 0;
    this.state.totalTransferred = 0;
    this.state.throttled = false;
  }
}
