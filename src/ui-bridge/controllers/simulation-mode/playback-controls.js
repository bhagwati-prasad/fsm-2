/**
 * Playback Controls
 * Controls simulation playback
 */

import { Logger } from '../../../utils/logger';

export class PlaybackControls {
  /**
   * Create a new playback controls
   * @param {HTMLElement} container - Container element
   * @param {SimulationEngine} engine - Simulation engine
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, engine, eventBus) {
    this.logger = new Logger('PlaybackControls');
    this.container = container;
    this.engine = engine;
    this.eventBus = eventBus;
    this.state = 'idle';
    this.init();
  }

  /**
   * Initialize controls
   * @private
   */
  init() {
    this.createControlsUI();
    this.setupEventListeners();
  }

  /**
   * Create controls UI
   * @private
   */
  createControlsUI() {
    const controls = document.createElement('div');
    controls.className = 'playback-controls';
    controls.innerHTML = `
      <div class="controls-group">
        <button class="btn-play" title="Play">▶</button>
        <button class="btn-pause" title="Pause" disabled>⏸</button>
        <button class="btn-stop" title="Stop" disabled>⏹</button>
        <button class="btn-reset" title="Reset">↻</button>
      </div>
      <div class="controls-group">
        <button class="btn-prev" title="Previous Frame">◀</button>
        <button class="btn-next" title="Next Frame">▶</button>
      </div>
      <div class="controls-info">
        <span class="info-frame">Frame: <span class="frame-number">0</span></span>
        <span class="info-status">Status: <span class="status-text">Idle</span></span>
      </div>
    `;
    this.container.appendChild(controls);
    this.controlsElement = controls;

    this.playBtn = controls.querySelector('.btn-play');
    this.pauseBtn = controls.querySelector('.btn-pause');
    this.stopBtn = controls.querySelector('.btn-stop');
    this.resetBtn = controls.querySelector('.btn-reset');
    this.prevBtn = controls.querySelector('.btn-prev');
    this.nextBtn = controls.querySelector('.btn-next');
    this.frameNumber = controls.querySelector('.frame-number');
    this.statusText = controls.querySelector('.status-text');
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.playBtn.addEventListener('click', () => this.handlePlay());
    this.pauseBtn.addEventListener('click', () => this.handlePause());
    this.stopBtn.addEventListener('click', () => this.handleStop());
    this.resetBtn.addEventListener('click', () => this.handleReset());
    this.prevBtn.addEventListener('click', () => this.handlePrevious());
    this.nextBtn.addEventListener('click', () => this.handleNext());
  }

  /**
   * Handle play button
   * @private
   */
  handlePlay() {
    if (this.state === 'idle') {
      this.eventBus.emit({
        urn: 'ui://playback-controls',
        type: 'ui:simulation-start-requested',
        timestamp: new Date().toISOString(),
        payload: {}
      });
    } else if (this.state === 'paused') {
      this.engine.resume();
    }
  }

  /**
   * Handle pause button
   * @private
   */
  handlePause() {
    this.engine.pause();
  }

  /**
   * Handle stop button
   * @private
   */
  handleStop() {
    this.engine.stop();
  }

  /**
   * Handle reset button
   * @private
   */
  handleReset() {
    this.engine.reset();
    this.updateState('idle');
  }

  /**
   * Handle previous frame button
   * @private
   */
  handlePrevious() {
    this.engine.previousFrame();
  }

  /**
   * Handle next frame button
   * @private
   */
  handleNext() {
    this.engine.nextFrame();
  }

  /**
   * Update control state
   * @param {string} state - New state
   */
  updateState(state) {
    this.state = state;

    const states = {
      idle: { play: false, pause: true, stop: true, prev: true, next: true },
      running: { play: true, pause: false, stop: false, prev: true, next: true },
      paused: { play: false, pause: true, stop: false, prev: true, next: true },
      stopped: { play: false, pause: true, stop: true, prev: true, next: true }
    };

    const config = states[state] || states.idle;
    this.playBtn.disabled = config.play;
    this.pauseBtn.disabled = config.pause;
    this.stopBtn.disabled = config.stop;
    this.prevBtn.disabled = config.prev;
    this.nextBtn.disabled = config.next;

    this.statusText.textContent = state.charAt(0).toUpperCase() + state.slice(1);
  }

  /**
   * Update frame number display
   * @param {number} frameNumber - Current frame number
   */
  updateFrameNumber(frameNumber) {
    this.frameNumber.textContent = frameNumber;
  }
}
