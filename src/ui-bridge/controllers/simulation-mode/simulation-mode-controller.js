/**
 * Simulation Mode Controller
 * Orchestrates simulation mode UI components
 */

import { InputForm } from './input-form';
import { PlaybackControls } from './playback-controls';
import { TimelineVisualization } from './timeline-visualization';
import { EventLogViewer } from './event-log-viewer';
import { Logger } from '../../../utils/logger';

export class SimulationModeController {
  /**
   * Create a new simulation mode controller
   * @param {HTMLElement} container - Container element
   * @param {SimulationEngine} engine - Simulation engine
   * @param {UIBridge} renderer - Renderer instance
   * @param {EventBus} eventBus - Event bus
   */
  constructor(container, engine, renderer, eventBus) {
    this.logger = new Logger('SimulationModeController');
    this.container = container;
    this.engine = engine;
    this.renderer = renderer;
    this.eventBus = eventBus;
    this.isRunning = false;
    this.init();
  }

  /**
   * Initialize simulation mode
   * @private
   */
  init() {
    this.createLayout();
    this.initializeComponents();
    this.setupEventListeners();
  }

  /**
   * Create layout
   * @private
   */
  createLayout() {
    const layout = document.createElement('div');
    layout.className = 'simulation-mode-layout';
    layout.innerHTML = `
      <div class="simulation-top">
        <div class="input-form-container"></div>
        <div class="playback-controls-container"></div>
      </div>
      <div class="simulation-main">
        <div class="canvas-container"></div>
        <div class="timeline-container"></div>
      </div>
      <div class="simulation-bottom">
        <div class="event-log-container"></div>
      </div>
    `;
    this.container.appendChild(layout);
    this.layoutElement = layout;
  }

  /**
   * Initialize components
   * @private
   */
  initializeComponents() {
    const inputContainer = this.layoutElement.querySelector('.input-form-container');
    const playbackContainer = this.layoutElement.querySelector('.playback-controls-container');
    const canvasContainer = this.layoutElement.querySelector('.canvas-container');
    const timelineContainer = this.layoutElement.querySelector('.timeline-container');
    const eventLogContainer = this.layoutElement.querySelector('.event-log-container');

    this.inputForm = new InputForm(inputContainer, this.engine, this.eventBus);
    this.playbackControls = new PlaybackControls(playbackContainer, this.engine, this.eventBus);
    this.timeline = new TimelineVisualization(timelineContainer, this.engine, this.eventBus);
    this.eventLog = new EventLogViewer(eventLogContainer, this.engine, this.eventBus);

    // Initialize renderer in canvas
    this.renderer.init(canvasContainer, this.engine.graph, this.eventBus);
    this.renderer.render();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.eventBus.subscribe('system:simulation-start', () => {
      this.isRunning = true;
      this.playbackControls.updateState('running');
    });

    this.eventBus.subscribe('system:simulation-pause', () => {
      this.isRunning = false;
      this.playbackControls.updateState('paused');
    });

    this.eventBus.subscribe('system:simulation-resume', () => {
      this.isRunning = true;
      this.playbackControls.updateState('running');
    });

    this.eventBus.subscribe('system:simulation-stop', () => {
      this.isRunning = false;
      this.playbackControls.updateState('stopped');
    });

    this.eventBus.subscribe('system:frame-advance', (event) => {
      this.timeline.updateFrame(event.payload.currentFrame);
      this.eventLog.addEvent(event);
      this.updateComponentVisuals(event.payload.currentFrame);
    });

    this.eventBus.subscribe('component:state-change', (event) => {
      this.renderer.updateComponent(event.payload.componentId, {
        currentState: event.payload.newState
      });
      this.renderer.animate(event.payload.componentId, 'state-change', 300);
    });

    this.eventBus.subscribe('databus:transfer', (event) => {
      this.renderer.animate(
        `databus-${event.payload.source}-${event.payload.target}`,
        'transferring',
        500
      );
    });
  }

  /**
   * Update component visuals
   * @private
   * @param {number} frameNumber - Current frame number
   */
  updateComponentVisuals(frameNumber) {
    this.engine.graph.getComponents().forEach((component) => {
      const state = this.engine.getComponentState(component.id);
      if (state) {
        this.renderer.updateComponent(component.id, state);
      }
    });
  }

  /**
   * Start simulation
   */
  start() {
    const inputs = this.inputForm.getInputs();
    const initResult = this.engine.init(inputs);

    if (initResult.status !== 'success') {
      alert(`Initialization failed: ${initResult.message}`);
      return;
    }

    const startResult = this.engine.start();
    if (startResult.status !== 'success') {
      alert(`Start failed: ${startResult.message}`);
      return;
    }
  }

  /**
   * Pause simulation
   */
  pause() {
    this.engine.pause();
  }

  /**
   * Resume simulation
   */
  resume() {
    this.engine.resume();
  }

  /**
   * Stop simulation
   */
  stop() {
    this.engine.stop();
  }

  /**
   * Reset simulation
   */
  reset() {
    this.engine.reset();
    this.timeline.reset();
    this.eventLog.clear();
    this.renderer.render();
  }
}
