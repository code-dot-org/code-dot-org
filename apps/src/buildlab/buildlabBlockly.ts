import type * as BlocklyCore from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

import {Renderers} from '@cdo/apps/blockly/constants';
import CdoTheme from '@cdo/apps/blockly/themes/cdoTheme';

import {
  normalizeBuildlabFieldValue,
  normalizeBuildlabWorkspaceState,
  type BuildlabBlockState,
  type BuildlabWorkspaceState,
} from './blocklyTypes';

const cdoJavaScriptGenerator = () => Blockly.JavaScript;

export const CDO_BLOCKLY_THEME = CdoTheme;
export const CDO_RENDERER = Renderers.THRASOS;

export const BUILD_LAB_BLOCK_DEFINITIONS = [
  {
    type: 'buildlab_when_run',
    message0: 'when project starts',
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: 'Runs once when the project starts.',
  },
  {
    type: 'buildlab_on_click',
    message0: 'when %1 clicked',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['button1', 'button1']],
      },
    ],
    nextStatement: null,
    style: 'event_blocks',
    tooltip: 'Runs when a stage element is clicked.',
  },
  {
    type: 'buildlab_set_text',
    message0: 'set %1 text to %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['label1', 'label1']],
      },
      {type: 'field_input', name: 'TEXT', text: 'Hello!'},
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'Changes an element label.',
  },
  {
    type: 'buildlab_show_screen',
    message0: 'show screen %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SCREEN',
        options: [['Screen 1', 'screen1']],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'Shows another screen on the stage.',
  },
  {
    type: 'buildlab_set_position',
    message0: 'set %1 position x %2 y %3',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['label1', 'label1']],
      },
      {type: 'field_number', name: 'X', value: 200},
      {type: 'field_number', name: 'Y', value: 200},
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'Moves an element on the stage.',
  },
  {
    type: 'buildlab_set_visible',
    message0: 'set %1 to %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ELEMENT',
        options: [['label1', 'label1']],
      },
      {
        type: 'field_dropdown',
        name: 'VISIBLE',
        options: [
          ['showing', 'true'],
          ['hidden', 'false'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'Shows or hides an element.',
  },
  {
    type: 'buildlab_move_with_arrow_keys',
    message0: 'make %1 move with arrow keys at speed %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SPRITE',
        options: [['sprite1', 'sprite1']],
      },
      {type: 'field_number', name: 'SPEED', value: 5, min: 1, max: 20},
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'behavior_blocks',
    tooltip: 'Moves a sprite while an arrow key is held.',
  },
  {
    type: 'buildlab_predict_model',
    message0: 'predict with %1 and show result in %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'MODEL',
        options: [['No models imported', '']],
      },
      {
        type: 'field_dropdown',
        name: 'RESULT',
        options: [['label1', 'label1']],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'behavior_blocks',
    tooltip: 'Runs an imported model and puts its prediction in an element.',
  },
  {
    type: 'buildlab_generate_text',
    message0: 'ask AI %1 and show response in %2',
    args0: [
      {
        type: 'field_input',
        name: 'PROMPT',
        text: 'Write a friendly greeting',
      },
      {
        type: 'field_dropdown',
        name: 'RESULT',
        options: [['label1', 'label1']],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'ai_blocks',
    tooltip: 'Generates text and puts the response in an element.',
  },
  {
    type: 'buildlab_create_sprite',
    message0: 'create %1 sprite at x %2 y %3',
    args0: [
      {
        type: 'field_dropdown',
        name: 'ASSET',
        options: [['bear', 'bear']],
      },
      {type: 'field_number', name: 'X', value: 200},
      {type: 'field_number', name: 'Y', value: 200},
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'sprite_blocks',
    tooltip: 'Adds a sprite to the stage.',
  },
];

export const BUILD_LAB_TOOLBOX: BlocklyCore.utils.toolbox.ToolboxInfo = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Stage',
      colour: '#5578d4',
      contents: [
        {kind: 'block', type: 'buildlab_when_run'},
        {kind: 'block', type: 'buildlab_create_sprite'},
      ],
    },
    {
      kind: 'category',
      name: 'Elements',
      colour: '#8c52c7',
      contents: [
        {kind: 'block', type: 'buildlab_set_text'},
        {kind: 'block', type: 'buildlab_show_screen'},
        {kind: 'block', type: 'buildlab_set_position'},
        {kind: 'block', type: 'buildlab_set_visible'},
      ],
    },
    {
      kind: 'category',
      name: 'Behaviors',
      colour: '#e08528',
      contents: [
        {kind: 'block', type: 'buildlab_move_with_arrow_keys'},
        {kind: 'block', type: 'buildlab_predict_model'},
      ],
    },
    {
      kind: 'category',
      name: 'AI',
      colour: '#6f5bd3',
      contents: [{kind: 'block', type: 'buildlab_generate_text'}],
    },
    {
      kind: 'category',
      name: 'Events',
      colour: '#d45c3a',
      contents: [{kind: 'block', type: 'buildlab_on_click'}],
    },
  ],
};

const HAT_BLOCK_TYPES = new Set(['buildlab_when_run', 'buildlab_on_click']);

function quote(value: unknown) {
  return JSON.stringify(String(value));
}

function nextCode(
  block: BlocklyCore.Block,
  generator: typeof javascriptGenerator
): string {
  const generated = generator.blockToCode(block.getNextBlock());
  return Array.isArray(generated) ? generated[0] : generated;
}

function registerGenerators() {
  const generator = cdoJavaScriptGenerator();
  generator.forBlock.buildlab_when_run = (block, blockGenerator) =>
    `engine.onStart(function () {\n${nextCode(block, blockGenerator)}});\n`;

  generator.forBlock.buildlab_on_click = (block, blockGenerator) =>
    `engine.onClick(${quote(
      block.getFieldValue('ELEMENT')
    )}, function () {\n${nextCode(block, blockGenerator)}});\n`;

  generator.forBlock.buildlab_set_text = block =>
    `engine.setText(${quote(block.getFieldValue('ELEMENT'))}, ${quote(
      block.getFieldValue('TEXT')
    )});\n`;

  generator.forBlock.buildlab_show_screen = block =>
    `engine.showScreen(${quote(block.getFieldValue('SCREEN'))});\n`;

  generator.forBlock.buildlab_set_position = block =>
    `engine.setPosition(${quote(block.getFieldValue('ELEMENT'))}, ${quote(
      block.getFieldValue('X')
    )}, ${quote(block.getFieldValue('Y'))});\n`;

  generator.forBlock.buildlab_set_visible = block =>
    `engine.setVisible(${quote(block.getFieldValue('ELEMENT'))}, ${quote(
      block.getFieldValue('VISIBLE')
    )});\n`;

  generator.forBlock.buildlab_move_with_arrow_keys = block =>
    `engine.enableArrowMovement(${quote(
      block.getFieldValue('SPRITE')
    )}, ${quote(block.getFieldValue('SPEED'))});\n`;

  generator.forBlock.buildlab_predict_model = block =>
    `engine.predictModel(${quote(block.getFieldValue('MODEL'))}, ${quote(
      block.getFieldValue('RESULT')
    )});\n`;

  generator.forBlock.buildlab_generate_text = block =>
    `engine.generateText(${quote(block.getFieldValue('PROMPT'))}, ${quote(
      block.getFieldValue('RESULT')
    )});\n`;

  generator.forBlock.buildlab_create_sprite = block =>
    `engine.createSprite(${quote(block.id)}, ${quote(
      block.getFieldValue('ASSET')
    )}, ${quote(block.getFieldValue('X'))}, ${quote(
      block.getFieldValue('Y')
    )});\n`;
}

let isSetup = false;

export function setupBuildLabBlocklyEnvironment() {
  if (isSetup) {
    return;
  }

  // The Lab2 page loads the shared CDO Blockly wrapper before this chunk. Use
  // that global instance so the renderer, fields, serializers, and locale all
  // belong to the same Blockly registry.
  const missingDefinitions = BUILD_LAB_BLOCK_DEFINITIONS.filter(
    definition => !Blockly.Blocks[definition.type]
  );
  if (missingDefinitions.length) {
    Blockly.common.defineBlocksWithJsonArray(missingDefinitions);
  }

  const generator = cdoJavaScriptGenerator();
  const defaultScrub = generator.scrub_.bind(generator);
  generator.scrub_ = (block, code, thisOnly) =>
    HAT_BLOCK_TYPES.has(block.type)
      ? code
      : defaultScrub(block, code, thisOnly);

  registerGenerators();
  isSetup = true;
}

export function compileBuildLabWorkspace(
  workspaceState: BuildlabWorkspaceState
): string {
  setupBuildLabBlocklyEnvironment();
  const normalizedWorkspaceState =
    normalizeBuildlabWorkspaceState(workspaceState);
  const workspace = new Blockly.Workspace();
  try {
    Blockly.serialization.workspaces.load(normalizedWorkspaceState, workspace);
    restoreSerializedDropdownValues(workspace, normalizedWorkspaceState);
    return cdoJavaScriptGenerator().workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
}

function restoreSerializedDropdownValues(
  workspace: BlocklyCore.Workspace,
  workspaceState: BuildlabWorkspaceState
) {
  const restoreBlockFields = (blockState: BuildlabBlockState) => {
    const block = workspace.getBlockById(blockState.id);
    if (block) {
      Object.entries(blockState.fields ?? {}).forEach(([fieldName, value]) => {
        const field = block.getField(fieldName);
        if (!(field instanceof Blockly.blockly_.FieldDropdown)) {
          return;
        }

        const expectedValue = String(normalizeBuildlabFieldValue(value));
        const options = field.getOptions();
        if (!options.some(([, optionValue]) => optionValue === expectedValue)) {
          field.setOptions([
            [`Missing: ${expectedValue}`, expectedValue],
            ...options,
          ]);
        }
        field.setValue(expectedValue);
      });
    }

    if (blockState.next?.block) {
      restoreBlockFields(blockState.next.block);
    }
  };

  workspaceState.blocks.blocks.forEach(restoreBlockFields);
}

export type {BuildlabBlockState, BuildlabWorkspaceState};
