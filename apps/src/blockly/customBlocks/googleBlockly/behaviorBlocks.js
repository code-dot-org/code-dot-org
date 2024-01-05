import * as GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';
import {nameComparator} from '@cdo/apps/util/sort';
import BlockSvgFrame from '../../addons/blockSvgFrame';
import {convertXmlToJson} from '../../addons/cdoSerializationHelpers';
import {behaviorDefMutator} from './mutators/behaviorDefMutator';
import {behaviorGetMutator} from './mutators/behaviorGetMutator';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

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
    message0: '%1 %2 %3 %4 %5',
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
        text: msg.withThisSprite(),
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
      'procedure_def_set_no_return_helper',
      'behaviors_block_frame',
      'procedure_def_mini_toolbox',
      'modal_procedures_no_destroy',
      'behaviors_name_validator',
      'on_behavior_def_change',
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
  if (!Blockly.useModalFunctionEditor && !this.workspace.noFunctionBlockFrame) {
    // Used to create and render an SVG frame instance.
    const getColor = () => {
      return Blockly.cdoUtils.getBlockColor(this);
    };
    this.functionalSvg_ = new BlockSvgFrame(
      this,
      msg.behaviorEditorHeader(),
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

// This extension is used to update the block's behaviorId when a behavior is renamed in start mode.
// TODO: Add logic to update the dropdown options on behaviorPicker blocks too.
GoogleBlockly.Extensions.register('behaviors_name_validator', function () {
  const nameField = this.getField('NAME');
  nameField.setValidator(function (newValue) {
    // The default validator provided by mainline Blockly. Strips whitespace.
    const rename = Blockly.Procedures.rename.bind(this);
    const legalName = rename(newValue);
    if (
      legalName &&
      Blockly.isStartMode &&
      this.sourceBlock_.behaviorId !== legalName
    ) {
      this.sourceBlock_.behaviorId = legalName;
    }
    return legalName;
  });
});

GoogleBlockly.Extensions.register('on_behavior_def_change', function () {
  this.workspace.addChangeListener(event => {
    onBehaviorDefChange(event, this);
  });
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

  const behaviorDefinitionBlock = {
    kind: 'block',
    type: BLOCK_TYPES.behaviorDefinition,
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
  };

  // If the modal function editor is enabled, we render a button to open the editor
  // Behaviors are not editable without the modal editor open
  if (functionEditorOpen) {
    // No-op - cannot create new behaviors while the modal editor is open
  } else if (Blockly.useModalFunctionEditor) {
    const newBehaviorButton = getNewBehaviorButtonWithCallback(
      workspace,
      behaviorDefinitionBlock
    );
    blockList.push(newBehaviorButton);
  }

  // Blockly supports XML or JSON, but not a combination of both.
  // We convert to JSON here because the behavior_get blocks are JSON.
  const levelToolboxBlocks = Blockly.cdoUtils.getLevelToolboxBlocks('Behavior');
  if (!levelToolboxBlocks) {
    return;
  }
  const blocksConvertedJson = convertXmlToJson(
    levelToolboxBlocks.documentElement
  );
  const blocksJson =
    Blockly.cdoUtils.getSimplifiedStateForFlyout(blocksConvertedJson);
  blockList.push(...blocksJson);

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
        behaviorId: block.behaviorId,
      })
    );
  });

  allBehaviors.sort(nameComparator).forEach(({name, id, behaviorId}) => {
    blockList.push({
      kind: 'block',
      type: BLOCK_TYPES.behaviorGet,
      extraState: {
        name,
        id,
        behaviorId,
      },
      fields: {
        NAME: name,
      },
    });
  });

  return blockList;
}

const getNewBehaviorButtonWithCallback = (
  workspace,
  behaviorDefinitionBlock
) => {
  const callbackKey = 'newBehaviorCallback';
  workspace.registerButtonCallback(callbackKey, () => {
    Blockly.functionEditor.newProcedureCallback(BLOCK_TYPES.behaviorDefinition);
  });

  return {
    kind: 'button',
    text: msg.createBlocklyBehavior(),
    callbackKey,
  };
};

// Added as a change listener. If a behavior name changes, we need to update any
// behavior picker blocks that have the old name currently selected.
function onBehaviorDefChange(event, block) {
  if (
    event.type === Blockly.Events.CHANGE &&
    block.id === event.blockId &&
    // Excludes changes to the description field.
    event.name === 'NAME'
  ) {
    const {oldValue, newValue} = event;
    updateBehaviorPickerBlocks(oldValue, newValue);
    if (Blockly.isStartMode) {
      // In start mode, we need up update behavior call blocks to change their behaviorIds.
      // In normal mode the behavior ids are static.
      updateBehaviorCallBlocks(oldValue, newValue);
    }
  }
}

function updateBehaviorCallBlocks(oldValue, newValue) {
  const behaviorCallBlocks = findAllBlocksOfType(BLOCK_TYPES.behaviorGet);
  if (behaviorCallBlocks.length) {
    const blocksToUpdate = behaviorCallBlocks.filter(
      block => block.behaviorId === oldValue
    );
    blocksToUpdate.forEach(block => {
      block.behaviorId = newValue;
    });
  }
}

function updateBehaviorPickerBlocks(oldValue, newValue) {
  const behaviorPickerBlocks = findAllBlocksOfType('gamelab_behaviorPicker');
  if (behaviorPickerBlocks.length) {
    const blocksToUpdate = behaviorPickerBlocks.filter(
      block => block.getFieldValue('BEHAVIOR') === oldValue
    );
    blocksToUpdate.forEach(block => {
      block.setFieldValue(newValue, 'BEHAVIOR');
    });
  }
}

const findAllBlocksOfType = type => {
  const blocks = [];
  Blockly.Workspace.getAll().forEach(workspace =>
    blocks.push(
      ...workspace.getAllBlocks().filter(block => block.type === type)
    )
  );
  return blocks;
};
