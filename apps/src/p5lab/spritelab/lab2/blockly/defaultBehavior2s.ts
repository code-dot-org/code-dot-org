import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {SpriteLab2Behavior2} from '../types';

// The built-in system implementations, as block workspaces students open on
// the Systems tab. The physics is deliberately naive — readable over
// feel-correct. A behavior2 level must not load zGameDev, or the two
// gravities fight.

// A minimal serialized block: Blockly fills in the rest on load.
interface BlockNode {
  type: string;
  id: string;
  fields?: {[name: string]: unknown};
  // controls_if's else arm rides serialized mutator state.
  extraState?: {[name: string]: unknown};
  inputs?: {[name: string]: {block: BlockNode}};
  next?: {block: BlockNode};
}

const num = (id: string, value: number): BlockNode => ({
  type: 'math_number',
  id,
  fields: {NUM: value},
});

const keyHeld = (id: string, key: string): BlockNode => ({
  type: 'spritelab2_keyIsHeld',
  id,
  fields: {KEY: key},
});

const setVelocity = (
  id: string,
  axis: 'velocityX' | 'velocityY',
  value: BlockNode,
  next?: BlockNode
): BlockNode => ({
  type: 'spritelab2_setThisSprite',
  id,
  fields: {PROPERTY: axis},
  inputs: {VALUE: {block: value}},
  ...(next ? {next: {block: next}} : {}),
});

const ifBlock = (
  id: string,
  condition: BlockNode,
  then: BlockNode,
  next?: BlockNode
): BlockNode => ({
  type: 'controls_if',
  id,
  inputs: {IF0: {block: condition}, DO0: {block: then}},
  ...(next ? {next: {block: next}} : {}),
});

const ifElseBlock = (
  id: string,
  condition: BlockNode,
  then: BlockNode,
  otherwise: BlockNode,
  next?: BlockNode
): BlockNode => ({
  type: 'controls_if',
  id,
  extraState: {hasElse: true},
  inputs: {
    IF0: {block: condition},
    DO0: {block: then},
    ELSE: {block: otherwise},
  },
  ...(next ? {next: {block: next}} : {}),
});

const getState = (id: string, name: string): BlockNode => ({
  type: 'spritelab2_getStateForThisSprite',
  id,
  fields: {NAME: name},
});

const setState = (
  id: string,
  name: string,
  value: BlockNode,
  next?: BlockNode
): BlockNode => ({
  type: 'spritelab2_setStateForThisSprite',
  id,
  fields: {NAME: name},
  inputs: {VALUE: {block: value}},
  ...(next ? {next: {block: next}} : {}),
});

const notBumping = (id: string, side: 'left' | 'right'): BlockNode => ({
  type: 'logic_negate',
  id,
  inputs: {
    BOOL: {
      block: {
        type: 'spritelab2_bumpingSide',
        id: id + '_b',
        fields: {TYPE: 'walls', SIDE: side},
      },
    },
  },
});

const canWalk = (
  id: string,
  key: string,
  side: 'left' | 'right'
): BlockNode => ({
  type: 'logic_operation',
  id,
  fields: {OP: 'AND'},
  inputs: {
    A: {block: keyHeld(id + '_k', key)},
    B: {block: notBumping(id + '_n', side)},
  },
});

const workspace = (top: BlockNode): WorkspaceSerialization =>
  ({
    blocks: {languageVersion: 0, blocks: [top]},
  } as unknown as WorkspaceSerialization);

const setting = (id: string): BlockNode => ({
  type: 'spritelab2_systemSetting',
  id,
});

// 0 - setting, for the leftward/downward cases.
const negSetting = (id: string): BlockNode => ({
  type: 'math_arithmetic',
  id,
  fields: {OP: 'MINUS'},
  inputs: {A: {block: num(id + '_zero', 0)}, B: {block: setting(id + '_s')}},
});

// platformer: gravity pulls every frame (the setting, negative = down);
// standing stops a fall, reports "landed" once (the airborne state marks
// the fall), and allows a space jump; arrows walk unless bumping a wall.
const platformerSource = workspace({
  type: 'spritelab2_forEachSpriteOfType',
  id: 'pf_loop',
  inputs: {
    DO: {
      block: {
        type: 'spritelab2_changeThisSprite',
        id: 'pf_gravity',
        fields: {PROPERTY: 'velocityY'},
        inputs: {VALUE: {block: setting('pf_gravity_s')}},
        next: {
          block: ifElseBlock(
            'pf_grounded',
            {
              type: 'spritelab2_standingOnType',
              id: 'pf_standing',
              fields: {TYPE: 'walls'},
            },
            ifBlock(
              'pf_land',
              {
                type: 'logic_compare',
                id: 'pf_falling',
                fields: {OP: 'LT'},
                inputs: {
                  A: {
                    block: {
                      type: 'spritelab2_getThisSpriteProp',
                      id: 'pf_vy',
                      fields: {PROPERTY: 'velocityY'},
                    },
                  },
                  B: {block: num('pf_zero', 0)},
                },
              },
              setVelocity('pf_stop', 'velocityY', num('pf_stop_n', 0)),
              ifBlock(
                'pf_landed',
                {
                  type: 'logic_compare',
                  id: 'pf_was_airborne',
                  fields: {OP: 'EQ'},
                  inputs: {
                    A: {block: getState('pf_airborne_get', 'airborne')},
                    B: {block: num('pf_one', 1)},
                  },
                },
                setState('pf_airborne_clear', 'airborne', num('pf_zero2', 0), {
                  type: 'spritelab2_reportForThisSprite',
                  id: 'pf_report',
                  fields: {EVENT: 'landed'},
                }),
                ifBlock(
                  'pf_jump',
                  keyHeld('pf_space', 'space'),
                  setVelocity('pf_jump_set', 'velocityY', num('pf_jump_n', 13))
                )
              )
            ),
            setState('pf_airborne_set', 'airborne', num('pf_one2', 1)),
            setVelocity(
              'pf_walk_reset',
              'velocityX',
              num('pf_walk_reset_n', 0),
              ifBlock(
                'pf_left',
                canWalk('pf_left_can', 'left', 'left'),
                setVelocity('pf_left_set', 'velocityX', num('pf_left_n', -4)),
                ifBlock(
                  'pf_right',
                  canWalk('pf_right_can', 'right', 'right'),
                  setVelocity('pf_right_set', 'velocityX', num('pf_right_n', 4))
                )
              )
            )
          ),
        },
      },
    },
  },
});

// walk: plain four-directional movement; the setting is the speed.
const walkSource = workspace({
  type: 'spritelab2_forEachSpriteOfType',
  id: 'wk_loop',
  inputs: {
    DO: {
      block: setVelocity(
        'wk_reset_x',
        'velocityX',
        num('wk_reset_x_n', 0),
        setVelocity(
          'wk_reset_y',
          'velocityY',
          num('wk_reset_y_n', 0),
          ifBlock(
            'wk_left',
            keyHeld('wk_left_key', 'left'),
            setVelocity('wk_left_set', 'velocityX', negSetting('wk_left_n')),
            ifBlock(
              'wk_right',
              keyHeld('wk_right_key', 'right'),
              setVelocity('wk_right_set', 'velocityX', setting('wk_right_n')),
              ifBlock(
                'wk_up',
                keyHeld('wk_up_key', 'up'),
                setVelocity('wk_up_set', 'velocityY', setting('wk_up_n')),
                ifBlock(
                  'wk_down',
                  keyHeld('wk_down_key', 'down'),
                  setVelocity(
                    'wk_down_set',
                    'velocityY',
                    negSetting('wk_down_n')
                  )
                )
              )
            )
          )
        )
      ),
    },
  },
});

export const DEFAULT_BEHAVIOR2S: SpriteLab2Behavior2[] = [
  {name: 'platformer', source: platformerSource},
  {name: 'walk', source: walkSource},
];

// A new student-created system: the bare loop, ready to fill in.
export function emptySystemSource(): WorkspaceSerialization {
  return workspace({
    type: 'spritelab2_forEachSpriteOfType',
    id: 'loop',
  });
}
