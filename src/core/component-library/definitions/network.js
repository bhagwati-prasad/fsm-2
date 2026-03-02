export const networkDefinition = {
  name: 'Network',
  description: 'Network component',
  category: 'Network',
  type: 'network',
  ports: {
    input: [{ name: 'request', cardinality: 'single' }],
    output: [{ name: 'response', cardinality: 'single' }]
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
