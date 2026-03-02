export const messagingDefinition = {
  name: 'Messaging',
  description: 'Messaging component',
  category: 'Messaging',
  type: 'messaging',
  ports: {
    input: [{ name: 'message', cardinality: 'single' }],
    output: [{ name: 'ack', cardinality: 'single' }]
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
