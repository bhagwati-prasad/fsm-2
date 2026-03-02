# Stochastic Configuration Guide

Stochastic Configuration enables probabilistic component properties for realistic simulation scenarios.

## Overview

Instead of fixed values, components can have properties that vary according to probability distributions.

## Supported Distributions

### Normal Distribution
Gaussian distribution with mean and standard deviation.
```javascript
{
  type: 'normal',
  mean: 100,
  stdDev: 20
}
```

### Uniform Distribution
Equal probability across range.
```javascript
{
  type: 'uniform',
  min: 50,
  max: 150
}
```

### Exponential Distribution
Decaying probability (useful for timeouts).
```javascript
{
  type: 'exponential',
  lambda: 0.01
}
```

### Poisson Distribution
Discrete events over time interval.
```javascript
{
  type: 'poisson',
  lambda: 5
}
```

## Configuration

### Step 1: Create StochasticConfig
```javascript
const stochastic = new StochasticConfig();
```

### Step 2: Configure Properties
```javascript
stochastic.configureProperty(
  'database-1',
  'executionTime',
  'normal',
  {mean: 100, stdDev: 20}
);
```

### Step 3: Generate Values
```javascript
const value = stochastic.generateValue('database-1', 'executionTime');
```

## Multiple Runs

### Execute Multiple Simulations
```javascript
const manager = new MultipleRunManager(engine, stochastic, eventBus, {
  resetAfterSingleRun: true,
  pollIntervalMs: 100
});
const runResult = await manager.executeMultipleRuns(100, initialInputs);
```

### Analyze Results
```javascript
const analysis = new StatisticalAnalysis();
const stats = analysis.analyze(runResult.runs);

console.log('Cost Mean:', stats.summary.cost.mean);
console.log('Cost Median:', stats.summary.cost.median);
console.log('Cost Variance:', stats.variance.cost);
console.log('Cost 95% CI:', stats.confidence.cost);
```

## Use Cases

### Network Latency
```javascript
stochastic.configureProperty(
  'network-1',
  'latency',
  'exponential',
  {lambda: 0.01}
);
```

### Database Query Time
```javascript
stochastic.configureProperty(
  'database-1',
  'queryTime',
  'normal',
  {mean: 50, stdDev: 10}
);
```

### Error Rate
```javascript
stochastic.configureProperty(
  'service-1',
  'errorRate',
  'uniform',
  {min: 0.01, max: 0.05}
);
```

### Request Volume
```javascript
stochastic.configureProperty(
  'api-1',
  'requestsPerSecond',
  'poisson',
  {lambda: 100}
);
```

## Results Interpretation

### Mean
Average value across all runs.

### Median
Middle value when sorted.

### Variance
Measure of spread around mean.

### Standard Deviation
Square root of variance.

### Confidence Interval
Range containing true value with specified confidence (e.g., 95%).

### Percentiles
- 25th percentile (Q1): Lower quartile
- 50th percentile (Q2): Median
- 75th percentile (Q3): Upper quartile

## Visualization

### Histogram
Shows distribution of results.

### Box Plot
Shows quartiles and outliers.

### Time Series
Shows results over multiple runs.

## API

See `docs/API_REFERENCE.md` for detailed API documentation.
