// What was TYPED, as against what was pressed.
//
// A key is held or it is not, and `a` is `a` whether or not shift is down.
// Typing is a sequence of characters, and shift, a dead key, an IME and a
// paste all make one with no key edge anybody could name — so a Text Input, a
// Text Area and a Dropdown could not be written at all against `presses ⟨key⟩`
// (specs/UI_ACTORS.md).
//
// COMPILED AND RUN, because the claim is about order and about draining: two
// characters typed into one frame arrive as two, in the order they were typed,
// and a frame that has read them does not read them again.

import {describe, expect, it} from 'vitest';

import {compileProject} from './support/compileProject';

const me = () => ({block: {type: 'world_this_actor'}});

/** A Sign that keeps whatever has been typed at it. */
const SIGN = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Sign'},
        next: {
          block: {
            type: 'world_use_trait',
            fields: {TRAIT: 'Input#TakesKeyboardInputTrait'},
            next: {
              block: {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'string',
                  ACCESS: 'writable',
                  NAME: 'typed',
                  DEFAULT: '',
                },
              },
            },
          },
        },
      },
      // `when this actor types ⟨…⟩: set typed to ⟨typed⟩ + ⟨“ what ”⟩`
      {
        type: 'world_on_Input_TypesEvent',
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'world_set_ActorsSign_TypedProperty',
            inputs: {
              ACTOR: me(),
              VALUE: {
                block: {
                  type: 'world_as_text',
                  inputs: {
                    VALUE: {
                      block: {
                        type: 'world_get_ActorsSign_TypedProperty',
                        inputs: {ACTOR: me()},
                      },
                    },
                    ADD: {
                      block: {
                        type: 'world_as_text',
                        inputs: {
                          VALUE: {block: {type: 'world_event_value'}},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
});

const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {type: 'world_add_actor', fields: {ACTOR: 'actors/sign'}},
        },
      },
    ],
  },
});

const project = {
  'actors/sign.actor': SIGN,
  'rules/input.rule': '',
  'worlds/main.world': WORLD,
};

describe('what was typed', () => {
  const play = async () => {
    const {world, modules} = await compileProject({
      ...project,
      'rules/input.rule': (await import('../rules/stock')).stockRuleByName(
        'Input',
      )!.contents,
    });
    const typed = modules['actors/sign'].TypedProperty;
    const sign = [...world.actors][0];
    return {
      world,
      says: () => sign.get(typed as never) as unknown as string,
    };
  };

  it('reaches an actor that takes keyboard input, in order', async () => {
    const {world, says} = await play();

    // Two into one frame: a set would have lost the order, and a repeated
    // character entirely.
    world.addTyped(['H', 'i']);
    world.tick(1 / 60);

    expect(says()).toBe('Hi');
  });

  it('keeps a repeated character, which a set could not', async () => {
    const {world, says} = await play();

    world.addTyped(['a', 'a']);
    world.tick(1 / 60);

    expect(says()).toBe('aa');
  });

  it('is drained by the frame it was typed into', async () => {
    // A key's edge is worked out by comparing two frames; a character has no
    // state to compare — it simply happened. Carried forward it would be typed
    // again on every frame after the one it was meant for.
    const {world, says} = await play();

    world.addTyped(['x']);
    world.tick(1 / 60);
    world.tick(1 / 60);
    world.tick(1 / 60);

    expect(says()).toBe('x');
  });
});
