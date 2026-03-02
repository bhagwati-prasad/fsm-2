export const databaseDefinition = {
  name: 'Database',
  description: 'Database component',
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
