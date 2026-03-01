/**
 * Checkpoint System
 * Saves and restores component states
 */

import { Logger } from '../utils/logger';

export class Checkpoint {
  /**
   * Create a new checkpoint system
   * @param {number} maxCheckpoints - Maximum checkpoints to store
   */
  constructor(maxCheckpoints = 100) {
    this.maxCheckpoints = maxCheckpoints;
    this.checkpoints = new Map();
    this.logger = new Logger('Checkpoint');
  }

  /**
   * Save checkpoint
   * @param {number} frameNumber - Frame number
   * @param {Object} state - State to save
   */
  save(frameNumber, state) {
    // Check if we need to clean up old checkpoints
    if (this.checkpoints.size >= this.maxCheckpoints) {
      // Remove oldest checkpoint
      const oldestKey = Math.min(...this.checkpoints.keys());
      this.checkpoints.delete(oldestKey);
    }

    this.checkpoints.set(frameNumber, {
      frameNumber,
      timestamp: new Date().toISOString(),
      state: {
        componentStates: new Map(state.componentStates),
        globalState: { ...state.globalState }
      }
    });
  }

  /**
   * Restore checkpoint
   * @param {number} frameNumber - Frame number
   * @returns {Object} - Checkpoint data
   */
  restore(frameNumber) {
    const checkpoint = this.checkpoints.get(frameNumber);
    if (!checkpoint) {
      return null;
    }
    return checkpoint.state;
  }

  /**
   * Delete checkpoint
   * @param {number} frameNumber - Frame number
   */
  delete(frameNumber) {
    this.checkpoints.delete(frameNumber);
  }

  /**
   * Check if checkpoint exists
   * @param {number} frameNumber - Frame number
   * @returns {boolean} - True if exists
   */
  hasCheckpoint(frameNumber) {
    return this.checkpoints.has(frameNumber);
  }

  /**
   * Get checkpoint
   * @param {number} frameNumber - Frame number
   * @returns {Object} - Checkpoint data
   */
  getCheckpoint(frameNumber) {
    return this.checkpoints.get(frameNumber);
  }

  /**
   * Get all checkpoints
   * @returns {Array} - All checkpoints
   */
  getAllCheckpoints() {
    return Array.from(this.checkpoints.values());
  }

  /**
   * Clear all checkpoints
   */
  clear() {
    this.checkpoints.clear();
  }

  /**
   * Get memory usage estimate
   * @returns {number} - Estimated memory in bytes
   */
  getMemoryUsage() {
    let totalSize = 0;
    this.checkpoints.forEach((checkpoint) => {
      totalSize += JSON.stringify(checkpoint).length;
    });
    return totalSize;
  }
}
