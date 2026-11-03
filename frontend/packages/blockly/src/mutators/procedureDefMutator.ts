import type {
  IProcedureBlock,
  ProcedureBaseJson,
} from '@blockly/block-shareable-procedures';

import type {Mutator} from './types';

/**
 * Wraps the 'procedure_caller_mutator' such that it types the Block correctly.
 */
export const procedureDefMutator = {
  name: 'procedure_def_mutator',
  // We don't need to actually supply the mutator implementation
  // It is deeply inaccessible within the @blockly/block-shareable-procedures
  // codebase.
  mutator: {},
  noRegister: true,
} as unknown as Mutator<ProcedureBaseJson, IProcedureBlock>;
