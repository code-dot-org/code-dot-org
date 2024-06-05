// This mixin's function is copied and modified from
// https://github.com/google/blockly-samples/blob/7954a8fff50e41fa7c0f891e957bf9ed616361d6/plugins/block-shareable-procedures/src/blocks.ts#L1312
// We need to override createDef_ so that it correctly assigns a behavior id matching
// the orphaned call block that triggered its creation.
// This should only be needed if a user had previously deleted a definition
// block but not its call blocks, which was possible with CDO Blockly.
// References to behaviorId properties are customizations.
import {ProcedureBlock} from '@cdo/apps/blockly/types';
import {getAlphanumericId} from '@cdo/apps/utils';

export const behaviorCreateDefMixin = function (this: ProcedureBlock) {
  const mixin = {
    /**
     * Creates a procedure definition block with the given name and params,
     * and returns the procedure model associated with it.
     *
     * @param name The name of the procedure to create.
     * @param params The names of the parameters to create.
     * @returns The procedure model associated with the new
     *     procedure definition block.
     */
    createDef_(this: ProcedureBlock, name: string, params: string[] = []) {
      const xy = this.getRelativeToSurfaceXY();
      const newName = Blockly.Procedures.findLegalName(name, this);
      this.renameProcedure(name, newName);
      this.behaviorId = getAlphanumericId();

      const blockDef = {
        type: this.defType_,
        x: xy.x + Blockly.config.snapRadius * (this.RTL ? -1 : 1),
        y: xy.y + Blockly.config.snapRadius * 2,
        extraState: {
          behaviorId: this.behaviorId,
          params: params.map(p => ({name: p})),
        },
        fields: {NAME: newName},
      };
      const block = Blockly.serialization.blocks.append(
        blockDef,
        this.getTargetWorkspace_(),
        {recordUndo: true}
      ) as ProcedureBlock;
      return block.getProcedureModel();
    },
  };

  this.mixin(mixin, true);
};
