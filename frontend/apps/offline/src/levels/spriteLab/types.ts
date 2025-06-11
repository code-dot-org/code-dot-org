import * as Blockly from 'blockly/core';

import type {LegacyProcedureBlock} from '@/blockly/types';

export type AugmentedProcedureBlock = LegacyProcedureBlock & {
  behaviorId: string;
  hasReturn_: boolean;
  defType_: string;
  model_: Blockly.procedures.IProcedureModel | null;
  findProcedureModel_: (
    name: string,
    params?: string[],
  ) => Blockly.procedures.IProcedureModel | null;
  initBlockWithProcedureModel_: () => void;
  createArgInputs_: (params: string[] | null) => void;
  setStatements_: (hasStatements: boolean) => void;
};
