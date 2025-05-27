import {IProcedureBlock} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';

type ProcedureBlock = Blockly.Block | IProcedureBlock;

/**
 * The mutator that serializes behavior getters.
 *
 * A gamelab_behavior_get block represents a known behavior. This could be
 * a provided behavior or a user-generated one.
 *
 * This serializer expects that there is an 'id' in the extraState and uses
 * that to fuel the 'behaviorId' parameter.
 */
export const behaviorGetMutator = {
  name: 'behavior_get_mutator',

  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function (this: ProcedureBlock) {
    const state = {
      behaviorId:
        this.behaviorId ||
        this.getFieldValue('NAME') ||
        this.getFieldValue('VAR'),
    };
    const model = this.getProcedureModel();
    console.log('hello wat', this, state, model);
    if (!model) {
      // We reached here because we've deserialized a caller into a workspace
      // where its model did not already exist (no procedures array in the json,
      // and deserialized before any definition block), and are reserializing
      // it before the event delay has elapsed and change listeners have run.
      // (If they had run, we would have found or created a model).
      // Just reserialize any deserialized state. Nothing should have happened
      // in-between to change it.
      state.name = this.getFieldValue('NAME');
      state.params = this.paramsFromSerializedState_;
      return state;
    }
    state.name = model.getName();
    if (model.getParameters().length) {
      state.params = model.getParameters().map(p => p.getName());
    }
    if (!this.nextConnection) {
      state.disableNextConnection = true;
    }
    return state;
  },

  /**
   * Applies the given state to this block.
   * @param state The state to apply to this block, ie the params and
   *     procedure name.
   */
  loadExtraState: function (
    this: ProcedureBlock,
    state: {
      id?: string;
      behaviorId?: string;
      params?: string[];
    },
  ) {
    this.behaviorId = state.behaviorId || state.id || 'unnamed';
    this.deserialize_(this.behaviorId, state.params || []);
    if (state.disableNextConnection) {
      this.setNextStatement(false);
    }
  },

  /**
   * Applies the given name and params from the serialized state to the block.
   * @param name The name to apply to the block.
   * @param params The parameters to apply to the block.
   */
  deserialize_: function (
    this: ProcedureBlock,
    name: string,
    params: string[],
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

  canSerializeNextConnection: true,
};
