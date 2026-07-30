import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {SpriteLab2Behavior2} from '../types';

// The built-in system implementations, as block workspaces — the whole point
// of the prototype is that a student can open these on the Systems tab, read
// them, and change them. Projects without stored behavior2s get these.
//
// Deliberately naive physics (a per-frame gravity nudge, a tolerant standing
// check, no collision resolution): readable over feel-correct. The sealed
// zGameDev solver is the opposite trade; a behavior2 level should not load
// it, or the two gravities fight.

// A minimal serialized block: Blockly fills in the rest on load.
interface BlockNode {
  type: string;
  id: string;
  fields?: {[name: string]: unknown};
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

// platformer: gravity pulls every frame (the setting, negative = downward);
// standing on a platform block stops a fall and allows a space jump; arrows
// set walking speed directly.
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
          block: ifBlock(
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
                'pf_jump',
                keyHeld('pf_space', 'space'),
                setVelocity('pf_jump_set', 'velocityY', num('pf_jump_n', 13))
              )
            ),
            setVelocity(
              'pf_walk_reset',
              'velocityX',
              num('pf_walk_reset_n', 0),
              ifBlock(
                'pf_left',
                keyHeld('pf_left_key', 'left'),
                setVelocity('pf_left_set', 'velocityX', num('pf_left_n', -4)),
                ifBlock(
                  'pf_right',
                  keyHeld('pf_right_key', 'right'),
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
