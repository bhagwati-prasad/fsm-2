# Composite Components Guide

Composite Components allow you to create nested architectures by grouping multiple components into a single reusable unit.

## Overview

Composite components are containers that hold inner components and expose selected ports as external interfaces.

## Components

### CompositeLibrary
Manages pre-built composite definitions:
- API Gateway (load balancer + rate limiter + auth)
- Database Cluster (primary + replicas)
- Microservice (service + cache + queue)

### CompositeRenderer
Visualizes composite components with collapsible/expandable views.

### DrillDownNavigator
Provides navigation through nested component hierarchies with breadcrumb trail.

### CompositeConfigPanel
Allows configuration of composite properties and exposed ports.

## Creating Composites

### Step 1: Define Inner Components
```javascript
const innerComponents = [
  {id: 'lb', name: 'Load Balancer', type: 'network'},
  {id: 'rl', name: 'Rate Limiter', type: 'network'},
  {id: 'auth', name: 'Auth Service', type: 'compute'}
];
```

### Step 2: Define Exposed Ports
```javascript
const exposedPorts = {
  input: [
    {name: 'request', innerComponentId: 'lb', innerPortName: 'input'}
  ],
  output: [
    {name: 'response', innerComponentId: 'auth', innerPortName: 'output'}
  ]
};
```

### Step 3: Create Composite
```javascript
const composite = new CompositeComponent({
  id: 'api-gateway',
  name: 'API Gateway',
  type: 'composite',
  innerComponents,
  exposedPorts
});
```

## Pre-built Composites

### API Gateway
- **Inner Components**: Load Balancer, Rate Limiter, Auth Service
- **Input Port**: request
- **Output Port**: response
- **Use Case**: API endpoint protection and routing

### Database Cluster
- **Inner Components**: Primary DB, Replica 1, Replica 2
- **Input Port**: write
- **Output Port**: read
- **Use Case**: High-availability database setup

### Microservice
- **Inner Components**: Service, Cache, Queue
- **Input Port**: request
- **Output Port**: response
- **Use Case**: Microservice with caching and async processing

## Navigation

### Drill Down
Click on composite component to view inner components.

### Drill Up
Click breadcrumb or back button to return to parent level.

### Breadcrumb Trail
Shows current navigation path:
```
Root > API Gateway > Load Balancer
```

## Events

- `ui:component-selected` - Composite selected
- `ui:component-deselected` - Composite deselected
- `system:drill-down` - Drilled into composite
- `system:drill-up` - Returned to parent level

## API

See `docs/UI_COMPONENTS_REFERENCE.md` for detailed API documentation.
