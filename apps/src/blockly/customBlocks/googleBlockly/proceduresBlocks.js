import * as GoogleBlockly from 'blockly/core';
import BlockSvgFrame from '../../addons/blockSvgFrame';
import msg from '@cdo/locale';
import {procedureDefMutator} from './mutators/procedureDefMutator';

const useModalFunctionEditor = window.appOptions?.level?.useModalFunctionEditor;
/**
 * A dictionary of our custom procedure block definitions, used across labs.
 * Replaces blocks that are part of core Blockly.
 * @type {!Object<string, Object>}
 */
export const blocks = GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
  {
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
    ],
    mutator: 'procedure_def_mutator',
  },
  {
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
    ],
    mutator: 'procedure_caller_mutator',
  },
]);

// Respond to the click off a call block's edit button
export const editButtonHandler = function () {
  console.log('edit button clicked!');

  // Eventually, this will be where we create a modal function editor.
  // For now, just find the function definition block and select it.
  const workspace = this.getSourceBlock().workspace;
  const name = this.getSourceBlock().getFieldValue('NAME');
  const definition = GoogleBlockly.Procedures.getDefinition(name, workspace);
  if (definition) {
    workspace.centerOnBlock(definition.id);
    definition.select();
  }
};

// This extension adds an edit button to the end of a procedure call block.
const editExtension = function () {
  if (useModalFunctionEditor) {
    const button = new Blockly.FieldButton({
      value: 'edit',
      onClick: editButtonHandler,
      colorOverrides: {button: 'blue', text: 'white'},
    });
    this.inputList[this.inputList.length - 1].appendField(button, 'EDIT');
  }
};

GoogleBlockly.Extensions.register('procedures_edit_button', editExtension);

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

// TODO: After updating to Blockly v10, remove this local copy of
// procedureDefMutator and instead modify the imported mutator directly.
// Our local copy has the compose() and decompose() methods removed.
GoogleBlockly.Extensions.unregister('procedure_def_mutator');
GoogleBlockly.Extensions.registerMutator(
  'procedure_def_mutator',
  procedureDefMutator
);
