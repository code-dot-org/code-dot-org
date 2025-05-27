import {IProcedureBlock} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';

// This mixin's function is copied and modified from
// https://github.com/google/blockly-samples/blob/9a83a2c78a3e2a993942e96c4933dcbb3b2c79d7/plugins/block-shareable-procedures/src/blocks.ts#L832-L858
// We need to override findProcedureModel_ so that it can find a match based
// on behaviorId if there is no match by name. This is because a user might rename
// a behavior for which there is a static behavior getter in the toolbox.

type ProcedureBlock = Blockly.Block | IProcedureBlock;

export const behaviorCallerGetDefMixin = {
  name: 'behavior_caller_get_def_mixin',
  extension: function (this: ProcedureBlock) {
    const mixin = {
      /**
       * Returns the procedure model that was found.
       *
       * @param name The name of the procedure model to find.
       * @param params The param names of the procedure model
       *     to find.
       * @returns The procedure model that was found.
       * @override
       */
      findProcedureModel_(
        this: ProcedureBlock,
        name: string,
        params: string[] = [],
      ) {
        //if (Blockly.isEmbeddedWorkspace(this.workspace)) {
        //  return null;
        //}
        const workspace = this.getTargetWorkspace_();
        let model = workspace
          .getProcedureMap()
          .getProcedures()
          .find(proc => proc.getName() === name);

        /* Begin CDO Customization */
        // If we can't find a model normally, find one based on the behavior id.
        if (!model && this.behaviorId) {
          // All behavior definition blocks are on the hidden workspace.
          const hiddenWorkspace = null; //Blockly.getHiddenDefinitionWorkspace();
          if (hiddenWorkspace) {
            const definitionBlock = hiddenWorkspace
              .getTopBlocks()
              .filter(block => block.type === 'behavior_definition')
              .find(
                block =>
                  (block as ProcedureBlock).behaviorId === this.behaviorId,
              ) as ProcedureBlock;
            if (definitionBlock) {
              model = definitionBlock.getProcedureModel();
            }
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
  },
};

export const behaviorCallerGetDefBlockMixin = {
  name: 'behavior_caller_get_def_block_mixin',
  mixin: {
    hasReturn_: false,
    defType_: 'behavior_definition',
  },
};

// This mixin's function is copied and modified from
// https://github.com/google/blockly-samples/blob/7954a8fff50e41fa7c0f891e957bf9ed616361d6/plugins/block-shareable-procedures/src/blocks.ts#L1312
// We need to override createDef_ so that it correctly assigns a behavior id matching
// the orphaned call block that triggered its creation.
// This should only be needed if a user had previously deleted a definition
// block but not its call blocks, which was possible with CDO Blockly.
// References to behaviorId properties are customizations.
function getAlphanumericId() {
  const validCharacters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const idLength = 16;
  const id = [];
  for (let i = 0; i < idLength; i++) {
    id.push(
      validCharacters.charAt(
        Math.floor(Math.random() * validCharacters.length),
      ),
    );
  }
  return id.join('');
}

export const behaviorCreateDefMixin = {
  name: 'behavior_create_def_mixin',
  extension: function (this: ProcedureBlock) {
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
          {recordUndo: true},
        ) as ProcedureBlock;
        return block.getProcedureModel();
      },
    };

    this.mixin(mixin, true);
  },
};
