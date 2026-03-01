# Analyze Mode Guide

Analyze Mode enables users to parse real-world logs, replay them through the simulation engine, and identify performance bottlenecks.

## Components

### LogParser
Parses and validates component logs from various sources.

### LogReplay
Replays parsed logs through the simulation engine.

### Metrics
Calculates performance metrics:
- Throughput (events/second)
- Latency (min, max, average)
- Error rate
- Component utilization

### BottleneckDetector
Identifies performance bottlenecks:
- Slow components
- High error rates
- Resource contention
- Timeout issues

### ReportGenerator
Generates analysis reports in multiple formats:
- HTML (interactive)
- JSON (machine-readable)
- CSV (spreadsheet-compatible)

## Workflow

1. **Log Upload**: User uploads component logs
2. **Log Parsing**: System parses and validates logs
3. **Log Replay**: System replays logs through simulation
4. **Metrics Calculation**: System calculates performance metrics
5. **Bottleneck Detection**: System identifies bottlenecks
6. **Report Generation**: System generates analysis report
7. **Report Export**: User exports report in desired format

## Log Format

Expected log format (JSON):
```json
[
  {
    "timestamp": "2026-02-25T10:30:00Z",
    "componentId": "component-1",
    "type": "component:state-change",
    "payload": {
      "oldState": "idle",
      "newState": "processing"
    }
  }
]
```

## API

See `docs/API_REFERENCE.md` for detailed API documentation.
