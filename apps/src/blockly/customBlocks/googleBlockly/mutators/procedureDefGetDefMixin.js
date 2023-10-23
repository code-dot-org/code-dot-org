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
      const procedureName = this.getFieldValue('NAME') || this.procedureName;
      const model = this.workspace
        .getProcedureMap()
        .getProcedures()
        .find(proc => proc.getName() === procedureName);
      if (model) {
        console.log(`found existing model for ${procedureName}`);
        console.log({model});
        this.model_ = model;
      } else {
        console.log(`creating new model for ${procedureName}`);
        console.log({
          legalName: Blockly.Procedures.findLegalName(procedureName, this),
        });
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
