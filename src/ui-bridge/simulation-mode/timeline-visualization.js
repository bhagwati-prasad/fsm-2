/**
 * Timeline Visualization
 * Displays simulation timeline and frame scrubbing
 */

import { Logger } from '../../utils/logger';

export class TimelineVisualization {
  /**
   * Create a new timeline visualization
   * @param {HTMLElement} container - Container element
   * @param {SimulationEngine} engine - Simulation engine
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, engine, eventBus) {
    this.logger = new Logger('TimelineVisualization');
    this.container = container;
    this.engine = engine;
    this.eventBus = eventBus;
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.init();
  }

  /**
   * Initialize timeline
   * @private
   */
  init() {
    this.createTimelineUI();
    this.setupEventListeners();
  }

  /**
   * Create timeline UI
   * @private
   */
  createTimelineUI() {
    const timeline = document.createElement('div');
    timeline.className = 'timeline-visualization';
    timeline.innerHTML = `
      <div class="timeline-header">
        <span class="timeline-label">Timeline</span>
        <span class="timeline-info">
          <span class="current-frame">0</span> / <span class="total-frames">0</span>
        </span>
      </div>
      <div class="timeline-track">
        <div class="timeline-bar"></div>
        <div class="timeline-scrubber"></div>
      </div>
      <div class="timeline-markers"></div>
    `;
    this.container.appendChild(timeline);
    this.timelineElement = timeline;
    this.track = timeline.querySelector('.timeline-track');
    this.scrubber = timeline.querySelector('.timeline-scrubber');
    this.currentFrameDisplay = timeline.querySelector('.current-frame');
    this.totalFramesDisplay = timeline.querySelector('.total-frames');
    this.markersContainer = timeline.querySelector('.timeline-markers');

    this.track.addEventListener('click', (e) => this.handleScrub(e));
    this.scrubber.addEventListener('mousedown', (e) => this.handleScrubberDrag(e));
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('system:frame-advance', (event) => {
      this.updateFrame(event.payload.currentFrame);
    });

    this.eventBus.subscribe('system:frame-scrub', (event) => {
      this.updateFrame(event.payload.currentFrame);
    });

    this.eventBus.subscribe('system:simulation-stop', (event) => {
      this.totalFrames = event.payload.totalFrames;
      this.updateDisplay();
    });
  }

  /**
   * Handle timeline scrubbing
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  handleScrub(e) {
    const rect = this.track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const frameNumber = Math.floor(percentage * this.totalFrames);

    this.engine.jumpToFrame(frameNumber);
  }

  /**
   * Handle scrubber drag
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  handleScrubberDrag(e) {
    e.preventDefault();
    const rect = this.track.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      const x = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const frameNumber = Math.floor(percentage * this.totalFrames);
      this.updateFrame(frameNumber);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Update frame display
   * @param {number} frameNumber - Current frame number
   */
  updateFrame(frameNumber) {
    this.currentFrame = frameNumber;
    this.updateDisplay();
  }

  /**
   * Update display
   * @private
   */
  updateDisplay() {
    this.currentFrameDisplay.textContent = this.currentFrame;
    this.totalFramesDisplay.textContent = this.totalFrames;

    const percentage = this.totalFrames > 0 ? (this.currentFrame / this.totalFrames) * 100 : 0;
    this.scrubber.style.left = `${percentage}%`;
  }

  /**
   * Reset timeline
   */
  reset() {
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.updateDisplay();
  }
}
