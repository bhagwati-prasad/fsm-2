/**
 * Timeline
 * Manages frame history and playback
 */

import { Logger } from '../utils/logger';

export class Timeline {
  /**
   * Create a new timeline
   * @param {number} maxFrames - Maximum frames to store
   */
  constructor(maxFrames = 10000) {
    this.maxFrames = maxFrames;
    this.frames = [];
    this.currentFrameIndex = -1;
    this.segments = new Map();
    this.logger = new Logger('Timeline');
  }

  /**
   * Add frame to timeline
   * @param {Object} frame - Frame data
   */
  addFrame(frame) {
    if (this.frames.length >= this.maxFrames) {
      this.frames.shift();
    }
    this.frames.push(frame);
    this.currentFrameIndex = this.frames.length - 1;
  }

  /**
   * Get current frame
   * @returns {Object} - Current frame
   */
  getCurrentFrame() {
    if (this.currentFrameIndex < 0 || this.currentFrameIndex >= this.frames.length) {
      return null;
    }
    return this.frames[this.currentFrameIndex];
  }

  /**
   * Get frame by number
   * @param {number} frameNumber - Frame number
   * @returns {Object} - Frame data
   */
  getFrame(frameNumber) {
    if (frameNumber < 0 || frameNumber >= this.frames.length) {
      return null;
    }
    return this.frames[frameNumber];
  }

  /**
   * Move to next frame
   * @returns {boolean} - True if moved
   */
  nextFrame() {
    if (this.currentFrameIndex < this.frames.length - 1) {
      this.currentFrameIndex++;
      return true;
    }
    return false;
  }

  /**
   * Move to previous frame
   * @returns {boolean} - True if moved
   */
  previousFrame() {
    if (this.currentFrameIndex > 0) {
      this.currentFrameIndex--;
      return true;
    }
    return false;
  }

  /**
   * Jump to frame
   * @param {number} frameNumber - Target frame number
   * @returns {boolean} - True if jumped
   */
  jumpToFrame(frameNumber) {
    if (frameNumber >= 0 && frameNumber < this.frames.length) {
      this.currentFrameIndex = frameNumber;
      return true;
    }
    return false;
  }

  /**
   * Create segment
   * @param {string} segmentId - Segment ID
   * @param {number} startFrame - Start frame
   * @param {number} endFrame - End frame
   */
  createSegment(segmentId, startFrame, endFrame) {
    if (startFrame < 0 || endFrame >= this.frames.length || startFrame > endFrame) {
      return false;
    }

    this.segments.set(segmentId, {
      id: segmentId,
      startFrame,
      endFrame,
      createdAt: new Date().toISOString()
    });

    return true;
  }

  /**
   * Delete segment
   * @param {string} segmentId - Segment ID
   */
  deleteSegment(segmentId) {
    this.segments.delete(segmentId);
  }

  /**
   * Get segment
   * @param {string} segmentId - Segment ID
   * @returns {Object} - Segment data
   */
  getSegment(segmentId) {
    return this.segments.get(segmentId);
  }

  /**
   * Get all segments
   * @returns {Array} - All segments
   */
  getAllSegments() {
    return Array.from(this.segments.values());
  }

  /**
   * Get current frame number
   * @returns {number} - Current frame number
   */
  getCurrentFrameNumber() {
    return this.currentFrameIndex;
  }

  /**
   * Get frame count
   * @returns {number} - Total frames
   */
  getFrameCount() {
    return this.frames.length;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.frames = [];
    this.currentFrameIndex = -1;
    this.segments.clear();
  }

  /**
   * Get frame history
   * @returns {Array} - All frames
   */
  getFrameHistory() {
    return [...this.frames];
  }
}
