import * as GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';
import {nameComparator} from '@cdo/apps/util/sort';
import BlockSvgFrame from '@cdo/apps/blockly/addons/blockSvgFrame';
import {procedureDefMutator} from './mutators/procedureDefMutator';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import procedureCallerOnChangeMixin from './mixins/procedureCallerOnChangeMixin';
import procedureCallerMutator from './mutators/procedureCallerMutator';

/**
 * A dictionary of our custom procedure block definitions, used across labs.
 * Replaces blocks that are part of core Blockly.
 * @type {!Object<string, Object>}
 */
export const blocks = GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
  {
    // Block for defining a function (aka procedure) with no return value.
    // When using the modal function editor, the name field is an uneditable label.
    type: BLOCK_TYPES.procedureDefinition,
    message0: '%1 %2 %3 %4',
    message1: '%1',
    args0: [
      {
        type: 'field_label',
        text: ' ',
      },
      {
        type: 'field_input',
        name: 'NAME',
        text: '',
        spellcheck: false,
      },
      {
        type: 'field_label',
        name: 'PARAMS',
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
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_def_set_no_return_helper',
      'procedures_block_frame',
      'procedure_def_mini_toolbox',
      'modal_procedures_no_destroy',
    ],
    mutator: 'procedure_def_mutator',
  },
  {
    // Block for calling a procedure with no return value.
    type: BLOCK_TYPES.procedureCall,
    message0: '%1 %2',
    args0: [
      {type: 'field_label', name: 'NAME', text: '%{BKY_UNNAMED_KEY}'},
      {
        type: 'input_dummy',
        name: 'TOPROW',
      },
    ],
    nextStatement: null,
    previousStatement: null,
    style: 'procedure_blocks',
    helpUrl: '%{BKY_PROCEDURES_CALLNORETURN_HELPURL}',
    extensions: [
      'procedures_edit_button',
      'procedure_caller_get_def_mixin',
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      'procedure_callernoreturn_get_def_block_mixin',
      'modal_procedures_no_destroy',
    ],
    mutator: 'procedure_caller_mutator',
  },
]);

// Respond to the click of a call block's edit button
export const editButtonHandler = function () {
  const procedure = this.getSourceBlock().getProcedureModel();
  if (procedure) {
    Blockly.functionEditor.showForFunction(procedure);
  }
};

// This extension adds an edit button to the end of a procedure call block.
GoogleBlockly.Extensions.register('procedures_edit_button', function () {
  // Edit buttons are used to open the modal editor. The button is appended to the last input.
  // If we are in the modal function editor, don't add the button, due to an issue with Blockly
  // not being able to handle us clearing the block right after it has been clicked.
  // TODO: After we updgrade to Blockly v10, check if this issue has been fixed, and if it has,
  // remove the check on functionEditor workspace id.
  if (
    Blockly.useModalFunctionEditor &&
    this.inputList.length &&
    !this.workspace.isFlyout &&
    this.workspace.id !== Blockly.functionEditor.getWorkspaceId() &&
    toolboxConfigurationSupportsEditButton(this)
  ) {
    const button = new Blockly.FieldButton({
      value: msg.edit(),
      onClick: editButtonHandler,
      colorOverrides: {button: 'blue', text: 'white'},
    });
    this.inputList[this.inputList.length - 1].appendField(button, 'EDIT');
  }
});

// This extension renders function and behavior definitions as mini toolboxes
// The only toolbox blocks are a comment (for functions) or a comment + "this sprite" block (for behaviors)
GoogleBlockly.Extensions.register('procedure_def_mini_toolbox', function () {
  // TODO: Add comment block here after https://codedotorg.atlassian.net/browse/CT-121
  let miniToolboxBlocks = [];
  if (this.type === 'behavior_definition') {
    miniToolboxBlocks.push('sprite_parameter_get');
  }

  // TODO: Remove this comment after https://codedotorg.atlassian.net/browse/CT-121
  if (!miniToolboxBlocks.length) {
    return;
  }

  const renderToolboxBeforeStack = true;
  const flyoutToggleButton = Blockly.customBlocks.initializeMiniToolbox.bind(
    this
  )(undefined, renderToolboxBeforeStack);
  const renderingInFunctionEditor = true;
  Blockly.customBlocks.appendMiniToolboxToggle.bind(this)(
    miniToolboxBlocks,
    flyoutToggleButton,
    renderingInFunctionEditor
  );
  // Open mini-toolbox by default
  flyoutToggleButton.setIcon(false);
});

// This extension adds an SVG frame around procedures definition blocks.
// Not used in Music Lab or wherever the modal function is enabled.
GoogleBlockly.Extensions.register('procedures_block_frame', function () {
  if (!Blockly.useModalFunctionEditor && !this.workspace.noFunctionBlockFrame) {
    const getColor = () => {
      return Blockly.cdoUtils.getBlockColor(this);
    };
    this.functionalSvg_ = new BlockSvgFrame(
      this,
      msg.function(),
      'blocklyFunctionalFrame',
      getColor
    );

    this.setOnChange(function () {
      if (!this.isInFlyout) {
        this.functionalSvg_.render();
      }
    });
  }
});

// Override the destroy function to not destroy the procedure. We need to do this
// so that when we clear the modal function editor we don't remove the procedure
// from the procedure map.
GoogleBlockly.Extensions.register('modal_procedures_no_destroy', function () {
  const mixin = {
    destroy: function () {
      // no-op
      // this overrides the destroy hook registered
      // in the procedure_def_get_def_mixin
    },
  };
  // We can't register this as a mixin since we're overwriting existing methods
  Object.assign(this, mixin);
});

// TODO: After updating to Blockly v10, remove this local copy of
// procedureDefMutator and instead modify the imported mutator directly.
// Our local copy has the compose() and decompose() methods removed.
GoogleBlockly.Extensions.unregister('procedure_def_mutator');
GoogleBlockly.Extensions.registerMutator(
  'procedure_def_mutator',
  procedureDefMutator
);

// TODO: After updating to Blockly v10, use the original
// procedure_caller_mutator and procedure_caller_on_change_mixin.
// https://codedotorg.atlassian.net/browse/CT-148
GoogleBlockly.Extensions.unregister('procedure_caller_mutator');
GoogleBlockly.Extensions.registerMutator(
  'procedure_caller_mutator',
  procedureCallerMutator
);

GoogleBlockly.Extensions.unregister('procedure_caller_onchange_mixin');
GoogleBlockly.Extensions.registerMixin(
  'procedure_caller_onchange_mixin',
  procedureCallerOnChangeMixin
);

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of block objects representing the flyout blocks
 */
export function flyoutCategory(workspace, functionEditorOpen = false) {
  const blockList = [];

  // Note: Blockly.Msg was undefined when this code was extracted into global scope
  const functionDefinitionBlock = {
    kind: 'block',
    type: BLOCK_TYPES.procedureDefinition,
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
  };

  if (functionEditorOpen) {
    // No-op - cannot create new functions while the modal editor is open
  } else if (Blockly.useModalFunctionEditor) {
    const newFunctionButton = getNewFunctionButtonWithCallback(
      workspace,
      functionDefinitionBlock
    );
    blockList.push(newFunctionButton);
  } else {
    blockList.push(functionDefinitionBlock);
  }

  // Workspaces to populate functions flyout category from
  const workspaces = [
    Blockly.getMainWorkspace(),
    Blockly.getHiddenDefinitionWorkspace(),
  ];

  const allFunctions = [];
  workspaces.forEach(workspace => {
    const procedureBlocks = workspace
      .getTopBlocks()
      .filter(topBlock => topBlock.type === BLOCK_TYPES.procedureDefinition);
    procedureBlocks.forEach(block => {
      allFunctions.push({
        name: block.getFieldValue('NAME'),
        id: block.id,
      });
    });
  });

  allFunctions.sort(nameComparator).forEach(({name, id}) => {
    blockList.push({
      kind: 'block',
      type: 'procedures_callnoreturn',
      extraState: {
        name: name,
        id: id,
      },
      fields: {
        NAME: name,
      },
    });
  });

  return blockList;
}

const getNewFunctionButtonWithCallback = (
  workspace,
  functionDefinitionBlock
) => {
  let callbackKey, callback;

  callbackKey = 'newProcedureCallback';
  callback = () =>
    Blockly.functionEditor.newProcedureCallback(
      BLOCK_TYPES.procedureDefinition
    );

  workspace.registerButtonCallback(callbackKey, callback);

  return {
    kind: 'button',
    text: msg.createBlocklyFunction(),
    callbackKey,
  };
};

/**
 * We always show the edit button for function callers, but
 * conditionally show it for behavior callers and pickers.
 * For behavior callers and pickers we only show the edit button
 * if there is a categorized toolbox or no toolbox.
 * The reason for this is renaming behaviors without the behavior
 * category (which can be repopulated after renaming) causes
 * confusing behavior.
 * @param {Block} block Block to check
 * @returns boolean
 */
export const toolboxConfigurationSupportsEditButton = block => {
  if (block.type === BLOCK_TYPES.procedureCall) {
    return true;
  } else {
    // block is a behavior caller or picker.
    const hasCategorizedToolbox = !!block.workspace.toolbox_;
    const hasUncategorizedToolbox = !!block.workspace.flyout;
    // We show the edit button for levels with a categorized toolbox or no toolbox.
    // We do not show it for uncategorized toolboxes because renaming behaviors
    // without the behavior category causes confusing behavior.
    return (
      hasCategorizedToolbox ||
      (!hasCategorizedToolbox && !hasUncategorizedToolbox)
    );
  }
};
