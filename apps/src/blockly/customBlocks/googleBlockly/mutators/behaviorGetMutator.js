export const behaviorGetMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  domToMutation: function (element) {
    const name = element.nextElementSibling.textContent;
    this.behaviorId = element.nextElementSibling.getAttribute('id');
    const model = this.findProcedureModel_(name);
    if (model) {
      this.model_ = model;
      if (this.getProcedureModel()) {
        this.initBlockWithProcedureModel_();
      }
    } else {
      throw new Error(`Procedure model not found for behavior: ${name}`);
    }
  },

  // Only used to save in XML, but still required to exist by Blockly.
  mutationToDom: function () {},
  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function () {
    const state = Object.create(null);
    const model = this.getProcedureModel();
    if (!model) return state;
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
    this.deserialize_(state['name'], state['params'] || []);
  },
  /**
   * Applies the given name and params from the serialized state to the block.
   * @param name The name to apply to the block.
   * @param params The parameters to apply to the block.
   */
  deserialize_: function (name, params) {
    this.setFieldValue(name, 'NAME');
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
