export const microserviceCompositeDefinition = {
  name: 'Microservice',
  description: 'Microservice with cache and queue',
  category: 'Compute',
  type: 'microservice',
  innerComponents: [
    { id: 'service', name: 'Service', type: 'compute' },
    { id: 'cache', name: 'Cache', type: 'storage' },
    { id: 'queue', name: 'Queue', type: 'messaging' }
  ],
  exposedPorts: {
    input: [{ name: 'request', innerComponentId: 'service', innerPortName: 'input' }],
    output: [{ name: 'response', innerComponentId: 'service', innerPortName: 'output' }]
  }
};
