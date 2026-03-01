# Cloud-Native Architecture FSM Tool - API Reference

## Table of Contents
1. [Core Classes](#core-classes)
2. [Simulation Classes](#simulation-classes)
3. [Storage Classes](#storage-classes)
4. [UI Classes](#ui-classes)
5. [Analysis Classes](#analysis-classes)
6. [Stochastic Classes](#stochastic-classes)
7. [Utility Classes](#utility-classes)

## Core Classes

### Component

**Constructor**

```javascript
new Component(config)
```

The `config` object can have the following properties:

- `id` (string): Unique component ID within scope
- `name` (string): Component name
- `type` (string): Component type (e.g., 'database', 'compute')
- `ports` (Object): Port definitions `{input: [], output: []}`
- `stateMachine` (Object): State machine definition
- `config` (Object): Component-specific configuration
- `costModel` (Object): Cost model definition
- `parentId` (string, optional): Parent component ID for nested components
- `graphScope` (string, optional): Graph scope (default: 'root')
- `initialState` (Object, optional): Initial state values
- `title` (string, optional): Component title
- `description` (string, optional): Component description
- `metadata` (Object, optional): Additional metadata
- `onInit` (function, optional): Lifecycle hook for initialization
- `onStateChange` (function, optional): Lifecycle hook for state changes
- `onExecute` (function, optional): Lifecycle hook for execution
- `onError` (function, optional): Lifecycle hook for errors
- `onDestroy` (function, optional): Lifecycle hook for destruction
- `asyncExecution` (boolean, optional): Whether the component executes asynchronously
- `frameDuration` (number, optional): Duration of a frame in milliseconds
- `maxRetries` (number, optional): Maximum number of retries on failure
- `retryDelay` (number, optional): Delay between retries in milliseconds
- `timeout` (number, optional): Execution timeout in milliseconds

**Methods**
- `init(eventBus)` - Initialize component
- `transitionState(newState, payload)` - Change state
- `receiveInput(portName, data)` - Receive input
- `getInput(portName)` - Get single input
- `getAllInputs(portName)` - Get all inputs
- `clearInputs()` - Clear received inputs
- `execute(context)` - Execute component
- `handleError(error, context)` - Handle execution error
- `reset()` - Reset to initial state
- `destroy()` - Clean up resources
- `getStateSnapshot()` - Get state snapshot
- `restoreStateSnapshot(snapshot)` - Restore state

### Graph

**Constructor**
```javascript
new Graph(config)
```

**Methods**
- `addComponent(component)` - Add component
- `removeComponent(componentId)` - Remove component
- `getComponent(componentId)` - Get component
- `getComponents()` - Get all components
- `addConnection(connection)` - Add connection
- `removeConnection(connectionId)` - Remove connection
- `getConnection(connectionId)` - Get connection
- `getConnections()` - Get all connections
- `getOutgoingConnections(componentId)` - Get outgoing
- `getIncomingConnections(componentId)` - Get incoming
- `detectCycles()` - Detect cycles
- `topologicalSort()` - Get execution order
- `getExecutionOrder()` - Get execution order
- `getDependencies(componentId)` - Get dependencies
- `getDependents(componentId)` - Get dependents
- `validate()` - Validate graph
- `getStatistics()` - Get statistics

### EventBus

**Constructor**
```javascript
new EventBus()
```

**Methods**
- `subscribe(eventType, callback)` - Subscribe to events
- `emit(event)` - Emit event
- `getEventLog(filter)` - Get event log
- `clearEventLog()` - Clear log
- `getEventCount()` - Get event count

### DataBus

**Extends: `Component`**

**Constructor**

```javascript
new DataBus(config)
```

The `config` object can have the following properties:

- `id` (string): Unique DataBus ID
- `type` (string): DataBus type (one-to-one, one-to-many, many-to-one, many-to-many)
- `source` (string|Array): Source component ID(s)
- `target` (string|Array): Target component ID(s)
- `channels` (Array): Channel definitions
- `bandwidth` (number, optional): Bandwidth limit (bytes/frame)
- `distributionStrategy` (string, optional): Distribution strategy for one-to-many
- `aggregationStrategy` (string, optional): Aggregation strategy for many-to-one
- `routingStrategy` (string, optional): Routing strategy for many-to-many

**Methods**

- `transfer(channelName, data)` - Transfer data
- `getChannelQueue(channelName)` - Get queue
- `clearChannelQueue(channelName)` - Clear queue
- `reset()` - Reset DataBus state

**Inherited Methods**

Since `DataBus` extends `Component`, it inherits all of its methods:

- `init(eventBus)`
- `transitionState(newState, payload)`
- `receiveInput(portName, data)`
- `getInput(portName)`
- `getAllInputs(portName)`
- `clearInputs()`
- `execute(context)`
- `handleError(error, context)`
- `destroy()`
- `getStateSnapshot()`
- `restoreStateSnapshot(snapshot)`


### StateMachine

**Constructor**
```javascript
new StateMachine(definition)
```
- `definition` (Object): State machine definition
  - `initialState` (string): Initial state
  - `states` (Object): State definitions
  - `transitions` (Object): Valid transitions

**Methods**
- `canTransition(fromState, toState)` - Check if transition is valid
- `getValidNextStates(currentState)` - Get valid next states
- `validate()` - Validate state machine definition

## Simulation Classes

### SimulationEngine

**Constructor**
```javascript
new SimulationEngine(graph, eventBus, config)
```

**Methods**
- `init(initialInputs)` - Initialize
- `start()` - Start simulation
- `pause()` - Pause simulation
- `resume()` - Resume simulation
- `stop()` - Stop simulation
- `reset()` - Reset simulation
- `nextFrame()` - Execute next frame
- `previousFrame()` - Go to previous frame
- `jumpToFrame(frameNumber)` - Jump to frame
- `getSimulationState()` - Get state
- `getCurrentFrame()` - Get current frame
- `getFrameCount()` - Get frame count
- `getComponentState(componentId)` - Get component state
- `getErrors()` - Get errors
- `getTotalCost()` - Get total cost

### Executor

**Constructor**
```javascript
new Executor(graph, eventBus)
```

**Methods**
- `executeComponent(componentId, context)` - Execute component
- `executeWithRetry(componentId, maxRetries)` - Execute with retry
- `getExecutionOrder()` - Get execution order
- `getComponentState(componentId)` - Get state
- `isComponentExecuting(componentId)` - Check if executing

### Timeline

**Constructor**
```javascript
new Timeline(maxFrames)
```

**Methods**
- `addFrame(frame)` - Add frame
- `getCurrentFrame()` - Get current frame
- `getFrame(frameNumber)` - Get frame
- `nextFrame()` - Move to next
- `previousFrame()` - Move to previous
- `jumpToFrame(frameNumber)` - Jump to frame
- `createSegment(id, start, end)` - Create segment
- `deleteSegment(segmentId)` - Delete segment
- `getSegment(segmentId)` - Get segment
- `getAllSegments()` - Get all segments
- `getCurrentFrameNumber()` - Get frame number
- `getFrameCount()` - Get frame count
- `clearHistory()` - Clear history
- `getFrameHistory()` - Get history

### Checkpoint

**Constructor**
```javascript
new Checkpoint(maxCheckpoints)
```

**Methods**
- `save(frameNumber, state)` - Save checkpoint
- `restore(frameNumber)` - Restore checkpoint
- `delete(frameNumber)` - Delete checkpoint
- `hasCheckpoint(frameNumber)` - Check existence
- `getCheckpoint(frameNumber)` - Get checkpoint
- `getAllCheckpoints()` - Get all checkpoints
- `clear()` - Clear all
- `getMemoryUsage()` - Get memory usage

### CostCalculator

**Constructor**
```javascript
new CostCalculator(costModels)
```

**Methods**
- `calculateComponentCost(componentId, frame)` - Calculate cost
- `calculateDataBusCost(dataBusId, dataSize)` - Calculate cost
- `calculateTotalCost(simulation)` - Calculate total
- `trackTransfer(dataBusId, dataSize)` - Track transfer
- `trackComponentExecution(componentId, duration)` - Track execution
- `getCostBreakdown()` - Get breakdown
- `getCostByComponent()` - Get by component
- `getCostByDataBus()` - Get by DataBus
- `registerCostModel(type, model)` - Register model
- `getCostModel(type)` - Get model
- `clear()` - Clear costs

## Storage Classes

### StorageManager

**Constructor**
```javascript
new StorageManager(config)
```

**Methods**
- `registerDriver(name, driver)` - Register driver
- `getDriver(name)` - Get driver
- `save(key, data, driver)` - Save data
- `load(key, driver)` - Load data
- `delete(key, driver)` - Delete data
- `sync(remoteDriver)` - Sync data
- `export(key)` - Export as JSON
- `import(key, jsonData)` - Import from JSON
- `getPendingSyncCount()` - Get pending count
- `clearPendingSync()` - Clear pending

### LocalStorageDriver

**Methods**
- `save(key, data)` - Save
- `load(key)` - Load
- `delete(key)` - Delete
- `clear()` - Clear all
- `getSize()` - Get size

### IndexDBDriver

**Methods**
- `init()` - Initialize
- `save(key, data)` - Save
- `load(key)` - Load
- `delete(key)` - Delete
- `clear()` - Clear all

### RESTClient

**Methods**
- `save(key, data)` - Save
- `load(key)` - Load
- `delete(key)` - Delete

### WebSocketClient

**Methods**
- `connect()` - Connect
- `disconnect()` - Disconnect
- `save(key, data)` - Save
- `load(key)` - Load
- `delete(key)` - Delete

## UI Classes

### UIBridge

**Methods**
- `init(container, graph, eventBus)` - Initialize
- `render()` - Render graph
- `updateComponent(componentId, state)` - Update component
- `animate(componentId, cssClass, duration)` - Animate
- `selectComponent(componentId)` - Select
- `deselectComponent()` - Deselect
- `showComponentDetails(componentId)` - Show details
- `hideComponentDetails()` - Hide details
- `zoomIn()` - Zoom in
- `zoomOut()` - Zoom out
- `resetZoom()` - Reset zoom
- `panToComponent(componentId)` - Pan to
- `fitToView()` - Fit to view
- `clear()` - Clear
- `destroy()` - Destroy

### D3Renderer

**Extends UIBridge**

### CanvasRenderer

**Extends UIBridge**

## Analysis Classes

### LogParser

**Methods**
- `parseLog(logContent)` - Parse log
- `getParsedEvents()` - Get events
- `filterByType(type)` - Filter by type
- `filterByComponent(componentId)` - Filter by component
- `getEventsInRange(start, end)` - Get in range
- `getStatistics()` - Get statistics

### LogReplay

**Methods**
- `startReplay(events, speed)` - Start replay
- `pauseReplay()` - Pause
- `resumeReplay()` - Resume
- `stopReplay()` - Stop
- `getProgress()` - Get progress

### Metrics

**Methods**
- `calculate(events)` - Calculate metrics
- `getMetrics()` - Get metrics
- `getComponentMetrics(componentId)` - Get component metrics

### BottleneckDetector

**Methods**
- `detect(metrics)` - Detect bottlenecks
- `getBottlenecks()` - Get bottlenecks
- `getByServerity(severity)` - Get by severity

### ReportGenerator

**Methods**
- `generate(metrics, bottlenecks)` - Generate report
- `exportJSON(report)` - Export JSON
- `exportCSV(report)` - Export CSV

## Stochastic Classes

### StochasticConfig

**Methods**
- `registerDistribution(name, definition)` - Register
- `getDistribution(name)` - Get distribution
- `configureProperty(componentId, property, type, params)` - Configure
- `getComponentConfig(componentId)` - Get config
- `generateValue(componentId, property)` - Generate value
- `generateAllValues(componentId)` - Generate all
- `getAllDistributions()` - Get all

### MultipleRunManager

**Methods**
- `executeMultipleRuns(count, inputs)` - Execute runs
- `getRunResults()` - Get results
- `getRunStatistics()` - Get statistics

### StatisticalAnalysis

**Methods**
- `analyze(runs)` - Analyze

## Utility Classes

### URNGenerator

**Static Methods**
- `generate(config)` - Generate URN
- `parse(urn)` - Parse URN
- `isValid(urn)` - Validate URN

### Logger

**Methods**
- `setLevel(level)` - Set level
- `debug(message, data)` - Debug
- `info(message, data)` - Info
- `warn(message, data)` - Warn
- `error(message, data)` - Error

### PerformanceMonitor

**Methods**
- `start(label)` - Start
- `end(label)` - End
- `getMetrics(label)` - Get metrics
- `clear(label)` - Clear
