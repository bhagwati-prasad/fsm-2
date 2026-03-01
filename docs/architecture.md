# Cloud-Native Architecture FSM Tool - Architecture Documentation

## Overview

The Cloud-Native Architecture FSM Tool is a headless Finite State Machine system for visualizing, simulating, and analyzing cloud-native architectures. It uses a modular, layered architecture with clear separation of concerns.

## Architecture Layers

### 1. Core Layer (`src/core/`)

The foundation of the system, providing fundamental abstractions:

- **Component**: Base class for all components with lifecycle hooks, state machine, and port management
- **DataBus**: Special component for routing data between components (supports 1:1, 1:N, N:1, N:M)
- **Graph**: Graph engine for managing component relationships and execution order
- **EventBus**: Global event system with namespacing, filtering, and bubbling
- **StateMachine**: State machine implementation for component state transitions

### 2. Simulation Layer (`src/simulation/`)

Handles simulation execution and playback:

- **SimulationEngine**: Main simulation orchestrator
- **Executor**: Component execution logic (sync/async)
- **Timeline**: Frame-based playback and navigation
- **Checkpoint**: State snapshots for undo/redo
- **CostCalculator**: Cost tracking and calculation

### 3. Storage Layer (`src/storage/`)

Multi-driver persistence with offline-first strategy:

- **StorageManager**: Storage abstraction and coordination
- **Drivers**: LocalStorage, SessionStorage, IndexDB, REST, WebSocket
- **Serializer**: JSON export/import with versioning

### 4. UI Bridge Layer - Build Mode (`src/ui-bridge/build-mode/`)

Build mode UI components:

- **BuildModeController**: Build mode orchestration
- **ComponentPalette**: Component library UI with drag-drop
- **ComponentLibrary**: Component library management and instantiation
- **BuildCanvas**: Visual diagram editor
- **ComponentConfigPanel**: Component property editor
- **DataBusManager**: DataBus creation and management UI

### 5. UI Bridge Layer - Simulation Mode (`src/ui-bridge/simulation-mode/`)

Simulation mode UI components:

- **SimulationModeController**: Simulation mode orchestration
- **InputForm**: Initial input form for simulations
- **PlaybackControls**: Play, pause, stop, reset controls
- **TimelineVisualization**: Frame timeline visualization
- **EventLogViewer**: Event log display and filtering

### 6. UI Bridge Layer - Composite Components (`src/ui-bridge/composite/`)

Composite component UI:

- **CompositeLibrary**: Pre-built composite component definitions
- **CompositeRenderer**: Composite component visualization
- **DrillDownNavigator**: Drill-down navigation for nested components
- **CompositeConfigPanel**: Composite component configuration

### 7. UI Bridge Layer - Interactions & Animations (`src/ui-bridge/`)

Interaction and animation handlers:

#### Interactions (`src/ui-bridge/interactions/`)
- **DragDropHandler**: Drag-and-drop interaction handling
- **SnapAttachHandler**: Snap-to-grid and attachment handling

#### Animations (`src/ui-bridge/animations/`)
- **StateAnimator**: Component state change animations
- **DataBusAnimator**: Data flow animations

#### Stochastic UI (`src/ui-bridge/stochastic/`)
- **StochasticConfigUI**: Stochastic property configuration UI

### 8. Analyze Layer (`src/analyze/`)

Log replay and bottleneck analysis:

- **LogParser**: Log parsing and validation
- **LogReplay**: Log replay through simulation engine
- **Metrics**: Metrics calculation (throughput, latency, error rate)
- **BottleneckDetector**: Performance bottleneck detection
- **ReportGenerator**: Report generation (HTML, JSON, CSV)

### 9. Stochastic Layer (`src/stochastic/`)

Stochastic simulation support:

- **StochasticConfig**: Stochastic property configuration and distribution management
- **MultipleRunManager**: Multiple simulation run execution and aggregation
- **StatisticalAnalysis**: Statistical analysis of multiple runs

### 10. Utilities (`src/utils/`)

Common utilities:

- **URNGenerator**: Component URN generation and parsing
- **Logger**: Logging utility with configurable levels
- **PerformanceMonitor**: Performance tracking and metrics

## Data Flow

### Build Mode

```
User Input → UIBridge → Graph → ComponentLibrary → Storage
```

1. User drags components and creates connections
2. UIBridge captures interactions
3. Graph validates and stores structure
4. ComponentLibrary provides component definitions
5. Storage persists diagram

### Simulation Mode

```
Initial Input → SimulationEngine → Executor → Components → EventBus → Timeline → Storage
```

1. User provides initial input
2. SimulationEngine orchestrates execution
3. Executor runs components in order
4. Components emit events
5. EventBus routes events
6. Timeline tracks frames
7. Storage logs events

### Analyze Mode

```
Logs → LogParser → Analyzer → Metrics → ReportGenerator → UIBridge
```

1. User uploads component logs
2. LogParser validates and structures logs
3. Analyzer replays logs through simulation
4. Metrics calculates performance data
5. ReportGenerator creates analysis report
6. UIBridge displays results

## Component URN Structure

```
component://{graph-scope}/{parent-chain}/{component-id}

Examples:
- component://root/reverse-proxy-1
- component://root/api-gateway/reverse-proxy-1
- component://root/system/api-gateway/reverse-proxy-1
```

## Event System

### Event Structure

```javascript
{
  id: 'event-123456789',
  urn: 'component://root/component-1',
  type: 'component:state-change',
  timestamp: '2026-02-21T22:13:48Z',
  payload: { ... },
  origin: { componentId: 'component-1', parentChain: [] },
  bubbled: false
}
```

### Event Namespaces and Types

#### Component Events (`component:*`)
- `component:init` - Component initialization
- `component:state-change` - State transition
- `component:execute` - Component execution
- `component:error` - Non-critical error
- `component:critical-error` - Critical error
- `component:destroy` - Component destruction

#### System Events (`system:*`)
- `system:simulation-init` - Simulation initialization
- `system:simulation-start` - Simulation start
- `system:simulation-pause` - Simulation pause
- `system:simulation-resume` - Simulation resume
- `system:simulation-stop` - Simulation stop
- `system:simulation-reset` - Simulation reset
- `system:frame-advance` - Frame advancement
- `system:frame-scrub` - Frame scrubbing (jump)
- `system:frame-rewind` - Frame rewind (previous)

#### DataBus Events (`databus:*`)
- `databus:transfer` - Data transfer between components

#### UI Events (`ui:*`)
- `ui:component-drag-start` - Component drag start (from palette)
- `ui:component-dropped` - Component dropped on canvas
- `ui:component-delete-requested` - Component deletion request
- `ui:diagram-save-requested` - Diagram save request
- `ui:mode-switch-requested` - Mode switch request
- `ui:component-selected` - Component selection
- `ui:component-deselected` - Component deselection

### Event Bubbling

Events from nested components bubble up with modified URN:

```
component://root/parent/child → component://root/parent
```

## State Machine Pattern

Each component has a state machine defining valid state transitions:

```javascript
{
  initialState: 'idle',
  states: {
    idle: {},
    processing: {},
    complete: {},
    error: {}
  },
  transitions: {
    idle: ['processing', 'error'],
    processing: ['complete', 'error'],
    complete: ['idle'],
    error: ['idle']
  }
}
```

## Storage Strategy

### Offline-First

1. All changes written to local storage immediately
2. Manual sync to remote (user-initiated)
3. Auto-sync via REST (polling) or WebSocket (real-time)

### Persisted Data

1. Diagram definition (components, connections, config)
2. Simulation state (current frame, component states)
3. Event log (immutable append-only)
4. Execution history (metadata)
5. Initial inputs (seed data)

## Performance Optimizations

### Rendering

- Virtual scrolling for large graphs
- Dirty flagging for DOM updates
- CSS transforms for GPU acceleration
- Canvas fallback for 100+ components

### Event System

- Event pooling to reduce GC pressure
- Selective subscription to relevant events
- Event batching for state changes
- Lazy event log archival to IndexDB

### Simulation

- Lazy evaluation of components
- Memoization of component outputs
- Web Workers for heavy computation
- Incremental updates through affected components

## Extension Points

### Custom Components

Extend `Component` class and register with library:

```javascript
class CustomComponent extends Component {
  // Custom implementation
}

library.registerComponent('custom', CustomComponent);
```

### Custom Renderers

Implement `UIBridge` interface:

```javascript
class CustomRenderer extends UIBridge {
  render(graph, container) { ... }
  update(component, state) { ... }
  animate(component, cssClass, duration) { ... }
}
```

### Custom Storage Drivers

Implement storage driver interface:

```javascript
class CustomDriver {
  async save(key, data) { ... }
  async load(key) { ... }
  async delete(key) { ... }
}
```

## Testing Strategy

### Unit Tests

- Component lifecycle and state machines
- Graph operations and validation
- Event system
- Storage drivers
- Cost calculations

### Integration Tests

- Build mode workflow
- Simulation mode workflow
- Analyze mode workflow
- Storage sync strategies

### E2E Tests

- Complete user workflows
- 7-component test scenario
- Composite component workflows

## Security Considerations

1. **Input Validation**: All user inputs validated against schemas
2. **Event Filtering**: Components can clip events to prevent bubbling
3. **Storage Encryption**: Optional encryption for sensitive data
4. **CORS**: WebSocket and REST endpoints require proper CORS configuration
5. **Conflict Resolution**: Version tracking prevents data loss

## Future Enhancements

1. **Collaborative Editing**: Real-time multi-user support
2. **Advanced Analytics**: Machine learning for bottleneck detection
3. **3D Visualization**: Three.js renderer for complex architectures
4. **Custom Metrics**: User-defined metrics and KPIs
5. **Integration**: Direct integration with cloud provider APIs
