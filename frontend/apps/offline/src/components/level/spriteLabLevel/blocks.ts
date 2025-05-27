import type {BlockDefinition} from '@/components/blockly/types';

import {
  behaviorCallerGetDefMixin,
  behaviorCallerGetDefBlockMixin,
  behaviorCreateDefMixin,
} from './mixins';
import {behaviorGetMutator} from './mutators';

const spriteList = [
  [
    {
      src: 'https://studio.code.org/api/v1/animation-library/level_animations/aO_f11FfLOnQYDf5HoJI.wGnbJQDg6g_/tumbleweed2.png',
      width: 32,
      height: 32,
    },
    '"tumbleweed"',
  ],
];

const SPRITE_PROPERTIES = [
  ['size', '"scale"'],
  ['rotation', '"rotation"'],
  ['x position', '"x"'],
  ['y position', '"y"'],
  ['movement direction', '"direction"'],
  ['tint', '"tint"'],
  ['speed', '"speed"'],
];

const DIRECTION_OPTIONS = [
  ['North', '"North"'],
  ['East', '"East"'],
  ['South', '"South"'],
  ['West', '"West"'],
];

const FACE_OPTIONS = [
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
        type: 'field_dropdown',
        name: 'SPRITE',
        options: spriteList,
      },
    ],
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
        type: 'field_dropdown',
        name: 'ANIMATION_NAME',
        options: spriteList,
      },
      {
        type: 'input_value',
        name: 'LOCATION',
        check: 'Location',
      },
    ],
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
        type: 'field_location',
        name: 'LOCATION',
        check: 'Location',
      },
    ],
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
  },
  {
    type: 'gamelab_getProp',
    style: 'math_blocks',
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
  },
];

export default blocks;
