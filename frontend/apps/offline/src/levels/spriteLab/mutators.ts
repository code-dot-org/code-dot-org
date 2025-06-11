/**
 * These mutators add custom serialization for certain blocks. For SpriteLab
 * levels, this is generally to account for the behavior blocks as custom
 * procedures.
 *
 * The `gamelab_behavior_get` block and the `behavior_definition` block,
 * specifically.
 */

import {
  ObservableParameterModel,
  isProcedureBlock,
} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';

import type {SpriteLabLevelEnvironment} from './SpriteLabLevel';
import type {AugmentedProcedureBlock} from './types';

// Considers an attribute true only if it is explicitly set to 'true' (i.e. defaults to false if unset).
export const FALSEY_DEFAULT = (attributeValue?: string | null) =>
  attributeValue === 'true';

const useModalFunctionEditor: boolean = true;

/**
 * Reads a boolean attribute from an XML element and determines its value based on a callback function.
 * The callback function determines how we interpret the attribute value as a boolean.
 * @param {Element} xmlElement - The XML element from which to read the attribute.
 * @param {string} attribute - The name of the attribute to read from the XML element.
 * @param {function(string): boolean} [callback=FALSEY_DEFAULT] - A callback function that takes the attribute value as a string and returns a boolean.
 * @returns {boolean} The boolean value of the attribute as determined by the callback function.
 */
export function readBooleanAttribute(
  xmlElement: Element,
  attribute: string,
  callback: (attributeValue?: string | null) => boolean = FALSEY_DEFAULT,
) {
  const attributeValue = xmlElement.getAttribute(attribute);
  return callback(attributeValue);
}

interface BehaviorGetMutatorBlock extends AugmentedProcedureBlock {
  environment: SpriteLabLevelEnvironment;
  previousEnabledState_: boolean;
  paramsFromSerializedState_: string[];
  canSerializeNextConnection: boolean;
  deserialize_: (
    this: BehaviorGetMutatorBlock,
    name: string,
    params: string[],
  ) => void;
  description?: string;
}

interface BehaviorGetMutatorState {
  behaviorId: string;
  id?: string;
  name?: string;
  params?: string[];
  disableNextConnection?: boolean;
}

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

  /** Captures the workspace Environment */
  environment: null,

  canSerializeNextConnection: true,

  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function (this: BehaviorGetMutatorBlock) {
    const state: BehaviorGetMutatorState = {
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
    this: BehaviorGetMutatorBlock,
    state: BehaviorGetMutatorState,
  ) {
    console.log('LOADING EXTRA STATE', state);
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
    this: BehaviorGetMutatorBlock,
    name: string,
    params: string[],
  ) {
    this.setFieldValue(name, 'NAME');
    if (!this.model_) this.model_ = this.findProcedureModel_(name, params);
    console.log('deserialize it', this, this.model_, this.environment);

    const model = this.getProcedureModel();
    if (model) {
      // If this calls a function that's in the hidden workspace, map that function
      // to the target workspace.
      if (!this.workspace.getProcedureMap().has(model.getId())) {
        if (
          this.environment.hiddenWorkspace
            ?.getProcedureMap?.()
            ?.has(model.getId())
        ) {
          this.workspace.getProcedureMap().add(model);
        }
      }
      this.initBlockWithProcedureModel_();
    } else {
      // Create inputs based on the mutation so that children can be connected.
      this.createArgInputs_(params);
    }
    this.paramsFromSerializedState_ = params;
  },
};

/**
 * Most of this logic is copied from `procedureDefMutator` from @blockly/block-shareable-procedures.
 * As in our local copy of `procedureDefMutator`, the compose() and decompose() methods
 * have been removed to avoid rendering a gear icon that we do not want. In addition,
 * the domToMutation(), saveExtraState(), and loadExtraState() methods have been customized
 * to handle the behaviorId attribute. A future version of the shareable-procedures plugin will
 * export the `procedureDefMutator` (and other extensions), but using it will require bumping to Blockly v10.
 * TODO: Once we are on Blockly v10, we can remove our local `procedureDefMutator`, but our
 * `behaviorDefMutator` file might need to stick around.
 */

interface BehaviorDefMutatorBlock extends AugmentedProcedureBlock {
  environment: SpriteLabLevelEnvironment;
  hasStatements_: boolean;
  description?: string;
  userCreated?: boolean;
  noBlockHasClaimedModel_: (
    this: BehaviorDefMutatorBlock,
    procedureId: string,
  ) => void;
  deleteParamsFromModel_: (
    this: BehaviorDefMutatorBlock,
    containerBlock: Blockly.Block,
  ) => void;
  renameParamsInModel_: (
    this: BehaviorDefMutatorBlock,
    containerBlock: Blockly.Block,
  ) => void;
  addParamsToModel_: (
    this: BehaviorDefMutatorBlock,
    containerBlock: Blockly.Block,
  ) => void;
}

interface BehaviorDefMutatorState {
  behaviorId: string;
  description: string;
  procedureId: string;
  userCreated?: boolean;
  hasStatements?: boolean;
  params?: Blockly.serialization.procedures.ParameterState[];
}

// Add a new editable input field to the block for the description
// (if the modal function editor is enabled), or set the description
// property on the block (if the modal function editor is disabled).
export function setBlockDescription(
  block: BehaviorDefMutatorBlock,
  description: string,
) {
  if (useModalFunctionEditor) {
    block
      .appendEndRowInput('DESCRIPTION_ROW')
      .appendField('Description ', 'DESCRIPTION_LABEL')
      .appendField(new Blockly.FieldTextInput(description), 'DESCRIPTION');
    const inputToPrecede = block.getInput('flyout_input')
      ? 'flyout_input'
      : 'STACK';
    block.moveInputBefore('DESCRIPTION_ROW', inputToPrecede);
  } else {
    block.description = description;
  }
}

// Get the description from the block.
// If the modal function editor is enabled, we get the description
// from the description field on the block. Otherwise we get it from
// the description property on the block.
export function getBlockDescription(block: BehaviorDefMutatorBlock) {
  let fieldDescription;
  if (useModalFunctionEditor) {
    fieldDescription = block.getFieldValue('DESCRIPTION');
  }
  return fieldDescription || block.description;
}

export const behaviorDefMutator = {
  name: 'behavior_def_mutator',

  hasStatements_: true,

  /**
   * Create XML to represent the argument inputs.
   * Backwards compatible serialization implementation.
   * @returns XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function (this: BehaviorDefMutatorBlock) {
    const container = Blockly.utils.xml.createElement('mutation');
    const params =
      this.getProcedureModel().getParameters() as ObservableParameterModel[];
    for (let i = 0; i < params.length; i++) {
      const parameter = Blockly.utils.xml.createElement('arg');
      const varModel = params[i].getVariableModel();
      parameter.setAttribute('name', varModel.name);
      parameter.setAttribute('varid', varModel.getId());
      container.appendChild(parameter);
    }

    if (this.behaviorId) {
      container.setAttribute('behaviorId', this.behaviorId);
    }
    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },

  /**
   * Parse XML to set static behavior id, used for shared behaviors.
   * @param xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (this: BehaviorDefMutatorBlock, xmlElement: Element) {
    // We do not copy parameters because behavior parameters are a special case.
    // We manually create the "this sprite" parameter for each behavior,
    // (and don't want to treat it as a Blockly parameter).
    // We also know all behaviors have the same single parameter,
    // so we don't need to copy the parameter over.
    for (let i = 0; i < xmlElement.childNodes.length; i++) {
      const node = xmlElement.childNodes[i];
      const nodeName = node.nodeName.toLowerCase();
      if (nodeName === 'description') {
        // CDO Blockly projects stored descriptions in a separate tag within the mutation.
        this.description = node.textContent || '';
      }
    }
    this.behaviorId =
      xmlElement.getAttribute('behaviorId') ||
      xmlElement.nextElementSibling?.getAttribute('id') ||
      'unnamed';
    this.userCreated = readBooleanAttribute(
      xmlElement,
      'userCreated',
      FALSEY_DEFAULT,
    );
    if (!this.description) {
      // Google Blockly projects store descriptions in a separate field.
      setBlockDescription(this, this.getFieldValue('DESCRIPTION'));
    }
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of this block, eg the parameters and statements.
   */
  saveExtraState: function (this: BehaviorDefMutatorBlock) {
    const state: BehaviorDefMutatorState = {
      procedureId: this.getProcedureModel().getId(),
      behaviorId: this.behaviorId,
      userCreated: this.userCreated,
      description: getBlockDescription(this),
    };

    const params =
      this.getProcedureModel().getParameters() as ObservableParameterModel[];
    if (!params.length && this.hasStatements_) return state;

    if (params.length) {
      state.params = params.map(p => {
        return {
          name: p.getName(),
          id: p.getVariableModel().getId(),
          // Ideally this would be id, and the other would be varId,
          // but backwards compatibility :/
          paramId: p.getId(),
        };
      });
    }
    if (!this.hasStatements_) {
      state.hasStatements = false;
    }
    return state;
  },

  /**
   * Applies the given state to this block.
   * @param state The state to apply to this block, eg the parameters and
   *     statements.
   */
  loadExtraState: function (
    this: BehaviorDefMutatorBlock,
    state: BehaviorDefMutatorState,
  ) {
    this.behaviorId = state.behaviorId || 'unnamed';
    this.userCreated = state.userCreated;
    const map = this.workspace.getProcedureMap();
    const procedureId = state.procedureId;
    const procedureFromMap = map.get(procedureId);
    if (
      procedureId &&
      procedureId !== this.model_?.getId() &&
      procedureFromMap &&
      (this.isInsertionMarker() || this.noBlockHasClaimedModel_(procedureId))
    ) {
      if (this.model_ && map.has(this.model_.getId())) {
        map.delete(this.model_.getId());
      }
      this.model_ = procedureFromMap;
    }

    if (state.params && !this.getProcedureModel().getParameters().length) {
      for (let i = 0; i < state.params.length; i++) {
        const {name, id, paramId} = state.params[i];
        this.getProcedureModel().insertParameter(
          new ObservableParameterModel(
            this.workspace,
            name,
            paramId as string,
            id,
          ),
          i,
        );
      }
    }

    setBlockDescription(this, state.description || '');
    this.doProcedureUpdate();
    this.setStatements_(!!state.hasStatements);
  },

  /**
   * Returns true if there is no definition block currently associated with the
   * given procedure ID. False otherwise.
   * @param procedureId The ID of the procedure to check for a claiming
   *     block.
   * @returns True if there is no definition block currently associated
   *     with the given procedure ID. False otherwise.
   */
  noBlockHasClaimedModel_(this: BehaviorDefMutatorBlock, procedureId: string) {
    const model = this.workspace.getProcedureMap().get(procedureId);
    return this.workspace
      .getAllBlocks(false)
      .every(
        b =>
          !isProcedureBlock(b) ||
          !b.isProcedureDef() ||
          b.getProcedureModel() !== model,
      );
  },

  /**
   * Deletes any parameters from the procedure model that do not have associated
   * parameter blocks in the mutator.
   * @param containerBlock Root block in the mutator.
   */
  deleteParamsFromModel_: function (
    this: BehaviorDefMutatorBlock,
    containerBlock: Blockly.Block,
  ) {
    const ids = new Set(
      containerBlock.getDescendants(/*ordered*/ false).map(b => b.id),
    );
    const model = this.getProcedureModel();
    const count = model.getParameters().length;
    for (let i = count - 1; i >= 0; i--) {
      if (!ids.has(model.getParameter(i).getId())) {
        model.deleteParameter(i);
      }
    }
  },

  /**
   * Renames any parameters in the procedure model whose associated parameter
   * blocks have been renamed.
   * @param containerBlock Root block in the mutator.
   */
  renameParamsInModel_: function (
    this: BehaviorDefMutatorBlock,
    containerBlock: Blockly.Block,
  ) {
    const model = this.getProcedureModel();

    let i = 0;
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      const param = model.getParameter(i);
      if (
        param &&
        param.getId() === paramBlock.id &&
        param.getName() !== paramBlock.getFieldValue('NAME')
      ) {
        param.setName(paramBlock.getFieldValue('NAME'));
      }
      paramBlock =
        paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
      i++;
    }
  },

  /**
   * Adds new parameters to the procedure model for any new procedure parameter
   * blocks.
   * @param containerBlock Root block in the mutator.
   */
  addParamsToModel_: function (
    this: BehaviorDefMutatorBlock,
    containerBlock: Blockly.Block,
  ) {
    const model = this.getProcedureModel();

    let i = 0;
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      if (
        !model.getParameter(i) ||
        model.getParameter(i).getId() !== paramBlock.id
      ) {
        model.insertParameter(
          new ObservableParameterModel(
            this.workspace,
            paramBlock.getFieldValue('NAME'),
            paramBlock.id,
          ),
          i,
        );
      }
      paramBlock =
        paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
      i++;
    }
  },
};
