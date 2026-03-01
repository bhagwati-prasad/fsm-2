# Cloud-Native Architecture FSM Tool - Complete Documentation

## Project Overview

The Cloud-Native Architecture FSM Tool is a comprehensive platform for visualizing, simulating, and analyzing cloud-native architectures using Finite State Machines. It enables architects and engineers to build complex system diagrams, run simulations with stochastic properties, and analyze performance bottlenecks.

## Key Features

### 1. Build Mode
- **Component Palette**: Drag-and-drop component library with categorization
- **Canvas Editor**: Visual diagram builder with real-time feedback
- **Component Configuration**: Edit properties, ports, and metadata
- **DataBus Management**: Create and configure data connections
- **Composite Components**: Build nested architectures

### 2. Simulation Mode
- **Frame-Based Execution**: Step-by-step simulation with frame control
- **Playback Controls**: Play, pause, stop, reset functionality
- **Timeline Scrubbing**: Jump to any frame in the simulation
- **Event Logging**: Real-time event capture and filtering
- **State Visualization**: Component state changes with animations

### 3. Analyze Mode
- **Log Parsing**: Parse and validate component logs
- **Log Replay**: Replay logs through simulation engine
- **Metrics Calculation**: Throughput, latency, error rate analysis
- **Bottleneck Detection**: Identify performance issues
- **Report Generation**: HTML, JSON, CSV export formats

### 4. Stochastic Configuration
- **Distribution Support**: Normal, Uniform, Exponential, Poisson
- **Multiple Runs**: Execute N simulations with stochastic values
- **Statistical Analysis**: Mean, median, variance, confidence intervals
- **Histogram Generation**: Visualize result distributions

## Architecture

### Core Layer
```
Component (Base class with state machine)
├── DataBus (Data routing component)
├── CompositeComponent (Nested components)
Graph (Component graph management)
EventBus (Global event system)
StateMachine (State transition management)
```

### Simulation Layer
```
SimulationEngine (Orchestrator)
├── Executor (Component execution)
├── Timeline (Frame management)
├── Checkpoint (State snapshots)
└── CostCalculator (Cost tracking)
```

### Storage Layer
```
StorageManager (Multi-driver abstraction)
├── LocalStorageDriver
├── SessionStorageDriver
├── IndexDBDriver
├── RESTClient
└── WebSocketClient
```

### UI Layer
```
UIBridge (Abstract renderer)
├── D3Renderer (SVG-based)
├── CanvasRenderer (Canvas-based)
BuildModeController
SimulationModeController
AnalyzeMode
StochasticConfigUI
```

## Component Model

### Component Structure
```javascript
{
  id: "component-1",
  name: "API Gateway",
  type: "network",
  ports: {
    input: [{name: "request", type: "any"}],
    output: [{name: "response", type: "any"}]
  },
  stateMachine: {
    initialState: "idle",
    states: {idle: {}, processing: {}, complete: {}},
    transitions: {idle: ["processing"], processing: ["complete", "idle"]}
  }
}
```

### URN Format
```
component://root/component-id
component://root/parent-id/child-id
component://root/parent-id/child-id/grandchild-id
```

## Event System

### Event Types
```
Component Events:
- component:init
- component:state-change
- component:execute
- component:error
- component:critical-error
- component:destroy

System Events:
- system:simulation-init
- system:simulation-start
- system:simulation-pause
- system:simulation-resume
- system:simulation-stop
- system:simulation-reset
- system:frame-advance
- system:frame-scrub
- system:frame-rewind

DataBus Events:
- databus:transfer

UI Events:
- ui:component-selected
- ui:component-deselected
- ui:drag-start
- ui:drop
- ui:snap-attach
```

## Data Flow

### Build Mode
```
User Input → UIBridge → Graph → ComponentLibrary → Storage
```

### Simulation Mode
```
Initial Input → SimulationEngine → Executor → Components → EventBus → Timeline → Storage
```

### Analyze Mode
```
Logs → LogParser → Analyzer → Metrics → ReportGenerator → UIBridge
```

## Storage Strategy

### Offline-First
1. Save to LocalStorage immediately
2. Queue for remote sync
3. Sync when network available
4. Automatic retry on failure

### Drivers
- **LocalStorage**: 5-10MB, persistent
- **SessionStorage**: 5-10MB, session-scoped
- **IndexDB**: Unlimited, persistent
- **REST API**: Server-dependent, cloud sync
- **WebSocket**: Real-time, bidirectional

## Performance Characteristics

### Rendering
- D3.js: Up to 500 components, 60 FPS
- Canvas: 100+ components, optimized
- Memory: ~1MB per 100 components

### Simulation
- Frame execution: 10-50ms
- Async components: Configurable timeout
- Event logging: ~100 bytes per event

### Storage
- LocalStorage write: <1ms
- IndexDB write: 10-50ms
- REST sync: 100-500ms (network dependent)

## Testing

### Test Coverage
- Unit Tests: 75+ test cases
- Integration Tests: Component workflows
- E2E Tests: Complete user scenarios
- Coverage: 70%+ of codebase

### Test Categories
- Core functionality
- Simulation execution
- Storage operations
- UI interactions
- Error handling

## API Reference

### Component API
```javascript
component.init(eventBus)
component.transitionState(newState, payload)
component.receiveInput(portName, data)
component.execute(context)
component.reset()
component.getStateSnapshot()
component.restoreStateSnapshot(snapshot)
```

### SimulationEngine API
```javascript
engine.init(initialInputs)
engine.start()
engine.pause()
engine.resume()
engine.stop()
engine.reset()
engine.nextFrame()
engine.previousFrame()
engine.jumpToFrame(frameNumber)
engine.getSimulationState()
engine.getComponentState(componentId)
engine.getErrors()
engine.getTotalCost()
```

### StorageManager API
```javascript
storage.save(key, data, driver)
storage.load(key, driver)
storage.delete(key, driver)
storage.sync(remoteDriver)
storage.export(key)
storage.import(key, jsonData)
```

### UIBridge API
```javascript
renderer.init(container, graph, eventBus)
renderer.render()
renderer.updateComponent(componentId, state)
renderer.animate(componentId, cssClass, duration)
renderer.selectComponent(componentId)
renderer.deselectComponent()
renderer.zoomIn()
renderer.zoomOut()
renderer.resetZoom()
renderer.fitToView()
renderer.clear()
renderer.destroy()
```

## Configuration Examples

### Simple Component
```javascript
const component = new Component({
  id: 'database-1',
  name: 'PostgreSQL',
  type: 'database',
  ports: {
    input: [{name: 'query', type: 'string'}],
    output: [{name: 'result', type: 'object'}]
  },
  stateMachine: {
    initialState: 'idle',
    states: {idle: {}, processing: {}, complete: {}},
    transitions: {idle: ['processing'], processing: ['complete', 'idle'], complete: ['idle']}
  },
  onExecute: async (component, context) => {
    return {status: 'success', data: 'query result'};
  }
});
```

### Composite Component
```javascript
const composite = new CompositeComponent({
  id: 'api-gateway',
  name: 'API Gateway',
  type: 'composite',
  innerGraph: new Graph(),
  exposedPorts: {
    input: [{name: 'request', innerComponentId: 'lb', innerPortName: 'input'}],
    output: [{name: 'response', innerComponentId: 'auth', innerPortName: 'output'}]
  }
});
```

### Stochastic Configuration
```javascript
const stochastic = new StochasticConfig();
stochastic.configureProperty(
  'component-1',
  'executionTime',
  'normal',
  {mean: 100, stdDev: 20}
);
```

## Deployment

### Requirements
- Node.js 14+
- Modern browser (Chrome, Firefox, Safari, Edge)
- 100MB disk space
- 512MB RAM minimum

### Installation
```bash
npm install
npm run build
npm start
```

### Configuration
- Edit `config.json` for storage settings
- Configure API endpoints in `storage-config.js`
- Set WebSocket URL in `websocket-config.js`

## Troubleshooting

### Common Issues

**Simulation not starting:**
- Ensure at least one component exists
- Check that entry points have input ports
- Verify initial inputs are provided

**Rendering issues:**
- Clear browser cache
- Check browser console for errors
- Try Canvas renderer if D3 fails

**Storage problems:**
- Check browser storage quota
- Verify REST API endpoint
- Check WebSocket connection

## Future Enhancements

1. **Collaborative Editing**: Real-time multi-user support
2. **Advanced Analytics**: ML-based bottleneck detection
3. **3D Visualization**: Three.js renderer
4. **Custom Metrics**: User-defined KPIs
5. **Cloud Integration**: Direct AWS/GCP/Azure API integration
6. **Mobile Support**: Responsive design for tablets
7. **Export Formats**: Terraform, CloudFormation templates

## Additional Documentation

For detailed information on specific subsystems, see:

- **Build Mode**: `docs/BUILD_MODE_GUIDE.md`
- **Simulation Mode**: `docs/SIMULATION_MODE_GUIDE.md`
- **Analyze Mode**: `docs/ANALYZE_MODE_GUIDE.md`
- **Composite Components**: `docs/COMPOSITE_COMPONENTS_GUIDE.md`
- **Stochastic Configuration**: `docs/STOCHASTIC_CONFIGURATION_GUIDE.md`
- **UI Components API**: `docs/UI_COMPONENTS_REFERENCE.md`
- **Codebase Analysis**: `docs/CODEBASE_DOCUMENTATION_ANALYSIS.md`

## Support

For issues, questions, or contributions:
- GitHub Issues: [project-repo]/issues
- Documentation: [project-docs]
- Email: support@example.com

## License

MIT License - See LICENSE file for details

## Version History

### v1.0.0 (Current)
- Core foundation complete
- Simulation engine functional
- Storage system operational
- UI fully implemented
- Composite components supported
- Analysis mode available
- Stochastic configuration enabled

### Roadmap
- v1.1.0: Performance optimization
- v1.2.0: Collaborative features
- v2.0.0: Advanced analytics
