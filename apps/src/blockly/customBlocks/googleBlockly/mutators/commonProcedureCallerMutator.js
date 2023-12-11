export const commonFunctions = {
  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function () {
    const state = Object.create(null);
    state['behaviorId'] = this.behaviorId;
    const model = this.getProcedureModel();
    if (!model) {
      state['name'] = this.getFieldValue('NAME');
      return state;
    }
    state['name'] = model.getName();
    if (model.getParameters().length) {
      state['params'] = model.getParameters().map(p => p.getName());
    }
    return state;
  },

  /**
   * Applies the given state to this block.
   * @param state The state to apply to this block, ie the params and
   *     procedure name.
   */
  loadExtraState: function (state) {
    this.behaviorId = state['behaviorId'];
    this.deserialize_(state['name'], state['params'] || []);
  },

  /**
   * Applies the given name and params from the serialized state to the block.
   * @param name The name to apply to the block.
   * @param params The parameters to apply to the block.
   */
  deserialize_: function (name, params) {
    this.setFieldValue(name, 'NAME');
    // Typically, the procedure will share its name with the caller block.
    if (!this.model_) this.model_ = this.findProcedureModel_(name, params);
    if (this.getProcedureModel()) {
      this.initBlockWithProcedureModel_();
    } else {
      // Create inputs based on the mutation so that children can be connected.
      this.createArgInputs_(params);
    }
    this.paramsFromSerializedState_ = params;
  },
};
