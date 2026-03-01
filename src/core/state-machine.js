/**
 * State Machine implementation
 * Manages component state transitions
 */

export class StateMachine {
  /**
   * Create a new state machine
   * @param {Object} definition - State machine definition
   * @param {string} definition.initialState - Initial state
   * @param {Object} definition.states - State definitions
   * @param {Object} definition.transitions - Valid transitions
   */
  constructor(definition) {
    this.initialState = definition.initialState || 'idle';
    this.states = definition.states || {};
    this.transitions = definition.transitions || {};
  }

  /**
   * Check if transition is valid
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean} - True if transition is valid
   */
  canTransition(fromState, toState) {
    if (!this.transitions[fromState]) {
      return false;
    }

    return this.transitions[fromState].includes(toState);
  }

  /**
   * Get valid next states
   * @param {string} currentState - Current state
   * @returns {Array<string>} - Valid next states
   */
  getValidNextStates(currentState) {
    return this.transitions[currentState] || [];
  }

  /**
   * Validate state machine definition
   * @returns {Object} - Validation result {valid: boolean, errors: []}
   */
  validate() {
    const errors = [];

    // Check initial state exists
    if (!this.states[this.initialState]) {
      errors.push(`Initial state '${this.initialState}' not defined`);
    }

    // Check all transitions reference valid states
    Object.entries(this.transitions).forEach(([fromState, toStates]) => {
      if (!this.states[fromState]) {
        errors.push(`Transition from undefined state '${fromState}'`);
      }

      toStates.forEach((toState) => {
        if (!this.states[toState]) {
          errors.push(`Transition to undefined state '${toState}'`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
