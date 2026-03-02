# Simulation Mode Guide

Simulation Mode enables frame-by-frame execution of component architectures with playback controls, event logging, and state visualization.

## Components

### SimulationModeController
Orchestrates simulation mode. Manages initialization, playback, and state tracking.

### InputForm
Collects initial input values for simulation entry points.

### PlaybackControls
Provides play, pause, stop, reset, and speed controls.

### TimelineVisualization
Displays frame timeline with scrubbing capability.

### EventLogViewer
Shows events emitted during simulation with filtering and export options.

## Workflow

1. **Input Setup**: User provides initial inputs
2. **Simulation Start**: User starts simulation
3. **Playback**: User controls playback with play/pause/stop
4. **Frame Navigation**: User scrubs through frames
5. **Event Inspection**: User views and filters events
6. **Analysis**: User analyzes results and costs

## Events

- `system:simulation-start` - Simulation started
- `system:simulation-pause` - Simulation paused
- `system:simulation-resume` - Simulation resumed
- `system:simulation-stop` - Simulation stopped
- `system:frame-advance` - Frame advanced
- `system:frame-scrub` - Frame scrubbed
- `system:frame-rewind` - Frame rewound

## API

See `docs/API_REFERENCE.md` for detailed API documentation.
