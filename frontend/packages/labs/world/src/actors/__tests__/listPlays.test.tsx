// The List, played: a drag scrolls it, a click chooses a row, and the keys do
// both without a pointer (specs/LIST_PLAN.md).
//
// The drag is the half that could not exist before the Gestures rule, and the
// keyboard is the half that makes it usable by somebody who has no pointer at
// all — so both are driven here the way a person would drive them, through
// `setPointer` and through the key the world reads.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {type Actor, type Property} from '../../engine';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});
const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const chain = (rows: object[]) =>
  rows.reduceRight((next, row) => ({...row, next: {block: next}}));

/** A List at (100, 100) holding eight words, and a Label it writes into. */
const project = (canRemove = true): MultiFileSource => {
  let source = WORLD_SCENARIOS.empty.source;
  source = importStockActor(source, stockActorById('list')!).source;
  source = importStockActor(source, stockActorById('label')!).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const world = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Menu'},
          next: {
            block: chain([
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/list'},
                inputs: {
                  DO: {
                    block: chain([
                      {
                        type: 'world_set_position',
                        inputs: {ACTOR: me(), X: number(100), Y: number(100)},
                      },
                      {
                        type: 'world_set_ActorsList_CanRemoveProperty',
                        inputs: {
                          ACTOR: me(),
                          VALUE: {
                            block: {
                              type: 'logic_boolean',
                              fields: {BOOL: canRemove ? 'TRUE' : 'FALSE'},
                            },
                          },
                        },
                      },
                      {
                        type: 'world_set_ActorsList_ItemsProperty',
                        inputs: {
                          ACTOR: me(),
                          VALUE: {
                            block: {
                              type: 'lists_create_with',
                              extraState: {itemCount: 8},
                              inputs: Object.fromEntries(
                                ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(
                                  (word, at) => [
                                    `ADD${at}`,
                                    {
                                      block: {
                                        type: 'text',
                                        fields: {TEXT: word},
                                      },
                                    },
                                  ],
                                ),
                              ),
                            },
                          },
                        },
                      },
                    ]),
                  },
                },
              },
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/label'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_position',
                      inputs: {ACTOR: me(), X: number(100), Y: number(260)},
                    },
                  },
                },
              },
            ]),
          },
        },
        // What was chosen, written where a test can read it: the event carries
        // the word AND where it was, which is the first shipped use of an
        // event carrying two named values (specs/EVENT_VALUES_PLAN.md).
        {
          type: 'world_on_ActorsList_IsChosenAtEvent',
          inputs: {ACTOR: kind('actors/list')},
          next: {
            block: {
              type: 'world_set_ActorsLabel_TextProperty',
              inputs: {
                ACTOR: kind('actors/label'),
                // `⟨word⟩ + ⟨as text ⟨place⟩⟩` — a chain, which is what this
                // lab has instead of a join with a mutator.
                VALUE: {
                  block: {
                    type: 'world_as_text',
                    inputs: {
                      VALUE: {
                        block: {
                          type: 'variables_get_String',
                          fields: {VAR: {id: 'listWord', name: 'word'}},
                        },
                      },
                      ADD: {
                        block: {
                          type: 'world_as_text',
                          inputs: {
                            VALUE: {
                              block: {
                                type: 'variables_get_Number',
                                fields: {VAR: {id: 'listPlace', name: 'place'}},
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
          },
        },
      ],
    },
    variables: [
      {id: 'listWord', name: 'word', type: 'String'},
      {id: 'listPlace', name: 'place', type: 'Number'},
    ],
  });
  return {
    ...source,
    files: {...source.files, [main.id]: {...main, contents: world}},
  };
};

describe('a List', () => {
  const open = async (options: {canRemove?: boolean} = {}) => {
    const {world, modules} = await compileProject(
      projectFiles(project(options.canRemove ?? true)),
    );
    const actors = [...world.actors] as Actor[];
    const list = actors.find(actor => actor.type === 'actors/list')!;
    const label = actors.find(actor => actor.type === 'actors/label')!;
    const scroll = modules['actors/list'].ScrollProperty as Property<number>;
    const rows = modules['actors/list'].ItemsProperty as Property<string[]>;
    const highlighted = modules['actors/list']
      .HighlightedProperty as Property<number>;
    const text = modules['actors/label'].TextProperty as Property<string>;
    world.tick(1 / 60);
    return {
      world,
      list,
      scrolled: () => list.get(scroll),
      rows: () => list.get(rows),
      onRow: () => list.get(highlighted),
      said: () => label.get(text),
      /** Put the pointer here, with the button in this state, and tick. */
      point: (x: number, y: number, down: boolean) => {
        world.setPointer({x, y}, down ? ['left'] : []);
        world.tick(1 / 60);
      },
      /** A tap of a key, by the world's own name for it (`engine/core/keys`). */
      press: (key: string) => {
        world.setInput([key]);
        world.tick(1 / 60);
        world.setInput([]);
        world.tick(1 / 60);
        world.tick(1 / 60);
      },
    };
  };

  it('scrolls when the finger drags it, and not past the end', async () => {
    const l = await open();
    expect(l.scrolled()).toBe(0);

    // Eight rows of 24 in a box of 144: 48 pixels of overflow, no more.
    l.point(100, 100, true);
    l.point(100, 60, true);
    expect(l.scrolled()).toBeCloseTo(40, 5);

    l.point(100, 0, true);
    expect(l.scrolled()).toBe(48);
  }, 60000);

  it('will not scroll above the top', async () => {
    const l = await open();

    l.point(100, 100, true);
    l.point(100, 160, true);

    expect(l.scrolled()).toBe(0);
  }, 60000);

  it('chooses the row a click landed on, and says which it was', async () => {
    const l = await open();

    // The box is 144 tall, centred at 100, so its top edge is at 28. The
    // third row runs from 76 to 100.
    l.point(100, 80, true);
    l.point(100, 80, false);

    expect(l.onRow()).toBe(3);
    expect(l.said()).toBe('C3');
  }, 60000);

  it('moves the highlight with the arrows, with no pointer at all', async () => {
    const l = await open();
    // The keyboard has to be on it, which a click is one way to arrange.
    l.point(100, 40, true);
    l.point(100, 40, false);
    expect(l.onRow()).toBe(1);

    l.press('down arrow');
    l.press('down arrow');

    expect(l.onRow()).toBe(3);
  }, 60000);

  it('drags the window along when the highlight leaves it', async () => {
    // The part a list has that a dropdown does not: the highlight can walk
    // out of the window, and the window has to follow it.
    const l = await open();
    l.point(100, 40, true);
    l.point(100, 40, false);

    for (let press = 0; press < 7; press++) {
      l.press('down arrow');
    }

    expect(l.onRow()).toBe(8);
    // Row eight ends at 192, and the box is 144 tall: the window is at 48.
    expect(l.scrolled()).toBe(48);
  }, 60000);

  it('moves by a boxful on the page keys', async () => {
    const l = await open();
    l.point(100, 40, true);
    l.point(100, 40, false);

    l.press('page down');

    expect(l.onRow()).toBe(7);
  }, 60000);

  it('loses a row to a sideways swipe, and says which it was', async () => {
    // The phone idiom, and the first thing in the lab to use the swipe event.
    const l = await open();

    // A press on the third row, flicked sideways and let go: far enough and
    // quick enough to be a swipe (`rules/gestures`).
    l.point(100, 80, true);
    l.point(220, 82, true);
    l.point(220, 82, false);

    expect(l.said()).toBe('C3');
    expect(l.rows()).toEqual(['A', 'B', 'D', 'E', 'F', 'G', 'H']);
  }, 60000);

  it('loses the highlighted row to Delete, with no pointer', async () => {
    const l = await open();
    l.point(100, 40, true);
    l.point(100, 40, false);
    l.press('down arrow');

    l.press('delete');

    expect(l.rows()).toEqual(['A', 'C', 'D', 'E', 'F', 'G', 'H']);
  }, 60000);

  it('will not lose a row when a project has not allowed it', async () => {
    // A list of answers to choose between is not one a player should be able
    // to empty, so this is off unless somebody says otherwise.
    const l = await open({canRemove: false});
    l.point(100, 40, true);
    l.point(100, 40, false);

    l.press('delete');

    expect(l.rows()).toHaveLength(8);
  }, 60000);

  it('chooses the highlighted row on Enter', async () => {
    const l = await open();
    l.point(100, 40, true);
    l.point(100, 40, false);
    l.press('down arrow');

    l.press('enter');

    expect(l.said()).toBe('B2');
  }, 60000);
});
