# Cloud-Native Architecture FSM Tool

A headless Finite State Machine tool for cloud-native architecture visualization, simulation, and analysis.

## Features

- **Build Mode**: Create cloud-native architecture diagrams by dragging and dropping components
- **Simulation Mode**: Execute simulations with frame-by-frame playback, cost tracking, and event logging
- **Analyze Mode**: Replay real-world logs to identify bottlenecks and performance issues
- **Component Library**: Pre-built components for cloud vendors (GCP, AWS, Azure) and software constructs
- **Composite Components**: Create nested architectures with expandable/collapsible views
- **Multi-Driver Storage**: Offline-first with support for LocalStorage, IndexDB, REST, and WebSocket sync
- **Stochastic Configuration**: Support for probabilistic component properties
- **UIBridge Pattern**: Headless architecture allowing different renderers (D3.js, Canvas, etc.)

## Project Structure

```
src/
├── core/                 # Core component model and graph engine
├── simulation/           # Simulation execution and playback
├── storage/              # Multi-driver persistence layer
├── ui-bridge/            # UI adapters exposing core to renderers
│   ├── adapters/         # Renderer adapters and event mappers
│   │   └── renderers/    # Renderer adapter entry points
│   ├── controllers/      # UI flow controllers by mode
│   │   ├── build-mode/
│   │   ├── simulation-mode/
│   │   └── composite/
│   ├── interactions/     # Interaction handlers
│   ├── animations/       # Animation utilities
│   └── stochastic/       # Stochastic configuration UI
├── analyze/              # Log replay and bottleneck analysis
├── stochastic/           # Stochastic simulation support
└── utils/                # Utilities and helpers

tests/
├── unit/                 # Unit tests
└── integration/          # Integration tests

docs/                     # Documentation
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Refresh component/composite definition indexes
npm run library:refresh-indexes
```

### Build

```bash
npm run build
```

## Architecture

### Core Concepts

- **Component**: Basic building block with ports, state machine, and lifecycle hooks
- **DataBus**: Routes data between components (1:1, 1:N, N:1, N:M)
- **Graph**: Collection of components and connections
- **Event Bus**: Global event system with namespacing and bubbling
- **Simulation Engine**: Frame-based execution with state tracking
- **UIBridge**: Abstract renderer interface for different visualization backends

### Component URN Format

```
component://{graph-scope}/{parent-chain}/{component-id}

Examples:
- component://root/reverse-proxy-1
- component://root/api-gateway-composite/reverse-proxy-1
```

## Development Phases

1. **Phase 1**: Core Foundation (Weeks 1-3)
2. **Phase 2**: Simulation Engine (Weeks 4-6)
3. **Phase 3**: Storage & Persistence (Weeks 7-8)
4. **Phase 4**: UIBridge & D3.js Renderer (Weeks 9-11)
5. **Phase 5**: Build Mode UI (Weeks 12-13)
6. **Phase 6**: Simulation Mode UI (Weeks 14-15)
7. **Phase 7**: Composite Components (Weeks 16-17)
8. **Phase 8**: Analyze Mode (Weeks 18-19)
9. **Phase 9**: Stochastic Configuration (Weeks 20-21)
10. **Phase 10**: Performance Optimization & Polish (Weeks 22-23)

## Testing

- **Unit Tests**: Component lifecycle, state machines, graph operations
- **Integration Tests**: Build mode, simulation mode, analyze mode workflows
- **Performance Tests**: Rendering, event system, simulation execution

## Documentation

See `docs/` directory for:
- Architecture documentation
- API reference
- Component guide
- Mode-specific guides
- Architecture Decision Records (ADRs): `docs/adr/`

## License

MIT
