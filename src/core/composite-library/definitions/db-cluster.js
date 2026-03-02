export const dbClusterCompositeDefinition = {
  name: 'Database Cluster',
  description: 'Primary-replica database cluster',
  category: 'Storage',
  type: 'db-cluster',
  innerComponents: [
    { id: 'primary', name: 'Primary DB', type: 'database' },
    { id: 'replica1', name: 'Replica 1', type: 'database' },
    { id: 'replica2', name: 'Replica 2', type: 'database' }
  ],
  exposedPorts: {
    input: [{ name: 'write', innerComponentId: 'primary', innerPortName: 'input' }],
    output: [{ name: 'read', innerComponentId: 'replica1', innerPortName: 'output' }]
  }
};
