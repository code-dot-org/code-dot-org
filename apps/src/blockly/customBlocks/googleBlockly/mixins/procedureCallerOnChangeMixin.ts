import {Abstract} from 'blockly/core/events/events_abstract';
import {BlockCreate} from 'blockly/core/events/events_block_create';

import {ProcedureBlock} from '@cdo/apps/blockly/types';

// This is copied and modified from
// https://github.com/google/blockly-samples/blob/82f1c35be007a99b7446e199448d083ac68a9f84/plugins/block-shareable-procedures/src/blocks.ts#L1184-L1285
// We need a bug fix not present in our current (v9) version of the mixin, and
// we need to not run the on change handler if the block is an embedded workspace.
// We may be able to extend the mixin once we upgrade to v10.
const procedureCallerOnChangeMixin = {
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param event Change event.
   * @this {Blockly.Block}
   */
  onchange: function (this: ProcedureBlock, event: Abstract) {
    // If the block is in an embedded workspace, we don't create a procedure definition.
    // An embedded workspace does not need any procedure definitions, and trying to add them
    // will cause confusing UI (for example, an empty procedure definition in a hint).
    if (
      this.disposed ||
      this.workspace.isFlyout ||
      Blockly.isEmbeddedWorkspace(this.workspace)
    )
      return;
    if (event.type === Blockly.Events.BLOCK_MOVE) this.updateArgsMap_();
    if (
      event.type !== Blockly.Events.FINISHED_LOADING &&
      !this.eventIsCreatingThisBlockDuringPaste_(event)
    )
      return;

    // We already found our model, which means we don't need to create a block.
    if (this.getProcedureModel()) return;

    // Look for the case where a procedure call was created (usually through
    // paste) and there is no matching definition.  In this case, create
    // an empty definition block with the correct signature.
    const name = this.getFieldValue('NAME');
    let def: ProcedureBlock | null = Blockly.Procedures.getDefinition(
      name,
      this.workspace
    ) as ProcedureBlock;
    if (!this.defMatches_(def)) def = null;
    if (!def) {
      // We have no def nor procedure model.
      Blockly.Events.setGroup(event.group);
      this.model_ = this.createDef_(name, this.paramsFromSerializedState_);
      Blockly.Events.setGroup(false);
    }
    if (!this.getProcedureModel()) {
      // We have a def, but no reference to its model.
      this.model_ = this.findProcedureModel_(
        name,
        this.paramsFromSerializedState_
      );
    }
    this.initBlockWithProcedureModel_();
  },

  /**
   * @param event The event to check.
   * @returns True if the given event is a paste event for this block.
   */
  eventIsCreatingThisBlockDuringPaste_(
    this: ProcedureBlock,
    event: Abstract
  ): boolean {
    return (
      event.type === Blockly.Events.BLOCK_CREATE &&
      ((event as BlockCreate).blockId === this.id ||
        (event as BlockCreate).ids?.indexOf(this.id) !== -1) &&
      // Record undo makes sure this is during paste.
      event.recordUndo
    );
  },

  /**
   * Returns true if the given def block matches the definition of this caller
   * block.
   * @param defBlock The definition block to check against.
   * @returns Whether the def block matches or not.
   */
  defMatches_(this: ProcedureBlock, defBlock: ProcedureBlock | null) {
    return (
      defBlock &&
      defBlock.type === this.defType_ &&
      JSON.stringify(defBlock.getVars()) ===
        JSON.stringify(this.paramsFromSerializedState_)
    );
  },

  /**
   * Creates a procedure definition block with the given name and params,
   * and returns the procedure model associated with it.
   * @param name The name of the procedure to create.
   * @param params The names of the parameters to create.
   * @returns The procedure model associated with the new
   *     procedure definition block.
   */
  createDef_(this: ProcedureBlock, name: string, params: string[] = []) {
    const xy = this.getRelativeToSurfaceXY();
    const newName = Blockly.Procedures.findLegalName(name, this);
    this.renameProcedure(name, newName);

    const blockDef = {
      type: this.defType_,
      x: xy.x + Blockly.config.snapRadius * (this.RTL ? -1 : 1),
      y: xy.y + Blockly.config.snapRadius * 2,
      extraState: {
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

export default procedureCallerOnChangeMixin;
