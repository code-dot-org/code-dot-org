import {commonFunctions} from './commonProcedureCallerMutator';

export const procedureCallerMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  /**
   * Create XML to represent the (non-editable) name and arguments.
   * Backwards compatible serialization implementation.
   * @returns XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement('mutation');
    const model = this.getProcedureModel();
    if (!model) return container;

    container.setAttribute('name', model.getName());
    for (const param of model.getParameters()) {
      const arg = Blockly.utils.xml.createElement('arg');
      arg.setAttribute('name', param.getName());
      container.appendChild(arg);
    }
    return container;
  },

  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * Backwards compatible serialization implementation.
   * @param xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    const name = xmlElement.getAttribute('name');
    const params = [];
    for (const n of xmlElement.childNodes) {
      if (n.nodeName.toLowerCase() === 'arg') {
        params.push(n.getAttribute('name'));
      }
    }
    this.deserialize_(name, params);
  },

  ...commonFunctions,

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  // saveExtraState: function () {
  //   const state = Object.create(null);
  //   const model = this.getProcedureModel();
  //   if (!model) {
  //     state['name'] = this.getFieldValue('NAME');
  //     return state;
  //   }
  //   state['name'] = model.getName();
  //   if (model.getParameters().length) {
  //     state['params'] = model.getParameters().map(p => p.getName());
  //   }
  //   return state;
  // },

  // /**
  //  * Applies the given state to this block.
  //  * @param state The state to apply to this block, ie the params and
  //  *     procedure name.
  //  */
  // loadExtraState: function (state) {
  //   this.deserialize_(state['name'], state['params'] || []);
  // },

  // /**
  //  * Applies the given name and params from the serialized state to the block.
  //  * @param name The name to apply to the block.
  //  * @param params The parameters to apply to the block.
  //  */
  // deserialize_: function (name, params) {
  //   this.setFieldValue(name, 'NAME');
  //   if (!this.model_) this.model_ = this.findProcedureModel_(name, params);
  //   if (this.getProcedureModel()) {
  //     this.initBlockWithProcedureModel_();
  //   } else {
  //     // Create inputs based on the mutation so that children can be connected.
  //     this.createArgInputs_(params);
  //   }
  //   this.paramsFromSerializedState_ = params;
  // },
};
