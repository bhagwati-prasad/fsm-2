/**
 * Main Application
 * Initializes the FSM Tool
 */

import {
  Graph,
  EventBus,
  SimulationEngine,
  D3Renderer,
  BuildModeController,
  SimulationModeController,
  ComponentLibrary,
  StorageManager,
  LocalStorageDriver,
  SessionStorageDriver,
  IndexDBDriver
} from '@/index.js';

class FSMTool {
  constructor() {
    this.graph = new Graph({ id: 'main-graph' });
    this.eventBus = new EventBus();
    this.engine = new SimulationEngine(this.graph, this.eventBus);
    this.renderer = new D3Renderer();
    this.componentLibrary = new ComponentLibrary();
    this.storage = new StorageManager({
      drivers: {
        local: new LocalStorageDriver(),
        session: new SessionStorageDriver(),
        indexdb: new IndexDBDriver()
      },
      defaultDriver: 'local'
    });

    this.currentMode = 'build';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSavedState();
    this.switchMode('build');
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });
  }

  switchMode(mode) {
    // Hide all modes
    document.querySelectorAll('.mode-container').forEach((container) => {
      container.style.display = 'none';
    });

    // Show selected mode
    const modeElement = document.getElementById(`${mode}-mode`);
    if (modeElement) {
      modeElement.style.display = 'block';
    }

    this.currentMode = mode;

    // Initialize mode controller
    switch (mode) {
      case 'build':
        this.initBuildMode();
        break;
      case 'simulation':
        this.initSimulationMode();
        break;
      case 'analyze':
        this.initAnalyzeMode();
        break;
    }
  }

  initBuildMode() {
    const container = document.getElementById('build-mode');
    if (!this.buildController) {
      this.buildController = new BuildModeController(
        container,
        this.graph,
        this.componentLibrary,
        this.renderer,
        this.eventBus
      );
    }
  }

  initSimulationMode() {
    const container = document.getElementById('simulation-mode');
    if (!this.simulationController) {
      this.simulationController = new SimulationModeController(
        container,
        this.engine,
        this.renderer,
        this.eventBus
      );
    }
  }

  initAnalyzeMode() {
    const container = document.getElementById('analyze-mode');
    // Initialize analyze mode
  }

  async loadSavedState() {
    try {
      const savedGraph = await this.storage.load('graph');
      if (savedGraph) {
        // Restore graph
        console.log('Loaded saved graph');
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
  }

  async saveState() {
    try {
      await this.storage.save('graph', this.graph);
      console.log('Graph saved');
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.fsmTool = new FSMTool();
  });
} else {
  window.fsmTool = new FSMTool();
}
