export const computeDefinition = {
  name: 'Compute',
  description: 'Compute component',
  category: 'Compute',
  type: 'compute',
  ports: {
    input: [{ name: 'data', cardinality: 'single' }],
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
