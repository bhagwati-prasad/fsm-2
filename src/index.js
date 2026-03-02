/**
 * Main Entry Point
 * Initializes and exports all core classes
 */

// Core
export { Component } from './core/component';
export { Graph } from './core/graph';
export { EventBus } from './core/event-bus';
export { DataBus } from './core/databus';
export { StateMachine } from './core/state-machine';
export { CompositeComponent } from './core/composite-component';
export { ComponentLibrary } from './core/component-library';
export { CompositeLibrary } from './core/composite-library';

// Simulation
export { SimulationEngine } from './simulation/engine';
export { Executor } from './simulation/executor';
export { Timeline } from './simulation/timeline';
export { Checkpoint } from './simulation/checkpoint';
export { CostCalculator } from './simulation/cost-calculator';

// Storage
export { StorageManager } from './storage/storage-manager';
export { LocalStorageDriver } from './storage/drivers/local-storage';
export { SessionStorageDriver } from './storage/drivers/session-storage';
export { IndexDBDriver } from './storage/drivers/indexdb';
export { RESTClient } from './storage/drivers/rest-client';
export { WebSocketClient } from './storage/drivers/websocket-client';
export { Serializer } from './storage/serializer';

// UI Bridge
export { UIBridge } from './ui-bridge/ui-bridge';
export { D3Renderer } from './ui-bridge/adapters/renderers/d3-renderer';
export { CanvasRenderer } from './ui-bridge/adapters/renderers/canvas-renderer';
export { DragDropHandler } from './ui-bridge/interactions/drag-drop';
export { SnapAttachHandler } from './ui-bridge/interactions/snap-attach';
export { StateAnimator } from './ui-bridge/animations/state-animator';
export { DataBusAnimator } from './ui-bridge/animations/databus-animator';

// Build Mode
export { ComponentPalette } from './ui-bridge/controllers/build-mode/component-palette';
export { BuildCanvas } from './ui-bridge/controllers/build-mode/build-canvas';
export { ComponentConfigPanel } from './ui-bridge/controllers/build-mode/component-config-panel';
export { DataBusManager } from './ui-bridge/controllers/build-mode/databus-manager';
export { BuildModeController } from './ui-bridge/controllers/build-mode/build-mode-controller';

// Simulation Mode
export { InputForm } from './ui-bridge/controllers/simulation-mode/input-form';
export { PlaybackControls } from './ui-bridge/controllers/simulation-mode/playback-controls';
export { TimelineVisualization } from './ui-bridge/controllers/simulation-mode/timeline-visualization';
export { EventLogViewer } from './ui-bridge/controllers/simulation-mode/event-log-viewer';
export { SimulationModeController } from './ui-bridge/controllers/simulation-mode/simulation-mode-controller';

// Composite
export { CompositeRenderer } from './ui-bridge/controllers/composite/composite-renderer';
export { DrillDownNavigator } from './ui-bridge/controllers/composite/drill-down-navigator';
export { CompositeConfigPanel } from './ui-bridge/controllers/composite/composite-config-panel';

// Analyze
export { LogParser } from './analyze/log-parser';
export { LogReplay } from './analyze/log-replay';
export { Metrics } from './analyze/metrics';
export { BottleneckDetector } from './analyze/bottleneck-detector';
export { ReportGenerator } from './analyze/report-generator';

// Stochastic
export { StochasticConfig } from './stochastic/stochastic-config';
export { MultipleRunManager } from './stochastic/multiple-run-manager';
export { StatisticalAnalysis } from './stochastic/statistical-analysis';
export { StochasticConfigUI } from './ui-bridge/stochastic/stochastic-config-ui';

// Utils
export { Logger } from './utils/logger';
export { URNGenerator } from './utils/urn-generator';
export { PerformanceMonitor } from './utils/performance';

// Version
export const VERSION = '1.0.0';
export const BUILD_DATE = '2026-02-22';
