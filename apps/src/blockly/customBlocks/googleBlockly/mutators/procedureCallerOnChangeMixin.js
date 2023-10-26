const procedureCallerOnChangeMixin = {
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param event Change event.
   * @this {Blockly.Block}
   */
  onchange: function (event) {
    //console.log(event.type);
    if (event.type === Blockly.Events.BLOCK_CREATE) {
      console.log({event, block: this});
    }
    if (event.type === Blockly.Events.FINISHED_LOADING) {
      console.log({event});
    }
    if (this.disposed || this.workspace.isFlyout) return;
    if (event.type === Blockly.Events.BLOCK_MOVE) this.updateArgsMap_(true);
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
    if (event.type === Blockly.Events.FINISHED_LOADING) {
      console.log('looking for def in onchange');
    }
    const name = this.getFieldValue('NAME');
    let def = Blockly.Procedures.getDefinition(name, this.workspace);
    console.log({name, def, block: this});
    if (!this.defMatches_(def)) def = null;
    if (!def) {
      // We have no def nor procedure model.
      Blockly.Events.setGroup(event.group);
      this.model_ = this.createDef_(
        this.getFieldValue('NAME'),
        this.paramsFromSerializedState_
      );
      Blockly.Events.setGroup(false);
    }
    if (!this.getProcedureModel()) {
      // We have a def, but no reference to its model.
      this.model_ = this.findProcedureModel_(
        this.getFieldValue('NAME'),
        this.paramsFromSerializedState_
      );
    }
    this.initBlockWithProcedureModel_();
  },

  /**
   * @param event The event to check.
   * @returns True if the given event is a paste event for this block.
   */
  eventIsCreatingThisBlockDuringPaste_(event) {
    return (
      event.type === Blockly.Events.BLOCK_CREATE &&
      (event.blockId === this.id || event.ids.indexOf(this.id) !== -1) &&
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
  defMatches_(defBlock) {
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
  createDef_(name, params = []) {
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
    );
    return block.getProcedureModel();
  },
};

export default procedureCallerOnChangeMixin;
