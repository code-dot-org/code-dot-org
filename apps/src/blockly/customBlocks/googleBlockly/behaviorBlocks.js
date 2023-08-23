import * as GoogleBlockly from 'blockly/core';
import BlockSvgFrame from '../../addons/blockSvgFrame';
import msg from '@cdo/locale';
import {createNewDefinitionBlock} from './proceduresBlocks';
import {convertXmlToJson} from '../../addons/cdoSerializationHelpers';
import {behaviorDefMutator} from './mutators/behaviorDefMutator';
import {behaviorGetMutator} from './mutators/behaviorGetMutator';

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
    // Block for defining a behavior (a type of procedure) with no return value.
    // When using the modal function editor, the name field is an uneditable label.
    type: 'behavior_definition',
    message0: '%1 %2 %3 %4 %5',
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
    ],
    mutator: 'behavior_def_mutator',
  },
  {
    type: 'gamelab_behavior_get',
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
    ],
    mutator: 'behavior_get_mutator',
  },
  {
    type: 'sprite_parameter_get',
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
export function flyoutCategory(workspace) {
  const newBehaviorButton = {
    kind: 'button',
    text: msg.createBlocklyBehavior(),
    callbackKey: 'createNewBehavior',
  };
  const behaviorDefinitionBlock = {
    kind: 'block',
    type: 'behavior_definition',
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
  };

  // TODO: Replace this with a call to open the behavior editor with a new block
  const createNewBehavior = () =>
    createNewDefinitionBlock(behaviorDefinitionBlock);

  // If the modal function editor is enabled, we render a button to open the editor
  // Otherwise, we render a "blank" behavior definition block
  let newBehaviorOption;
  if (useModalFunctionEditor) {
    newBehaviorOption = newBehaviorButton;
    workspace.registerButtonCallback('createNewBehavior', createNewBehavior);
  } else {
    newBehaviorOption = behaviorDefinitionBlock;
  }

  const blockList = [
    newBehaviorOption,
    ...getCustomCategoryBlocksForFlyout('Behavior'),
  ];

  const allWorkspaces = Blockly.Workspace.getAll().filter(
    workspace => !workspace.isFlyout
  );
  const allBehaviorNames = [];
  allWorkspaces.forEach(workspace => {
    const behaviorBlocks = workspace
      .getTopBlocks()
      .filter(topBlock => topBlock.type === 'behavior_definition');
    behaviorBlocks.forEach(block =>
      allBehaviorNames.push(block.getFieldValue('NAME'))
    );
  });

  // TODO: Does this require case-insensitive sorting?
  allBehaviorNames.sort().forEach(name => {
    blockList.push({
      kind: 'block',
      type: 'gamelab_behavior_get',
      extraState: {
        name: name,
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
      return flyoutBlocks; // Return the new <xml> root element with block children
    }
  }

  return []; // Return empty array if the desired category is not found
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
