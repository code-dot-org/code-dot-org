import * as Blockly from 'blockly/core';

import type {BlockDefinition, BlockOptionsList} from '@/blockly/types';

import {
  behaviorsBlockFrame,
  behaviorsNameValidator,
  modalProceduresNoDestroy,
  spritesFromStartAnimations,
} from './extensions';
import fieldLocation from './fields/fieldLocation';
import fieldSpriteDropdown from './fields/fieldSpriteDropdown';
import {
  behaviorCallerGetDefMixin,
  behaviorCallerGetDefBlockMixin,
  behaviorCreateDefMixin,
} from './mixins';
import {behaviorGetMutator /*, behaviorDefMutator*/} from './mutators';

const SPRITE_PROPERTIES: BlockOptionsList = [
  ['size', '"scale"'],
  ['rotation', '"rotation"'],
  ['x position', '"x"'],
  ['y position', '"y"'],
  ['movement direction', '"direction"'],
  ['tint', '"tint"'],
  ['speed', '"speed"'],
];

const DIRECTION_OPTIONS: BlockOptionsList = [
  ['North', '"North"'],
  ['East', '"East"'],
  ['South', '"South"'],
  ['West', '"West"'],
];

const FACE_OPTIONS: BlockOptionsList = [
  ['right', '"right"'],
  ['left', '"left"'],
];

const blocks: BlockDefinition[] = [
  {
    type: 'when_run',
    style: 'setup_blocks',
    tooltip: '',
    helpUrl: '',
    message0: 'when run',
    generator: () => '\n',
    nextStatement: true,
  },
  {
    type: 'gamelab_allSpritesWithAnimation',
    style: 'sprite_blocks',
    tooltip: '',
    helpUrl: '',
    output: 'Sprite',
    message0: '%1',
    args0: [
      {
        type: fieldSpriteDropdown,
        name: 'ANIMATION',
        options: [['', '']],
      },
    ],
    extensions: [spritesFromStartAnimations],
    generator: () => '\n',
  },
  {
    type: 'gamelab_makeNewSpriteAnon',
    style: 'sprite_blocks',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: 'make new %1 sprite at %2',
    args0: [
      {
        type: fieldSpriteDropdown,
        name: 'ANIMATION_NAME',
        options: [['', '']],
      },
      {
        type: 'input_value',
        name: 'LOCATION',
        check: 'Location',
      },
    ],
    extensions: [spritesFromStartAnimations],
    generator: () => '\n',
  },
  {
    type: 'gamelab_location_picker',
    style: 'location_blocks',
    tooltip: '',
    helpUrl: '',
    output: 'Location',
    message0: '%1',
    args0: [
      {
        type: fieldLocation,
        name: 'LOCATION',
        check: 'Location',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_behavior_get',
    style: 'behavior_blocks',
    tooltip: '',
    helpUrl: '/docs/spritelab/spritelab_adding-and-removing-behaviors',
    output: 'Behavior',
    message0: '%1 %2',
    args0: [
      {
        type: 'field_label',
        name: 'NAME',
        check: '%{BKY_UNNAMED_KEY}',
      },
      {
        type: 'input_dummy',
        name: 'TOPROW',
      },
    ],
    extensions: [
      //'procedures_edit_button',
      'procedure_caller_get_def_mixin',
      behaviorCallerGetDefMixin,
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      behaviorCallerGetDefBlockMixin,
      behaviorCreateDefMixin,
    ],
    mutator: behaviorGetMutator,
    generator: () => '\n',
  },
  {
    type: 'behavior_definition',
    style: 'behavior_blocks',
    tooltip: '',
    helpUrl: '/docs/spritelab/codestudio_defining-behaviors',
    output: 'Behavior',
    message0: '%1 %2 %3 %4 %5',
    message1: '%1',
    args0: [
      {
        type: 'field_label',
        name: '_LABEL',
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
        text: 'with: this sprite',
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
    extensions: [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_def_set_no_return_helper',
      //'procedure_def_no_gray_out',
      behaviorsBlockFrame,
      //'procedure_def_mini_toolbox',
      modalProceduresNoDestroy,
      behaviorsNameValidator,
      //'on_behavior_def_change',
    ],
    //mutator: behaviorDefMutator,
    generator: () => '\n',
  },
  {
    type: 'gamelab_addBehaviorSimple',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: 'sprite %1 begins %2',
    args0: [
      {
        type: 'input_value',
        name: 'SPRITE',
        check: 'Sprite',
      },
      {
        type: 'input_value',
        name: 'BEHAVIOR',
        check: 'Behavior',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_getProp',
    style: 'math_blocks',
    tooltip: '',
    message0: '%1 %2',
    output: '',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'PROPERTY',
        type: 'field_dropdown',
        options: SPRITE_PROPERTIES,
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'sprite_parameter_get',
    style: 'sprite_blocks',
    tooltip: '%{BKY_VARIABLES_GET_TOOLTIP}',
    helpUrl: '/docs/spritelab/codestudio_defining-behaviors',
    output: 'Sprite',
    message0: '%1',
    args0: [
      {
        type: 'field_label',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
        text: 'this sprite',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_mirrorSprite',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: '%1 face %2',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'DIRECTION',
        type: 'field_dropdown',
        options: FACE_OPTIONS,
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_moveForward',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    message0: 'move %1 %2 pixels forward',
    nextStatement: true,
    previousStatement: true,
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'DISTANCE',
        type: 'input_value',
        check: 'Number',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_isTouchingEdges',
    style: 'logic_blocks',
    tooltip: '',
    helpUrl: '',
    output: 'Boolean',
    message0: '%1 is touching edges',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_isTouchingSprite',
    style: 'logic_blocks',
    tooltip: '',
    helpUrl: '',
    output: 'Boolean',
    message0: '%1 is touching %2',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'TARGET',
        type: 'input_value',
        check: 'Sprite',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_edgesDisplace',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: 'edges block %1 from moving',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_changePropBy',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: 'change %1 %2 by %3',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'PROPERTY',
        type: 'field_dropdown',
        options: SPRITE_PROPERTIES,
      },
      {
        name: 'VAL',
        type: 'input_value',
        check: 'Number',
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_moveInDirection',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: 'move %1 %2 pixels %3',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'DISTANCE',
        type: 'input_value',
        check: 'Number',
      },
      {
        name: 'DIRECTION',
        type: 'field_dropdown',
        options: DIRECTION_OPTIONS,
      },
    ],
    generator: () => '\n',
  },
  {
    type: 'gamelab_turn',
    style: 'default',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    message0: 'turn %1 %3 %2 degrees',
    args0: [
      {
        name: 'SPRITE',
        type: 'input_value',
        check: 'Sprite',
      },
      {
        name: 'N',
        type: 'input_value',
        check: 'Number',
      },
      {
        name: 'DIRECTION',
        type: 'field_dropdown',
        options: FACE_OPTIONS,
      },
    ],
    generator: () => '\n',
  },
  // This block add a harmless comment to the code
  {
    type: 'gamelab_comment',
    message0: 'comment: %1',
    style: 'comment_blocks',
    tooltip: '',
    helpUrl: '',
    nextStatement: true,
    previousStatement: true,
    args0: [
      {
        name: 'COMMENT',
        check: 'String',
        type: 'field_input',
        text: '',
      },
    ],
    generator: (block: Blockly.Block) =>
      `// ${block.getFieldValue('COMMENT')}\n`,
  },
];

export default blocks;
