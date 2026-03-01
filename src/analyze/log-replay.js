/**
 * Log Replay
 * Replays logs through simulation for analysis
 */

import { Logger } from '../utils/logger';

export class LogReplay {
  /**
   * Create a new log replay
   * @param {SimulationEngine} engine - Simulation engine
   * @param {EventBus} eventBus - Event bus
   */
  constructor(engine, eventBus) {
    this.logger = new Logger('LogReplay');
    this.engine = engine;
    this.eventBus = eventBus;
    this.isReplaying = false;
    this.currentEventIndex = 0;
    this.events = [];
  }

  /**
   * Start replay
   * @param {Array} events - Events to replay
   * @param {number} speed - Replay speed (1.0 = normal)
   * @returns {Object} - Replay result
   */
  startReplay(events, speed = 1.0) {
    try {
      this.events = events;
      this.currentEventIndex = 0;
      this.isReplaying = true;
      this.speed = speed;

      this.eventBus.emit({
        urn: 'system://log-replay',
        type: 'system:replay-started',
        timestamp: new Date().toISOString(),
        payload: {
          eventCount: events.length,
          speed
        }
      });

      this.replayNextEvent();
      return { status: 'success' };
    } catch (error) {
      this.logger.error('Replay start failed', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Replay next event
   * @private
   */
  replayNextEvent() {
    if (!this.isReplaying || this.currentEventIndex >= this.events.length) {
      this.stopReplay();
      return;
    }

    const event = this.events[this.currentEventIndex];
    this.currentEventIndex++;

    // Emit event
    this.eventBus.emit(event);

    // Schedule next event
    const delay = this.calculateDelay(event);
    setTimeout(() => this.replayNextEvent(), delay / this.speed);
  }

  /**
   * Calculate delay until next event
   * @private
   * @param {Object} event - Current event
   * @returns {number} - Delay in milliseconds
   */
  calculateDelay(event) {
    if (this.currentEventIndex >= this.events.length) {
      return 0;
    }

    const currentTime = new Date(event.timestamp).getTime();
    const nextTime = new Date(this.events[this.currentEventIndex].timestamp).getTime();
    return Math.max(0, nextTime - currentTime);
  }

  /**
   * Pause replay
   */
  pauseReplay() {
    this.isReplaying = false;
    this.eventBus.emit({
      urn: 'system://log-replay',
      type: 'system:replay-paused',
      timestamp: new Date().toISOString(),
      payload: { currentIndex: this.currentEventIndex }
    });
  }

  /**
   * Resume replay
   */
  resumeReplay() {
    this.isReplaying = true;
    this.replayNextEvent();
  }

  /**
   * Stop replay
   */
  stopReplay() {
    this.isReplaying = false;
    this.eventBus.emit({
      urn: 'system://log-replay',
      type: 'system:replay-stopped',
      timestamp: new Date().toISOString(),
      payload: {
        totalEvents: this.events.length,
        processedEvents: this.currentEventIndex
      }
    });
  }

  /**
   * Get replay progress
   * @returns {Object} - Progress information
   */
  getProgress() {
    return {
      isReplaying: this.isReplaying,
      currentIndex: this.currentEventIndex,
      totalEvents: this.events.length,
      percentage: this.events.length > 0 ? (this.currentEventIndex / this.events.length) * 100 : 0
    };
  }
}
