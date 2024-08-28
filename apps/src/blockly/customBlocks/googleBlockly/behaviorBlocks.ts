import * as GoogleBlockly from 'blockly/core';
import {Abstract} from 'blockly/core/events/events_abstract';
import {BlockChange} from 'blockly/core/events/events_block_change';
import {FlyoutItemInfoArray} from 'blockly/core/utils/toolbox';

import BlockSvgFrame from '@cdo/apps/blockly/addons/blockSvgFrame';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {ExtendedBlockSvg, ProcedureBlock} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {nameComparator} from '@cdo/apps/util/sort';

import {behaviorCallerGetDefMixin} from './mixins/behaviorCallerGetDefMixin';
import {behaviorCreateDefMixin} from './mixins/behaviorCreateDefMixin';
import {behaviorDefMutator} from './mutators/behaviorDefMutator';
import {behaviorGetMutator} from './mutators/behaviorGetMutator';

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
        text: commonI18n.withThisSprite(),
      },
      {
        type: 'field_label',
        name: 'PARAMS',
        text: '',
      },
      {
        type: 'input_end_row',
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
    helpUrl: '/docs/spritelab/codestudio_defining-behaviors',
    extensions: [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_def_set_no_return_helper',
      'procedure_def_no_gray_out',
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
      {
        type: 'field_label',
        name: 'NAME',
        text: '%{BKY_UNNAMED_KEY}',
      },
      {
        type: 'input_dummy',
        name: 'TOPROW',
      },
    ],
    output: 'Behavior',
    style: 'behavior_blocks',
    helpUrl: '/docs/spritelab/spritelab_adding-and-removing-behaviors',
    extensions: [
      'procedures_edit_button',
      'procedure_caller_get_def_mixin',
      'behavior_caller_get_def_mixin',
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      'behavior_caller_get_def_block_mixin',
      'behavior_create_def_mixin',
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
        text: commonI18n.thisSprite(),
      },
    ],
    output: 'Sprite',
    style: 'sprite_blocks',
    helpUrl: '/docs/spritelab/codestudio_defining-behaviors',
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
GoogleBlockly.Extensions.register(
  'behaviors_block_frame',
  function (this: ExtendedBlockSvg) {
    if (
      !Blockly.useModalFunctionEditor &&
      !this.workspace.noFunctionBlockFrame
    ) {
      // Used to create and render an SVG frame instance.
      const getColor = () => {
        return Blockly.cdoUtils.getBlockColor(this);
      };
      this.functionalSvg_ = new BlockSvgFrame(
        this,
        commonI18n.behaviorEditorHeader(),
        'blocklyFunctionalFrame',
        getColor
      );

      this.setOnChange(function (this: ExtendedBlockSvg) {
        if (!this.isInFlyout) {
          this.functionalSvg_?.render();
        }
      });
    }
  }
);

// This extension is used to update the block's behaviorId when a behavior is renamed in start mode.
GoogleBlockly.Extensions.register(
  'behaviors_name_validator',
  function (this: ExtendedBlockSvg) {
    const nameField = this.getField('NAME');
    nameField?.setValidator(function (
      this: GoogleBlockly.Field<string>,
      newValue
    ) {
      // The default validator provided by mainline Blockly. Strips whitespace.
      const rename = Blockly.Procedures.rename.bind(this);
      const legalName = rename(newValue);
      const sourceBlock = this.sourceBlock_ as ProcedureBlock;
      if (
        legalName &&
        Blockly.isStartMode &&
        sourceBlock.behaviorId !== legalName
      ) {
        sourceBlock.behaviorId = legalName;
      }
      return legalName;
    });
  }
);

GoogleBlockly.Extensions.register(
  'on_behavior_def_change',
  function (this: ExtendedBlockSvg) {
    this.workspace.addChangeListener(event => {
      onBehaviorDefChange(event, this);
    });
  }
);

GoogleBlockly.Extensions.registerMutator(
  'behavior_get_mutator',
  behaviorGetMutator
);

// Using register instead of registerMixin to avoid triggering warnings about
// overriding built-ins.
GoogleBlockly.Extensions.register(
  'behavior_caller_get_def_mixin',
  behaviorCallerGetDefMixin
);
GoogleBlockly.Extensions.register(
  'behavior_create_def_mixin',
  behaviorCreateDefMixin
);

// Used by createDef_ to create a new definition block for an orphaned call block.
// We need to supply a specific block type used for behavior definitions.
const behaviorCallerGetDefBlockMixin = {
  hasReturn_: false,
  defType_: BLOCK_TYPES.behaviorDefinition,
};
GoogleBlockly.Extensions.registerMixin(
  'behavior_caller_get_def_block_mixin',
  behaviorCallerGetDefBlockMixin
);

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns {import('blockly/core/utils/toolbox').FlyoutDefinition} an array of XML block elements
 */
export function flyoutCategory(
  workspace: GoogleBlockly.WorkspaceSvg,
  functionEditorOpen = false
) {
  const blockList: FlyoutItemInfoArray = [];

  if (functionEditorOpen) {
    // No-op - cannot create new behaviors while the modal editor is open
  } else if (Blockly.useModalFunctionEditor) {
    const newBehaviorButton = getNewBehaviorButtonWithCallback(workspace);
    blockList.push(newBehaviorButton);
  }

  // Add blocks from the level toolbox XML, if present.
  blockList.push(...Blockly.cdoUtils.getCategoryBlocksJson('Behavior'));

  // Workspaces to populate behaviors flyout category from
  const workspaces = [
    Blockly.getMainWorkspace(),
    Blockly.getHiddenDefinitionWorkspace(),
  ];

  const allBehaviors: {
    name: string;
    id: string;
    behaviorId: string | null | undefined;
  }[] = [];
  workspaces.forEach(workspace => {
    const behaviorBlocks = workspace
      .getTopBlocks()
      .filter(topBlock => topBlock.type === BLOCK_TYPES.behaviorDefinition);
    behaviorBlocks.forEach(block =>
      allBehaviors.push({
        name: block.getFieldValue('NAME'),
        id: block.id,
        behaviorId: (block as ProcedureBlock).behaviorId,
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
  workspace: GoogleBlockly.WorkspaceSvg
) => {
  const callbackKey = 'newBehaviorCallback';
  workspace.registerButtonCallback(callbackKey, () => {
    workspace.hideChaff();
    Blockly.functionEditor.newProcedureCallback(BLOCK_TYPES.behaviorDefinition);
  });

  return {
    kind: 'button',
    text: commonI18n.createBlocklyBehavior(),
    callbackKey,
  };
};

// Added as a change listener. If a behavior name changes, we need to update any
// behavior picker blocks that have the old name currently selected.
function onBehaviorDefChange(event: Abstract, block: ExtendedBlockSvg) {
  if (event.type !== Blockly.Events.CHANGE) {
    return;
  }
  const changeEvent = event as BlockChange;
  if (
    block.id === changeEvent.blockId &&
    // Excludes changes to the description field.
    changeEvent.name === 'NAME'
  ) {
    const {oldValue, newValue} = changeEvent;
    updateBehaviorPickerBlocks(oldValue as string, newValue as string);
    if (Blockly.isStartMode) {
      // In start mode, we need up update behavior call blocks to change their behaviorIds.
      // In normal mode the behavior ids are assigned at creation and are static.
      updateBehaviorCallBlocks(oldValue as string, newValue as string);
    }
  }
}

function updateBehaviorCallBlocks(oldValue: string, newValue: string) {
  const behaviorCallBlocks = findAllBlocksOfType(
    BLOCK_TYPES.behaviorGet
  ) as ProcedureBlock[];
  if (behaviorCallBlocks.length) {
    const blocksToUpdate = behaviorCallBlocks.filter(
      block => block.behaviorId === oldValue
    );
    blocksToUpdate.forEach(block => {
      block.behaviorId = newValue;
    });
  }
}

function updateBehaviorPickerBlocks(oldValue: string, newValue: string) {
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

const findAllBlocksOfType = (type: string) => {
  const blocks: GoogleBlockly.Block[] = [];
  Blockly.Workspace.getAll().forEach(workspace =>
    blocks.push(
      ...workspace.getAllBlocks().filter(block => block.type === type)
    )
  );
  return blocks;
};
