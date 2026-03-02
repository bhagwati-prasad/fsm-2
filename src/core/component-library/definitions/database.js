export const databaseDefinition = {
  name: 'Database',
  description: 'Database component',
  capabilities: ['read', 'write', 'query', 'indexLookup'],
  usage: 'Use for persistence and query operations where stateful storage is required.',
  category: 'Storage',
  type: 'database',
  ports: {
    input: [{ name: 'query', cardinality: 'single' }],
    output: [{ name: 'result', cardinality: 'single' }]
  },
  stateMachine: {
    initialState: 'idle',
    states: ['idle', 'processing', 'complete', 'error'],
    transitions: {
      idle: ['processing'],
      processing: ['complete', 'error'],
      complete: ['idle'],
      error: ['idle']
    }
  }
};
