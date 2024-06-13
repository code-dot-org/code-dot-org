import {ProcedureBlock} from '@cdo/apps/blockly/types';

export const commonFunctions = {
  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function (this: ProcedureBlock) {
    const state = Object.create(null);
    state['behaviorId'] = this.behaviorId;
    const model = this.getProcedureModel();
    if (!model) {
      // We reached here because we've deserialized a caller into a workspace
      // where its model did not already exist (no procedures array in the json,
      // and deserialized before any definition block), and are reserializing
      // it before the event delay has elapsed and change listeners have run.
      // (If they had run, we would have found or created a model).
      // Just reserialize any deserialized state. Nothing should have happened
      // in-between to change it.
      state['name'] = this.getFieldValue('NAME');
      state['params'] = this.paramsFromSerializedState_;
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
  // TODO: Define state more specifically.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadExtraState: function (this: ProcedureBlock, state: Record<string, any>) {
    this.behaviorId = state['behaviorId'];
    this.deserialize_(state['name'], state['params'] || []);
  },

  /**
   * Applies the given name and params from the serialized state to the block.
   * @param name The name to apply to the block.
   * @param params The parameters to apply to the block.
   */
  deserialize_: function (
    this: ProcedureBlock,
    name: string,
    params: string[]
  ) {
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
