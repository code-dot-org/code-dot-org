import * as GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';
import {nameComparator} from '@cdo/apps/util/sort';
import BlockSvgFrame from '@cdo/apps/blockly/addons/blockSvgFrame';
import {createAndCenterDefinitionBlock} from './proceduresBlocks';
import {convertXmlToJson} from '@cdo/apps/blockly/addons/cdoSerializationHelpers';
import {behaviorDefMutator} from './mutators/behaviorDefMutator';
import {behaviorGetMutator} from './mutators/behaviorGetMutator';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
const useModalFunctionEditor = window.appOptions?.level?.useModalFunctionEditor;
const modalFunctionEditorExperimentEnabled = experiments.isEnabled(
  experiments.MODAL_FUNCTION_EDITOR
);

/**
 * A dictionary of our custom procedure block definitions, used across labs.
 * Replaces blocks that are part of core Blockly.
 * @type {!Object<string, Object>}
 */
export const blocks = GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
  {
    // Block for defining a behavior (a type of procedure) with no return value.
    // When using the modal function editor, the name field is an uneditable label.
    type: BLOCK_TYPES.behaviorDefinition,
    message0: useModalFunctionEditor
      ? '%1 %2 %3 %4 %5 %6 %7 %8'
      : '%1 %2 %3 %4 %5',
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
        name: 'THIS_SPRITE',
        text: `with: ${msg.thisSprite()}`,
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
      useModalFunctionEditor && {
        type: 'field_label',
        text: `${msg.description()}: `,
        name: 'DESCRIPTION_LABEL',
      },
      useModalFunctionEditor && {
        type: 'field_input',
        name: 'DESCRIPTION',
        text: '',
      },
      useModalFunctionEditor && {
        type: 'input_dummy',
      },
    ],
    args1: [
      {
        type: 'input_statement',
        name: 'STACK',
      },
    ],
    style: 'behavior_blocks',
    helpUrl: '%{BKY_PROCEDURES_DEFNORETURN_HELPURL}',
    tooltip: '%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}',
    extensions: [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_defnoreturn_set_comment_helper',
      'procedure_def_set_no_return_helper',
      'behaviors_block_frame',
      'procedure_def_mini_toolbox',
      'modal_procedures_no_destroy',
    ],
    mutator: 'behavior_def_mutator',
  },
  {
    type: BLOCK_TYPES.behaviorGet,
    message0: '%1 %2',
    args0: [
      {type: 'field_label', name: 'NAME', text: '%{BKY_UNNAMED_KEY}'},
      {
        type: 'input_dummy',
        name: 'TOPROW',
      },
    ],
    output: 'Behavior',
    style: 'behavior_blocks',
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
    mutator: 'behavior_get_mutator',
  },
  {
    type: BLOCK_TYPES.spriteParameterGet,
    message0: '%1',
    args0: [
      {
        type: 'field_label',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
        text: msg.thisSprite(),
      },
    ],
    output: 'Sprite',
    style: 'sprite_blocks',
    helpUrl: '%{BKY_VARIABLES_GET_HELPURL}',
    tooltip: '%{BKY_VARIABLES_GET_TOOLTIP}',
    extensions: ['contextMenu_variableSetterGetter'],
  },
]);

// Mutators and Extensions
GoogleBlockly.Extensions.registerMutator(
  'behavior_def_mutator',
  behaviorDefMutator
);

// This extension adds an SVG frame around behavior definition blocks.
// Not used when the modal function editor is enabled.
GoogleBlockly.Extensions.register('behaviors_block_frame', function () {
  if (!useModalFunctionEditor && !this.workspace.noFunctionBlockFrame) {
    this.functionalSvg_ = new BlockSvgFrame(
      this,
      msg.behaviorEditorHeader(),
      'blocklyFunctionalFrame'
    );

    this.setOnChange(function () {
      if (!this.isInFlyout) {
        this.functionalSvg_.render(this.svgGroup_, this.RTL);
      }
    });
  }
});

GoogleBlockly.Extensions.registerMutator(
  'behavior_get_mutator',
  behaviorGetMutator
);

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of XML block elements
 */
export function flyoutCategory(workspace, functionEditorOpen = false) {
  const blockList = [];

  const newBehaviorButton = {
    kind: 'button',
    text: msg.createBlocklyBehavior(),
    callbackKey: 'createNewBehavior',
  };
  const behaviorDefinitionBlock = {
    kind: 'block',
    type: BLOCK_TYPES.behaviorDefinition,
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
  };

  const createNewBehavior = function () {
    if (modalFunctionEditorExperimentEnabled) {
      Blockly.functionEditor.newProcedureCallback(
        BLOCK_TYPES.behaviorDefinition
      );
    } else {
      createAndCenterDefinitionBlock(behaviorDefinitionBlock);
    }
  };

  // If the modal function editor is enabled, we render a button to open the editor
  // Otherwise, we render a "blank" behavior definition block
  if (functionEditorOpen) {
    // No-op -- cannot create new behaviors while the modal editor is open
  } else if (useModalFunctionEditor) {
    workspace.registerButtonCallback('createNewBehavior', createNewBehavior);
    blockList.push(newBehaviorButton);
  }

  blockList.push(...getCustomCategoryBlocksForFlyout('Behavior'));

  // Workspaces to populate behaviors flyout category from
  const workspaces = [
    Blockly.getMainWorkspace(),
    Blockly.getHiddenDefinitionWorkspace(),
  ];

  const allBehaviors = [];
  workspaces.forEach(workspace => {
    const behaviorBlocks = workspace
      .getTopBlocks()
      .filter(topBlock => topBlock.type === BLOCK_TYPES.behaviorDefinition);
    behaviorBlocks.forEach(block =>
      allBehaviors.push({
        name: block.getFieldValue('NAME'),
        id: block.id,
      })
    );
  });

  allBehaviors.sort(nameComparator).forEach(({name, id}) => {
    blockList.push({
      kind: 'block',
      type: BLOCK_TYPES.behaviorGet,
      extraState: {
        name,
        id,
      },
      fields: {
        NAME: name,
      },
    });
  });

  return blockList;
}

function getCustomCategoryBlocksForFlyout(category) {
  const parser = new DOMParser();
  // TODO: Update this to use JSON once https://codedotorg.atlassian.net/browse/CT-8 is merged
  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');

  const categoryNodes = xmlDoc.getElementsByTagName('category');
  for (const categoryNode of categoryNodes) {
    const categoryCustom = categoryNode.getAttribute('custom');

    if (categoryCustom === category) {
      const xmlRootElement = xmlDoc.createElement('xml'); // Create a new <xml> root element

      const blockNodes = categoryNode.getElementsByTagName('block');
      for (const blockNode of blockNodes) {
        if (blockNode.parentElement === categoryNode) {
          xmlRootElement.appendChild(blockNode.cloneNode(true)); // Append cloned block nodes
        }
      }

      const jsonBlocks = convertXmlToJson(xmlRootElement);
      const flyoutBlocks = jsonBlocks.blocks.blocks.map(
        simplifyBlockStateForFlyout
      );

      // Returns an array of simplified JSON blocks for flyout, or an empty array
      // if the desired category is not found
      return flyoutBlocks;
    }
  }
  return [];
}

// Used to simplify block state for inclusion in the Behaviors category flyout
function simplifyBlockStateForFlyout(block) {
  // Clone the original block object to avoid modifying it directly
  const modifiedBlock = {...block};

  // Remove id, x, and y properties
  delete modifiedBlock.id;
  delete modifiedBlock.x;
  delete modifiedBlock.y;

  // Add kind property with value 'block'
  modifiedBlock.kind = 'block';

  return modifiedBlock;
}
