export const computeDefinition = {
  name: 'Compute',
  description: 'Compute component',
  capabilities: ['processData', 'transformPayload', 'runBusinessLogic'],
  usage: 'Use for stateless compute steps that transform input data into output results.',
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
