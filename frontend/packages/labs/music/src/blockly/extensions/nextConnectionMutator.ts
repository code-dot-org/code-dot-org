import {defineMutator} from '@code-dot-org/blockly-workspace';

export interface NextConnectionMutatorState {
  disableNextConnection: boolean;
}

/*
 * Mutator for blocks that support disabling the next connection.
 */
export const nextConnectionMutator = defineMutator('next_connection_mutator', {
  saveExtraState: function () {
    return {
      disableNextConnection: !this.nextConnection,
    };
  },
  loadExtraState: function (state: NextConnectionMutatorState) {
    if (state.disableNextConnection) {
      this.setNextStatement(false);
    }
  },
  canSerializeNextConnection: true,
});
