/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file was sourced from @blockly/block-plus-minus (procedures.js) and Blockly Core:
 * https://github.com/google/blockly/blob/73416d4db559302d2b090d112e1c74612910445a/blocks/procedures.ts#L1237-L1352
 */

/**
 * @fileoverview Changes the procedure blocks to use a +/- mutator UI.
 * The + button adds a new argument input which contains an argument reporter block.
 * The argument reporter works like a variable getter and can be used anywhere within
 * a procedure that includes that parameter name.
 * Argument inputs (and their associated reporter blocks) can be removed with the -
 * button.
 */

import * as GoogleBlockly from 'blockly/core';

import {BLOCK_TYPES} from '../../constants';

import {createMinusField} from './field_minus';
import {createPlusField} from './field_plus';

// Delete original blocks because there's no way to unregister them:
// https://github.com/google/blockly-samples/issues/768#issuecomment-885663394
delete GoogleBlockly.Blocks['procedures_defnoreturn'];
delete GoogleBlockly.Blocks['procedures_defreturn'];

export const advancedProceduresBlocks =
  GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
    {
      type: 'procedures_defnoreturn',
      message0: '%1 %2',
      message1: '%{BKY_PROCEDURES_DEFNORETURN_DO} %1',
      args0: [
        {
          type: 'field_input',
          name: 'NAME',
          text: '',
        },
        {
          type: 'input_dummy',
          name: 'TOP',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'STACK',
        },
      ],
      style: 'procedure_blocks',
      helpUrl: '%{BKY_PROCEDURES_DEFNORETURN_HELPURL}',
      tooltip: '%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}',
      extensions: [
        'get_procedure_def_no_return',
        'procedure_context_menu',
        'procedure_rename',
        'procedure_vars',
      ],
      mutator: 'advanced_procedure_def_mutator',
      inputsInline: true,
    },
    {
      type: 'procedures_defreturn',
      message0: '%1 %2',
      message1: '%{BKY_PROCEDURES_DEFRETURN_DO} %1',
      message2: '%{BKY_PROCEDURES_DEFRETURN_RETURN} %1',
      args0: [
        {
          type: 'field_input',
          name: 'NAME',
          text: '',
        },
        {
          type: 'input_dummy',
          name: 'TOP',
        },
      ],
      args1: [
        {
          type: 'input_statement',
          name: 'STACK',
        },
      ],
      args2: [
        {
          type: 'input_value',
          // We need to use left-alignment here until this issue is resolved:
          // https://github.com/google/blockly/issues/8595
          align: 'left',
          name: 'RETURN',
        },
      ],
      style: 'procedure_blocks',
      helpUrl: '%{BKY_PROCEDURES_DEFRETURN_HELPURL}',
      tooltip: '%{BKY_PROCEDURES_DEFRETURN_TOOLTIP}',
      extensions: [
        'get_procedure_def_return',
        'procedure_context_menu',
        'procedure_rename',
        'procedure_vars',
      ],
      mutator: 'advanced_procedure_def_mutator',
      inputsInline: true,
    },
    {
      type: BLOCK_TYPES.argumentReporter,
      message0: '%1',
      args0: [
        {
          type: 'field_input',
          name: 'VAR',
          variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
        },
      ],
      output: null,
      style: 'variable_blocks',
      extensions: [
        'argument_reporter_validator',
        'argument_reporter_finish_editing',
        'argument_report_get_var_models',
      ],
    },
  ]);

/**
 * Defines the what are essentially info-getters for the procedures_defnoreturn
 * block.
 * @type {{callType_: string, getProcedureDef: (function(): Array)}}
 */
const getDefNoReturn = {
  /**
   * Returns info about this block to be used by the Blockly.Procedures.
   * @returns {Array} An array of info.
   * @this {GoogleBlockly.Block}
   */
  getProcedureDef: function () {
    const argNames = this.argData_.map(elem => elem.model.name);
    return [this.getFieldValue('NAME'), argNames, false];
  },

  /**
   * Used by the context menu to create a caller block.
   * @type {string}
   */
  callType_: 'procedures_callnoreturn',
};

GoogleBlockly.Extensions.registerMixin(
  'get_procedure_def_no_return',
  getDefNoReturn
);

/**
 * Defines what are essentially info-getters for the procedures_def_return
 * block.
 * @type {{callType_: string, getProcedureDef: (function(): Array)}}
 */
const getDefReturn = {
  /**
   * Returns info about this block to be used by the Blockly.Procedures.
   * @returns {Array} An array of info.
   * @this {GoogleBlockly.Block}
   */
  getProcedureDef: function () {
    const argNames = this.argData_.map(elem => elem.model.name);
    return [this.getFieldValue('NAME'), argNames, true];
  },
  /**
   * Used by the context menu to create a caller block.
   * @type {string}
   */
  callType_: 'procedures_callreturn',
};

GoogleBlockly.Extensions.registerMixin(
  'get_procedure_def_return',
  getDefReturn
);

const procedureContextMenu = {
  /**
   * Adds an option to create a caller block.
   * @this {GoogleBlockly.Block}
   * @param {!Array} options The current options for the context menu.
   */
  customContextMenu: function (options) {
    if (this.isInFlyout) {
      return;
    }

    // Add option to create caller.
    const name = this.getFieldValue('NAME');
    const text = GoogleBlockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);

    const xml = GoogleBlockly.utils.xml.createElement('block');
    xml.setAttribute('type', this.callType_);
    xml.appendChild(this.mutationToDom(true));
    const callback = GoogleBlockly.ContextMenu.callbackFactory(this, xml);

    options.push({
      enabled: true,
      text: text,
      callback: callback,
    });

    if (this.isCollapsed()) {
      return;
    }
  },
};

GoogleBlockly.Extensions.registerMixin(
  'procedure_context_menu',
  procedureContextMenu
);

const procedureDefMutator = {
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} isForCaller If true include the procedure name and
   *     argument IDs. Used by Blockly.Procedures.mutateCallers for
   *     reconnection.
   * @returns {!Element} XML storage element.
   * @this {GoogleBlockly.Block}
   */
  mutationToDom: function (isForCaller = false) {
    const container = GoogleBlockly.utils.xml.createElement('mutation');
    if (isForCaller) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    this.argData_.forEach(element => {
      const argument = GoogleBlockly.utils.xml.createElement('arg');
      const argModel = element.model;
      argument.setAttribute('name', argModel.name);
      argument.setAttribute('varid', argModel.getId());
      argument.setAttribute('argid', element.argId);
      if (isForCaller) {
        argument.setAttribute('paramid', element.argId);
      }
      container.appendChild(argument);
    });

    // Not used by this block, but necessary if switching back and forth
    // between this mutator UI and the default UI.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }

    return container;
  },

  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this {GoogleBlockly.Block}
   */
  domToMutation: function (xmlElement) {
    // We have to handle this so that the user doesn't add blocks to the stack,
    // in which case it would be impossible to return to the old mutators.
    this.hasStatements_ = xmlElement.getAttribute('statements') !== 'false';
    if (!this.hasStatements_) {
      this.removeInput('STACK');
    }

    const names = [];
    const varIds = [];
    const argIds = [];
    for (const childNode of xmlElement.childNodes) {
      if (childNode.nodeName.toLowerCase() === 'arg') {
        names.push(childNode.getAttribute('name'));
        varIds.push(
          childNode.getAttribute('varid') || childNode.getAttribute('varId')
        );
        argIds.push(childNode.getAttribute('argid'));
      }
    }
    this.updateShape_(names, varIds, argIds);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns {{params: (!Array<{name: string, id: string}>|undefined),
   *     hasStatements: (boolean|undefined)}} The state of this block, eg the
   *     parameters and statements.
   */
  saveExtraState: function () {
    if (!this.argData_.length && this.hasStatements_) {
      return null;
    }

    const state = Object.create(null);
    if (this.argData_.length) {
      state['params'] = [];
      this.argData_.forEach(arg => {
        const model = arg.model;
        state['params'].push({
          name: model.name,
          id: model.getId(),
          argId: arg.argId,
        });
      });
    }
    if (!this.hasStatements_) {
      state['hasStatements'] = false;
    }
    return state;
  },

  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, eg the parameters and
   *     statements.
   */
  loadExtraState: function (state) {
    // We have to handle this so that the user doesn't add blocks to the stack,
    // in which case it would be impossible to return to the old mutators.
    this.hasStatements_ = state['hasStatements'] !== false;
    if (!this.hasStatements_) {
      this.removeInput('STACK');
    }

    const names = [];
    const varIds = [];
    const argIds = [];
    if (state['params']) {
      for (let i = 0; i < state['params'].length; i++) {
        const param = state['params'][i];
        names.push(param['name']);
        varIds.push(param['id']);
        argIds.push(param['argId']);
      }
    }
    this.updateShape_(names, varIds, argIds);
  },

  /**
   * Adds arguments to the block until it matches the targets.
   * @param {!Array<string>} names An array of argument names to display.
   * @param {!Array<string>} varIds An array of variable IDs associated with
   *     those names.
   * @param {!Array<?string>} argIds An array of argument IDs associated with
   *     those names.
   * @this {GoogleBlockly.Block}
   * @private
   */
  updateShape_: function (names, varIds, argIds) {
    if (names.length !== varIds.length) {
      throw Error('names and varIds must have the same length.');
    }
    // Usually it's more efficient to modify the block, rather than tearing it
    // down and rebuilding (less render calls), but in this case it's easier
    // to just work from scratch.

    // We need to remove args in reverse order so that it doesn't mess up
    // as removeArg_ modifies our array.
    for (let i = this.argData_.length - 1; i >= 0; i--) {
      this.removeArg_(this.argData_[i].argId);
    }
    this.argData_ = [];
    const length = varIds.length;
    for (let i = 0; i < length; i++) {
      this.addArg_(names[i], varIds[i], argIds[i]);
    }
    GoogleBlockly.Procedures.mutateCallers(this);
  },

  /**
   * Callback for the plus image. Adds an argument to the block and mutates
   * callers to match.
   */
  plus: function () {
    this.addArg_();
    GoogleBlockly.Procedures.mutateCallers(this);
  },

  /**
   * Callback for the minus image. Removes the argument associated with the
   * given argument ID and mutates the callers to match.
   * @param {string} argId The argId of the argument to remove.
   * @this {GoogleBlockly.Block}
   */
  minus: function (argId) {
    if (!this.argData_.length) {
      return;
    }
    this.removeArg_(argId);
    GoogleBlockly.Procedures.mutateCallers(this);
  },

  /**
   * Adds an argument to the block and updates the block's parallel tracking
   * arrays as appropriate.
   * @param {?string=} name An optional name for the argument.
   * @param {?string=} varId An optional variable ID for the argument.
   * @param {?string=} argId An optional argument ID for the argument
   *     (used to identify the argument across variable merges).
   * @this {GoogleBlockly.Block}
   * @private
   */
  addArg_: function (name = null, varId = null, argId = null) {
    if (!this.argData_.length) {
      const withField = new GoogleBlockly.FieldLabel(
        GoogleBlockly.Msg['PROCEDURES_BEFORE_PARAMS']
      );
      this.getInput('TOP').appendField(withField, 'WITH');
    }

    const argNames = this.argData_.map(elem => elem.model.name);
    name =
      name ||
      GoogleBlockly.Variables.generateUniqueNameFromOptions(
        GoogleBlockly.Procedures.DEFAULT_ARG,
        argNames
      );
    const variable = GoogleBlockly.Variables.getOrCreateVariablePackage(
      this.workspace,
      varId,
      name,
      ''
    );
    argId = argId || GoogleBlockly.utils.idGenerator.genUid();

    this.addVarInput_(name, argId);
    if (this.getInput('STACK')) {
      this.moveInputBefore(argId, 'STACK');
    } else {
      this.moveInputBefore(argId, 'RETURN');
    }

    this.argData_.push({
      model: variable,
      argId: argId,
    });
  },

  /**
   * Removes any matching argument reporter blocks from the definition, then
   * removes the input associated with the given argument ID from the block.
   * @param {string} argId An ID used to track arguments on the block.
   * @private
   */
  removeArg_: function (argId) {
    // Find the argument name by traversing the connection of the arg input.
    const argLabel = this.getInput(argId)
      .connection.targetConnection.getSourceBlock()
      .getFieldValue('VAR');

    // Find other arg blocks in the same stack with the same field value,
    // then remove them.
    const matchingArgReporters = this.workspace.getAllBlocks().filter(
      block =>
        // Block must be in the same stack (e.g. function definition)
        block.getRootBlock() === this.getRootBlock() &&
        block.type === BLOCK_TYPES.argumentReporter &&
        !block.isShadow() &&
        block.getFieldValue('VAR') === argLabel
    );
    matchingArgReporters.forEach(block => block.dispose());

    // Remove the arg input and, if it was the only one, remove the "with:" label
    if (this.removeInput(argId, true)) {
      if (this.argData_.length === 1) {
        // Becoming argumentless.
        this.getInput('TOP').removeField('WITH');
      }
      this.argData_ = this.argData_.filter(element => element.argId !== argId);
    }
  },

  /**
   * Appends the actual inputs and fields associated with an argument to the
   * block.
   * @param {string} name The name of the argument.
   * @param {string} argId The UUID of the argument (different from var ID).
   * @this {GoogleBlockly.Block}
   * @private
   */
  addVarInput_: function (name, argId) {
    this.appendValueInput(argId)
      .setAlign(GoogleBlockly.inputs.RIGHT)
      .appendField(createMinusField(argId));

    // Create a new argument reporter block and connect it to the input.
    const argBlock = GoogleBlockly.serialization.blocks.append(
      {type: 'argument_reporter', fields: {VAR: name}},
      this.workspace
    );
    this.getInput(argId).connection.connect(argBlock.outputConnection);
    argBlock.setShadow(true);
  },
};

/**
 * Initializes some private variables for procedure blocks.
 * @this {GoogleBlockly.Block}
 */
const procedureDefHelper = function () {
  /**
   * An array of objects containing data about the args belonging to the
   * procedure definition.
   * @type {!Array<{
   *          model:GoogleBlockly.VariableModel,
   *          argId: string
   *       }>}
   * @private
   */
  this.argData_ = [];
  /**
   * Does this block have a 'STACK' input for statements?
   * @type {boolean}
   * @private
   */
  this.hasStatements_ = true;

  this.getInput('TOP').insertFieldAt(0, createPlusField(), 'PLUS');
};
GoogleBlockly.Extensions.unregister('advanced_procedure_def_mutator');
GoogleBlockly.Extensions.registerMutator(
  'advanced_procedure_def_mutator',
  procedureDefMutator,
  procedureDefHelper
);

/**
 * Sets the validator for the procedure's name field.
 * @this {GoogleBlockly.Block}
 */
const procedureRename = function () {
  this.getField('NAME').setValidator(GoogleBlockly.Procedures.rename);
};

GoogleBlockly.Extensions.register('procedure_rename', procedureRename);

/**
 * Defines functions for dealing with variables and renaming variables.
 * @this {GoogleBlockly.Block}
 */
const procedureVars = function () {
  // This is a hack to get around the don't-override-builtins check.
  const mixin = {
    /**
     * Return all variables referenced by this block.
     * @returns {!Array.<string>} List of variable names.
     * @this {GoogleBlockly.Block}
     */
    getVars: function () {
      return this.argData_.map(elem => elem.model.name);
    },

    /**
     * Return all variables referenced by this block.
     * @returns {!Array.<!GoogleBlockly.VariableModel>} List of variable models.
     * @this {GoogleBlockly.Block}
     */
    getVarModels: function () {
      return this.argData_.map(elem => elem.model);
    },

    /**
     * Notification that a variable was renamed to the same name as an existing
     * variable. These variables are coalescing into a single variable with the
     * ID of the variable that was already using the name.
     * @param {string} oldId The ID of the variable that was renamed.
     * @param {string} newId The ID of the variable that was already using
     *     the name.
     */
    renameVarById: function (oldId, newId) {
      const argData = this.argData_.find(
        element => element.model.getId() === oldId
      );
      if (!argData) {
        return; // Not on this block.
      }

      const newVar = this.workspace.getVariableById(newId);
      const newName = newVar.name;
      this.addVarInput_(newName, newId);
      this.moveInputBefore(newId, oldId);
      this.removeInput(oldId);
      argData.model = newVar;
      GoogleBlockly.Procedures.mutateCallers(this);
    },

    /**
     * Notification that a variable is renaming but keeping the same ID.  If the
     * variable is in use on this block, rerender to show the new name.
     * @param {!GoogleBlockly.VariableModel} variable The variable being renamed.
     * @package
     * @override
     * @this {GoogleBlockly.Block}
     */
    updateVarName: function (variable) {
      const id = variable.getId();
      const argData = this.argData_.find(
        element => element.model.getId() === id
      );
      if (!argData) {
        return; // Not on this block.
      }
      this.getField(argData.argId).setValue(variable.name, false);
      argData.model = variable;
    },
  };

  this.mixin(mixin, true);
};

GoogleBlockly.Extensions.register('procedure_vars', procedureVars);

/**
 * Validates text entered into the argument name field.
 * @param {string} newValue The new text entered into the field.
 * @returns {?string} The field's new value.
 * @this {GoogleBlockly.FieldTextInput}
 */
function argumentReporterValidator(newValue) {
  const sourceArgBlock = this.getSourceBlock();
  const defBlock = sourceArgBlock.getRootBlock();
  if (
    !Blockly.cdoUtils.isFunctionBlock(defBlock) ||
    !sourceArgBlock.isShadow()
  ) {
    return;
  }

  const argName =
    sourceArgBlock.outputConnection?.targetConnection?.getParentInput()?.name;
  const workspace = sourceArgBlock.workspace;
  const argData = defBlock.argData_;
  const argDatum = defBlock.argData_.find(element => element.argId === argName);
  const currId = argDatum.model.getId();

  // Replace all whitespace with normal spaces, then trim.
  newValue = newValue.replace(/[\s\xa0]+/g, ' ').trim();
  const caselessName = newValue.toLowerCase();

  /**
   * Returns true if the given argDatum is associated with this field, or has
   * a different caseless name than the argDatum associated with this field.
   * @param {{model: GoogleBlockly.VariableModel, argId:string}} argDatum The
   *     argDatum we want to make sure does not conflict with the argDatum
   *     associated with this field.
   * @returns {boolean} True if the given datum does not conflict with the
   *     datum associated with this field.
   * @this {GoogleBlockly.FieldTextInput}
   */
  const isValidArgDatum = argDatum => {
    // The field name (aka id) is always equal to the arg id.
    return (
      argDatum.argId === argName ||
      caselessName !== argDatum.model.name.toLowerCase()
    );
  };

  if (!newValue || !argData.every(isValidArgDatum)) {
    GoogleBlockly.Procedures.mutateCallers(sourceArgBlock.getRootBlock());
    return null;
  }

  // Create new vars instead of renaming the old ones, so users can't
  // accidentally rename/coalesce vars.
  let model = workspace.getVariable(newValue, '');
  if (!model) {
    model = workspace.createVariable(newValue, '');
  } else if (model.name !== newValue) {
    // Blockly is case-insensitive so we have to update the var instead of
    // creating a new one.
    workspace.renameVariableById(model.getId(), newValue);
  }
  if (model.getId() !== currId) {
    argDatum.model = model;
  }
  GoogleBlockly.Procedures.mutateCallers(sourceArgBlock.getRootBlock());
  return newValue;
}

GoogleBlockly.Extensions.register('argument_reporter_validator', function () {
  this.getField('VAR').setValidator(argumentReporterValidator);
  this.onchange = event => {
    const workspace = GoogleBlockly.Workspace.getById(event.workspaceId);
    const eventBlock = workspace.getBlockById(event.blockId);
    if (eventBlock?.type === BLOCK_TYPES.argumentReporter) {
      switch (event.type) {
        // For a field value change events, we update other matching blocks within
        // the stack, and update the warning text. For block change and block move
        // events, we only need to update the warning text. The fallthrough between
        // the cases below is deliberate so that we ensure the warning text gets
        // updated for any of the event types that we care about.
        case GoogleBlockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE:
          workspace
            .getAllBlocks()
            .filter(
              block =>
                block.getRootBlock() === eventBlock?.getRootBlock() &&
                block.type === BLOCK_TYPES.argumentReporter &&
                block.getFieldValue('VAR') === event.oldValue
            )
            .forEach(matchingBlock =>
              matchingBlock.getField('VAR').setValue(event.newValue, false)
            );
        // eslint-disable-next-line no-fallthrough
        case GoogleBlockly.Events.BLOCK_MOVE:
        // eslint-disable-next-line no-fallthrough
        case GoogleBlockly.Events.BLOCK_CHANGE:
          updateArgReporterWarningText(eventBlock);
          break;
      }
    } else if (event.type === GoogleBlockly.Events.FINISHED_LOADING) {
      const argReporterBlocks = GoogleBlockly.getMainWorkspace()
        .getAllBlocks()
        .filter(block => block.type === BLOCK_TYPES.argumentReporter);
      argReporterBlocks.forEach(updateArgReporterWarningText);
    }
  };
});

function updateArgReporterWarningText(block) {
  const topBlock = block.getRootBlock();
  if (topBlock.isEnabled()) {
    if (!Blockly.cdoUtils.isFunctionBlock(topBlock)) {
      block.setWarningText(
        'Warning: This block may be used only within a function definition.'
      );
    } else {
      if (
        !topBlock
          .getVarModels()
          .some(varModel => varModel.name === block.getFieldValue('VAR'))
      ) {
        const funcName = topBlock.getFieldValue('NAME');
        const paramName = block.getFieldValue('VAR');
        block.setWarningText(
          `The "${funcName}" function does not have a parameter with label "${paramName}".`
        );
      } else {
        block.setWarningText(null);
      }
    }
  } else {
    block.setWarningText(null);
  }
}

/**
 * Removes any unused vars that were created as a result of editing.
 * @param {string} _finalName The final value of the field.
 * @this {GoogleBlockly.FieldTextInput}
 */
function finishEditing_(_finalName) {
  const sourceArgBlock = this.getSourceBlock();
  const rootBlock = sourceArgBlock.getRootBlock();

  if (
    sourceArgBlock === rootBlock ||
    !Blockly.cdoUtils.isFunctionBlock(rootBlock)
  ) {
    return;
  }

  deleteUnusedVariables(sourceArgBlock.workspace);
}

GoogleBlockly.Extensions.register(
  'argument_reporter_finish_editing',
  function () {
    const varField = this.getField('VAR');
    varField.onFinishEditing_ = finishEditing_.bind(varField);
    varField.varIdsToDelete_ = [];
  }
);

GoogleBlockly.Extensions.register(
  'argument_report_get_var_models',
  function () {
    this.getVarModels = () => {
      const varModels = [];
      const foundModel = this.workspace.getVariable(this.getFieldValue('VAR'));
      if (foundModel) {
        varModels.push(foundModel);
      }
      return varModels;
    };
  }
);

function deleteUnusedVariables(workspace) {
  // Get all declared variables
  const allVariables = workspace.getAllVariables();

  // Get all used variables
  const usedVariables = Blockly.Variables.allUsedVarModels(workspace);

  // Convert used variables to a set for easy lookup
  const usedVariableIds = new Set(
    usedVariables.map(variable => variable.getId())
  );

  // Find unused variables
  const unusedVariables = allVariables.filter(
    variable => !usedVariableIds.has(variable.getId())
  );
  unusedVariables.forEach(varToDelete => {
    console.log(`Deleting unused variable ${varToDelete.name}`);
    workspace.deleteVariableById(varToDelete.getId());
  });
}
