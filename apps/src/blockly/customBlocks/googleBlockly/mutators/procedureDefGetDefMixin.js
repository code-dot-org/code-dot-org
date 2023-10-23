// This is a modified version of @blockly/block-shareable-procedures procedureDefGetDefMixin.
// It sets up some helper methods for procedures (get model, is procedure def, etc.)
// This version only changes how we create the model. In the original version we always created
// a new model. In this verison, we search for an existing model first, using our custom this.procedureName
// field on the definition block (set in domToMutation), and only create a new model if we don't find one.
// This is needed because when converting from xml to json, we create all the models first, then create the
// definition blocks. This is so any call blocks used inside definition blocks will be guaranteed to find
// their model in the procedure map.

// For blocks that are loaded from json, we will always create a new procedure model, then find the
// actual procedure model in loadExtraState. This is because we use the procedureId from extra state
// to find the correct model, and we don't have that information here.

// Original version:
// https://github.com/google/blockly-samples/blob/d0191984399b784e2928b8fb4c58257bfa857655/plugins/block-shareable-procedures/src/blocks.ts#L165

import {ObservableProcedureModel} from '@blockly/block-shareable-procedures';

export default function () {
  const mixin = {
    model_: null,
    creatingModel_: false,

    /**
     * Returns the data model for this procedure block.
     * @returns The data model for this procedure
     *     block.
     */
    getProcedureModel() {
      if (!this.model_ && !this.creatingModel_) {
        this.findOrCreateProcedureModel();
      }
      return this.model_;
    },

    findOrCreateProcedureModel() {
      this.creatingModel_ = true;
      const procedureName = this.procedureName || this.getFieldValue('NAME');
      const model = this.workspace
        .getProcedureMap()
        .getProcedures()
        .find(proc => proc.getName() === procedureName);
      if (model) {
        this.model_ = model;
      } else {
        this.model_ = new ObservableProcedureModel(
          this.workspace,
          Blockly.Procedures.findLegalName(procedureName, this)
        );
        // Events cannot be fired from instantiation when deserializing or dragging
        // from the flyout. So make this consistent and never fire from instantiation.
        Blockly.Events.disable();
        this.workspace.getProcedureMap().add(this.model_);
        Blockly.Events.enable();
        this.creatingModel_ = false;
      }
    },

    /**
     * True if this is a procedure definition block, false otherwise (i.e.
     * it is a caller).
     * @returns True because this is a procedure definition block.
     */
    isProcedureDef() {
      return true;
    },

    /**
     * Return all variables referenced by this block.
     * @returns List of variable names.
     * @this {Blockly.Block}
     */
    getVars: function () {
      return this.getProcedureModel()
        .getParameters()
        .map(p => p.getVariableModel().name);
    },

    /**
     * Return all variables referenced by this block.
     * @returns List of variable models.
     * @this {Blockly.Block}
     */
    getVarModels: function () {
      return this.getProcedureModel()
        .getParameters()
        .map(p => p.getVariableModel());
    },

    /**
     * Disposes of the data model for this procedure block when the block is
     * disposed.
     */
    destroy: function () {
      this.workspace.getProcedureMap().delete(this.getProcedureModel().getId());
    },
  };

  this.mixin(mixin, true);
}
