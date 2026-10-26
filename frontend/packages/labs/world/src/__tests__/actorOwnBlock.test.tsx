// A thing an actor DOES, named by the actor's own file — `define block` in an
// `.actor`.
//
// The third declaration a kind may make, after state (`define property`) and
// per-frame work (`each frame`). Until this, naming a piece of behavior meant
// authoring a rule — a trait, an election and a file — when the honest
// motivation was that the same six blocks had been written twice.
//
// COMPILED AND RUN, for the reason the own-property test gives: the
// declaration is an `export const` at module scope, so what can go wrong is
// WHERE it lands rather than what it says, and a codegen assertion would pass
// on a module that throws as it loads.

import {describe, expect, it} from 'vitest';

import {PositionProperty} from '../engine';

import {compileProject} from './support/compileProject';

/** `Ball`, with one thing it knows how to do: put itself in the middle. */
const BALL = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        id: 'ballDef',
        fields: {NAME: 'Ball'},
        next: {
          block: {
            type: 'world_rule_block',
            id: 'serveDef',
            fields: {
              RETURNS: 'none',
              DESCRIPTION: 'Put it back where it started.',
            },
            extraState: {parts: [{kind: 'label', text: 'serve'}]},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {
                    ACTOR: {block: {type: 'world_this_actor'}},
                    X: {block: {type: 'math_number', fields: {NUM: 160}}},
                    Y: {block: {type: 'math_number', fields: {NUM: 96}}},
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

/** A world that places one and tells it to do the thing. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        id: 'worldDef',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            id: 'addBall',
            fields: {ACTOR: 'actors/ball'},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {
                    ACTOR: {block: {type: 'world_this_actor'}},
                    X: {block: {type: 'math_number', fields: {NUM: 8}}},
                    Y: {block: {type: 'math_number', fields: {NUM: 8}}},
                    // …and then the actor's own block, on the actor being
                    // placed. Called from ANOTHER file, which is the half that
                    // needs an export and an import.
                  },
                  next: {
                    block: {
                      type: 'world_do_ActorsBall_ServeAction',
                      inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
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

describe('an actor’s own block', () => {
  it('runs where it is called, on the actor it is called for', async () => {
    const {world} = await compileProject({
      'actors/ball.actor': BALL,
      'worlds/main.world': WORLD,
    });

    const ball = [...world.actors][0];

    expect(ball, 'the world placed one').toBeDefined();
    // Placed at (8, 8) and then served, so the serve is what ran last.
    expect(ball.get(PositionProperty)).toMatchObject({x: 160, y: 96});
  });
});

/** A parameter, and one of the actor's own blocks calling another. */
const KICKER = JSON.stringify({
  // A designed parameter IS a workspace variable; the mutator saves its id, and
  // both the closure's signature and the getters in the body resolve it here.
  variables: [{id: 'howFarVar', name: 'how far', type: 'Number'}],
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        id: 'ballDef',
        fields: {NAME: 'Ball'},
        next: {
          block: {
            type: 'world_rule_block',
            id: 'kickDef',
            fields: {RETURNS: 'none', DESCRIPTION: 'Send it along the floor.'},
            extraState: {
              parts: [
                {kind: 'label', text: 'kick'},
                {kind: 'param', var: 'howFarVar', type: 'number'},
              ],
            },
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {
                    ACTOR: {block: {type: 'world_this_actor'}},
                    X: {
                      block: {
                        type: 'variables_get_Number',
                        fields: {
                          VAR: {
                            id: 'howFarVar',
                            name: 'how far',
                            type: 'Number',
                          },
                        },
                      },
                    },
                    Y: {block: {type: 'math_number', fields: {NUM: 96}}},
                  },
                },
              },
            },
            next: {
              block: {
                type: 'world_rule_block',
                id: 'serveDef',
                fields: {RETURNS: 'none', DESCRIPTION: 'Kick it a long way.'},
                extraState: {parts: [{kind: 'label', text: 'serve'}]},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_do_ActorsBall_KickAction',
                      inputs: {
                        VALUE: {
                          block: {type: 'math_number', fields: {NUM: 160}},
                        },
                        ACTOR: {block: {type: 'world_this_actor'}},
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

describe('one of an actor’s own blocks calling another', () => {
  it('passes its argument, and names the sibling without importing itself', async () => {
    // The self-import trap: a call site resolves a member by importing the
    // module that exports it, and a block calling its own file's would import
    // the file being written — which esbuild refuses as a duplicate symbol.
    // `__ruleModule` is what stops it, and it is set for `.actor` files
    // because their own properties needed the same thing.
    const {world} = await compileProject({
      'actors/ball.actor': KICKER,
      'worlds/main.world': WORLD,
    });

    const ball = [...world.actors][0];

    expect(ball.get(PositionProperty)).toMatchObject({x: 160, y: 96});
  });
});
