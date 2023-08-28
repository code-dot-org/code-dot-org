import * as GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';
import {nameComparator} from '@cdo/apps/util/sort';
import BlockSvgFrame from '../../addons/blockSvgFrame';
import {procedureDefMutator} from './mutators/procedureDefMutator';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
const useModalFunctionEditor = window.appOptions?.level?.useModalFunctionEditor;
/**
 * A dictionary of our custom procedure block definitions, used across labs.
 * Replaces blocks that are part of core Blockly.
 * @type {!Object<string, Object>}
 */
export const blocks = GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
  {
    // Block for defining a function (aka procedure) with no return value.
    // When using the modal function editor, the name field is an uneditable label.
    type: 'procedures_defnoreturn',
    message0: '%1 %2 %3 %4',
    message1: '%1',
    args0: [
      {
        type: 'field_label',
        text: ' ',
      },
      {
        type: useModalFunctionEditor ? 'field_label' : 'field_input',
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
      'procedure_defnoreturn_set_comment_helper',
      'procedure_def_set_no_return_helper',
      'procedures_block_frame',
      'modal_procedures_no_destroy',
    ],
    mutator: 'procedure_def_mutator',
  },
  {
    // Block for calling a procedure with no return value.
    type: 'procedures_callnoreturn',
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
  if (experiments.isEnabled(experiments.MODAL_FUNCTION_EDITOR)) {
    const procedure = this.getSourceBlock().getProcedureModel();
    if (procedure) {
      Blockly.functionEditor.showForFunction(procedure);
    }
  } else {
    // If we aren't using the new modal function editor yet, just center the block that
    // was clicked.
    const workspace = this.getSourceBlock().workspace;
    const name = this.getSourceBlock().getFieldValue('NAME');
    const definition = GoogleBlockly.Procedures.getDefinition(name, workspace);
    if (definition) {
      workspace.centerOnBlock(definition.id);
      definition.select();
    }
  }
};

// This extension adds an edit button to the end of a procedure call block.
const editButton = function () {
  // Edit buttons are used to open the modal editor. The button is appended to the last input.
  if (
    useModalFunctionEditor &&
    this.inputList.length &&
    !this.workspace.isFlyout
  ) {
    const button = new Blockly.FieldButton({
      value: msg.edit(),
      onClick: editButtonHandler,
      colorOverrides: {button: 'blue', text: 'white'},
    });
    this.inputList[this.inputList.length - 1].appendField(button, 'EDIT');
  }
};

GoogleBlockly.Extensions.register('procedures_edit_button', editButton);

// This extension adds an SVG frame around procedures definition blocks.
// Not used in Music Lab or wherever the modal function is enabled.
GoogleBlockly.Extensions.register('procedures_block_frame', function () {
  if (!useModalFunctionEditor && !this.workspace.noFunctionBlockFrame) {
    this.functionalSvg_ = new BlockSvgFrame(
      this,
      msg.function(),
      'blocklyFunctionalFrame'
    );

    this.setOnChange(function () {
      if (!this.isInFlyout) {
        this.functionalSvg_.render(this.svgGroup_, this.RTL);
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

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of block objects representing the flyout blocks
 */
export function flyoutCategory(workspace, functionEditorOpen = false) {
  const useNewFunctionEditor = experiments.isEnabled(
    experiments.MODAL_FUNCTION_EDITOR
  );
  console.log(
    'useModalFunctionEditor in flyoutCategory: ',
    useNewFunctionEditor
  );
  const blockList = [];

  const newFunctionButton = {
    kind: 'button',
    text: msg.createBlocklyFunction(),
    callbackKey: useNewFunctionEditor
      ? 'newProcedureCallback'
      : 'createNewFunction',
  };
  const functionDefinitionBlock = {
    kind: 'block',
    type: 'procedures_defnoreturn',
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
  };

  const createNewFunction = function () {
    // Everything here is place-holder code that should be replaced with a
    // call to open the behavior editor with a new defintion block.
    // Until then, we just create a block under all existing blocks on the
    // main workspace.
    createNewDefinitionBlock(functionDefinitionBlock);
  };

  if (functionEditorOpen) {
    // No-op - cannot create new functions while the modal editor is open
  } else if (useModalFunctionEditor) {
    workspace.registerButtonCallback('createNewFunction', createNewFunction);
    workspace.registerButtonCallback(
      'newProcedureCallback',
      Blockly.functionEditor.newProcedureCallback
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
    console.log('workspace: ', workspace);
    const procedureBlocks = workspace
      .getTopBlocks()
      .filter(topBlock => topBlock.type === 'procedures_defnoreturn');
    console.log('procedureBlocks', procedureBlocks);
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

const getLowestBlockBottomY = () => {
  let lowestBlockBottom = 0;
  Blockly.getMainWorkspace()
    .getTopBlocks()
    .forEach(block => {
      const blockY = block.getRelativeToSurfaceXY().y;
      const blockBottom = blockY + block.getHeightWidth().height;
      if (blockBottom > lowestBlockBottom) {
        lowestBlockBottom = blockBottom;
      }
    });
  return lowestBlockBottom + 16;
};

// Creates a new definition block under all existing blocks on the main workspace,
// scrolls to the block, and selects it
// TODO: Replace this with code to open the behavior editor with the new definition block
export const createNewDefinitionBlock = blockState => {
  const newDefinitionBlock = Blockly.serialization.blocks.append(
    {...blockState, x: 16, y: getLowestBlockBottomY()},
    Blockly.getMainWorkspace()
  );

  // Close the open toolbox flyout
  Blockly.getMainWorkspace().hideChaff();

  // Scroll to the new block and select it.
  Blockly.getMainWorkspace().centerOnBlock(newDefinitionBlock.id);
  newDefinitionBlock.select();
};
