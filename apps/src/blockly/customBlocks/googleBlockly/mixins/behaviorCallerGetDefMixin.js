// This mixin's function is copied and modified from
// https://github.com/google/blockly-samples/blob/9a83a2c78a3e2a993942e96c4933dcbb3b2c79d7/plugins/block-shareable-procedures/src/blocks.ts#L832-L858
// We need to override findProcedureModel_ so that it can find a match based
// on behaviorId if there is no match by name. This is because a user might rename
// a behavior for which there is a static behavior getter in the toolbox.

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

export const behaviorCallerGetDefMixin = function () {
  const mixin = {
    /**
     * Returns the procedure model tha was found.
     *
     * @param name The name of the procedure model to find.
     * @param params The param names of the procedure model
     *     to find.
     * @returns The procedure model that was found.
     * @override
     */
    findProcedureModel_(name, params = []) {
      const workspace = this.getTargetWorkspace_();
      let model = workspace
        .getProcedureMap()
        .getProcedures()
        .find(proc => proc.getName() === name);

      /* Begin CDO Customization */
      // If we can't find a model normally, find one based on the behavior id.
      if (!model && this.behaviorId) {
        // All behavior definition blocks are on the hidden workspace.
        const hiddenWorkspace = Blockly.getHiddenDefinitionWorkspace();
        const definitionBlock = hiddenWorkspace
          .getTopBlocks()
          .filter(block => (block.type = BLOCK_TYPES.behaviorDefinition))
          .find(block => block.behaviorId === this.behaviorId);
        if (definitionBlock) {
          model = definitionBlock.getProcedureModel();
        }
      }
      /* End CDO Customization */
      if (!model) return null;

      const returnTypes = model.getReturnTypes();
      const hasMatchingReturn = this.hasReturn_ ? returnTypes : !returnTypes;
      if (!hasMatchingReturn) return null;

      const hasMatchingParams = model
        .getParameters()
        .every((p, i) => p.getName() === params[i]);
      if (!hasMatchingParams) return null;

      return model;
    },
  };

  this.mixin(mixin, true);
};
