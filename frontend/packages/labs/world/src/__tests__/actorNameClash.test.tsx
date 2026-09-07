// Two actors that declare the same names, and the claim that they do not
// collide.
//
// A `define block` called `go` on one kind and a `define block` called `go` on
// another are two different things that happen to be spelled alike, and the
// same is true of a `speed` property. What makes them separable is that an own
// member's block type is keyed from the DECLARING FILE and not from its name
// (`memberKey`) — `world_do_ActorsFoo_GoAction` beside
// `world_do_ActorsBar_GoAction` — so both are minted, both are registered, and
// each drawer holds its own.
//
// COMPILED AND RUN, because the failure this is about is one where a palette
// looks right. Two `export const`s of one name in one module, or one
// definition overwriting the other in Blockly's registry, would leave a
// toolbox that reads correctly and a project where one actor has quietly taken
// the other's place. So both kinds are placed and both are asked what they
// know.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../blockly/domainBlocks';
import {projectOwnMetas} from '../blockly/projectModules';
import {PositionProperty} from '../engine';

import {compileProject} from './support/compileProject';

/**
 * A kind with a `speed` and a `go`, both named the same whoever asks.
 *
 * `go` puts the actor at `x = speed`, so what it did and whose `speed` it read
 * are the same observation — if one kind's declaration had replaced the
 * other's, both actors would end up at the same place.
 */
const actorNamed = (name: string, speed: number) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: name},
          next: {
            block: {
              type: 'world_rule_property',
              fields: {
                TYPE: 'number',
                ACCESS: 'writable',
                NAME: 'speed',
                DEFAULT: String(speed),
              },
              next: {
                block: {
                  type: 'world_rule_block',
                  fields: {RETURNS: 'none', DESCRIPTION: 'Go.'},
                  extraState: {parts: [{kind: 'label', text: 'go'}]},
                  inputs: {
                    DO: {
                      block: {
                        type: 'world_set_position',
                        inputs: {
                          ACTOR: {block: {type: 'world_this_actor'}},
                          X: {
                            block: {
                              type: `world_get_Actors${name}_SpeedProperty`,
                              inputs: {
                                ACTOR: {block: {type: 'world_this_actor'}},
                              },
                            },
                          },
                          Y: {block: {type: 'math_number', fields: {NUM: 50}}},
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

/** Places one of each and tells each to do its own `go`. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/foo'},
            inputs: {
              DO: {
                block: {
                  type: 'world_do_ActorsFoo_GoAction',
                  inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                },
              },
            },
            next: {
              block: {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/bar'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_do_ActorsBar_GoAction',
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

const project = {
  'actors/foo.actor': actorNamed('Foo', 11),
  'actors/bar.actor': actorNamed('Bar', 22),
  'worlds/main.world': WORLD,
};

describe('two actors declaring the same names', () => {
  it('each run their own `go`, reading their own `speed`', async () => {
    const {world} = await compileProject(project);
    const at = (name: string) =>
      [...world.actors].find(
        one => (one as unknown as {type?: string}).type === `actors/${name}`,
      );

    // 11 and 22, not 11 twice or 22 twice: each `go` read the `speed` its own
    // file declared. One name winning would put both in one place.
    expect(at('foo')?.get(PositionProperty)).toMatchObject({x: 11});
    expect(at('bar')?.get(PositionProperty)).toMatchObject({x: 22});
  });

  it('mint a block each, in a drawer each', async () => {
    // The palette half of the same claim. The types carry the declaring file,
    // so neither definition overwrites the other in Blockly's registry — which
    // is the failure that would leave a toolbox reading correctly over a
    // project where one actor had taken the other's place.
    const metas = projectOwnMetas({
      'actors/foo.actor': project['actors/foo.actor'],
      'actors/bar.actor': project['actors/bar.actor'],
    });
    const {toolbox, blocks} = buildDomainPalette([], {
      fileKind: 'actor',
      ownProperties: metas,
    });
    const drawer = (name: string) =>
      (toolbox as Array<{name?: string; blocks?: string[]}>).find(
        category => category.name === name,
      )?.blocks;

    expect(drawer('Foo')).toEqual([
      'world_do_ActorsFoo_GoAction',
      'world_set_ActorsFoo_SpeedProperty',
      'world_get_ActorsFoo_SpeedProperty',
    ]);
    expect(drawer('Bar')).toEqual([
      'world_do_ActorsBar_GoAction',
      'world_set_ActorsBar_SpeedProperty',
      'world_get_ActorsBar_SpeedProperty',
    ]);
    // …and six definitions, not three: a type minted twice is a definition
    // silently replaced.
    const minted = blocks.filter(block => /Actors(Foo|Bar)_/.test(block.type));
    expect(new Set(minted.map(block => block.type)).size).toBe(6);
  });

  it('says whose property it was when one is asked of the other', async () => {
    // The hazard that IS real, and pre-existing: a block naming Foo's `speed`
    // takes any actor in its socket, and a Bar has no such property. The
    // engine names the declaring actor rather than sending the reader to look
    // for a `use trait` row that was never the point (`Traited.get`).
    const {world, modules} = await compileProject(project);
    const foosSpeed = modules['actors/foo'].SpeedProperty;
    const bar = [...world.actors].find(
      one => (one as unknown as {type?: string}).type === 'actors/bar',
    )!;

    expect(() => bar.get(foosSpeed as never)).toThrow(/Foo/);
  });
});
