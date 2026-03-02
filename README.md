# Cloud-Native Architecture FSM Tool

**Version**: 1.0.0 | **Status**: Production Ready | **Updated**: 2026-02-24

## Overview

A comprehensive platform for visualizing, simulating, and analyzing cloud-native architectures using Finite State Machines.

## Quick Start

### Installation

```bash
git clone https://github.com/bhagwati-prasad/fsm-2.git
cd fsm-2
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:coverage
```

## Features

### Build Mode
- ✅ Drag-and-drop component palette
- ✅ Visual diagram builder
- ✅ Component configuration
- ✅ DataBus management
- ✅ Composite components

### Simulation Mode
- ✅ Frame-based execution
- ✅ Playback controls
- ✅ Timeline scrubbing
- ✅ Event logging
- ✅ State visualization

### Analyze Mode
- ✅ Log parsing
- ✅ Log replay
- ✅ Metrics calculation
- ✅ Bottleneck detection
- ✅ Report generation

### Stochastic Configuration
- ✅ Multiple distributions
- ✅ Multiple runs
- ✅ Statistical analysis
- ✅ Confidence intervals

## Project Structure

```
cloud-native-fsm-tool/
├── src/                    # All source code
│   ├── core/              # Core components
│   ├── simulation/         # Simulation engine
│   ├── storage/            # Storage system
│   ├── ui-bridge/          # UI components
│   ├── analyze/            # Analysis tools
│   ├── stochastic/         # Stochastic config
│   ├── utils/              # Utilities
│   ├── index.js            # Main entry
│   └── server.js           # Express server
├── public/                 # Frontend assets
├── tests/                  # All tests
├── docs/                   # Documentation
├── DEPLOYMENT_README.md    # Deployment guide
├── .babelrc                # Babel config
├── jest.config.js          # Jest config
├── jest.setup.js           # Jest setup
├── webpack.config.js       # Webpack config
├── package.json            # Dependencies
└── README.md               # This file
```

## Configuration

### Environment Variables

Create `.env` file:

```bash
NODE_ENV=production
PORT=3000
API_URL=https://api.example.com
WS_URL=wss://ws.example.com
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Performance

- **Rendering**: Up to 500 components at 60 FPS
- **Simulation**: 10-50ms per frame
- **Storage**: <1ms LocalStorage, 10-50ms IndexDB
- **Memory**: ~1MB per 100 components

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Documentation

- **[Complete Documentation](docs/COMPLETE_DOCUMENTATION.md)**
- **[API Reference](docs/API_REFERENCE.md)**
- **[Architecture Decision Records](docs/adr/README.md)**
- **[Deployment Guide](DEPLOYMENT_README.md)**
- **[Documentation Index](docs/README.md)**

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Refresh component/composite definition indexes
npm run library:refresh-indexes

# Build
npm run build
```

## License

MIT License - See LICENSE file for details

## Version History

### v1.0.0 (2026-02-24)
- ✅ Initial production release
- ✅ All 10 phases complete
- ✅ 16,500+ lines of code
- ✅ 75+ test cases
- ✅ Comprehensive documentation
- ✅ Project structure consolidated
- ✅ Babel/Jest configuration fixed

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/bhagwati-prasad/fsm-2/issues
- **Email**: support@example.com
