export const apiGatewayCompositeDefinition = {
  name: 'API Gateway',
  description: 'API Gateway with load balancer and rate limiter',
  category: 'Network',
  type: 'api-gateway',
  innerComponents: [
    { id: 'lb', name: 'Load Balancer', type: 'network' },
    { id: 'rl', name: 'Rate Limiter', type: 'network' },
    { id: 'auth', name: 'Auth Service', type: 'compute' }
  ],
  exposedPorts: {
    input: [{ name: 'request', innerComponentId: 'lb', innerPortName: 'input' }],
    output: [{ name: 'response', innerComponentId: 'auth', innerPortName: 'output' }]
  }
};
