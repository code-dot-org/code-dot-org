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
import {KEY_REPEAT_DELAY, KEY_REPEAT_INTERVAL} from '../../engine/core/keys';
import {RotationProperty, type Actor, type Property} from '../../engine';
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
const WORDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const project = (
  canRemove = true,
  boxHeight?: number,
  words: readonly string[] = WORDS,
): MultiFileSource => {
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
                      ...(boxHeight === undefined
                        ? []
                        : [
                            {
                              type: 'world_set_Boxed_HeightProperty',
                              inputs: {
                                ACTOR: me(),
                                VALUE: number(boxHeight),
                              },
                            },
                          ]),
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
                              extraState: {itemCount: words.length},
                              inputs: Object.fromEntries(
                                words.map((word, at) => [
                                  `ADD${at}`,
                                  {
                                    block: {
                                      type: 'text',
                                      fields: {TEXT: word},
                                    },
                                  },
                                ]),
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
  const open = async (
    options: {
      canRemove?: boolean;
      boxHeight?: number;
      words?: readonly string[];
    } = {},
  ) => {
    const {world, modules} = await compileProject(
      projectFiles(
        project(options.canRemove ?? true, options.boxHeight, options.words),
      ),
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
      /** Turn the list, as the map editor's rotate handle does. */
      turn: (degrees: number) => {
        list.set(RotationProperty, degrees);
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
      /** Turn the wheel over wherever the pointer is, in pixels. */
      wheel: (by: number) => {
        world.scrollWheel(by);
        world.tick(1 / 60);
      },
      /** Whether the game asked the page to leave the wheel alone. */
      takesWheel: () => world.wantsWheel(),
      /** Hold `key` down for `seconds`, at sixty frames a second. */
      hold: (key: string, seconds: number) => {
        for (let at = 0; at < seconds; at += 1 / 60) {
          world.setInput([key]);
          world.tick(1 / 60);
        }
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

  it('scrolls with the WHEEL, and not past the end', async () => {
    // The drag said another way: both are a distance in pixels, and both are
    // clamped to the ends. Eight rows of 24 in a box of 144 is 48 of overflow.
    const l = await open();
    l.point(100, 100, false);
    expect(l.scrolled()).toBe(0);

    l.wheel(20);
    expect(l.scrolled()).toBe(20);

    l.wheel(100);
    expect(l.scrolled()).toBe(48);

    // …and back up, which is the same clamp at the other end.
    l.wheel(-500);
    expect(l.scrolled()).toBe(0);
  }, 60000);

  it('takes the wheel from the page only while the pointer is over it', async () => {
    // A canvas that swallowed every wheel would trap the page's scroll under a
    // game with nothing to scroll (`World.useWheel`).
    const l = await open();
    l.point(100, 100, false);
    expect(l.takesWheel()).toBe(true);

    // Well away from the list.
    l.point(900, 900, false);
    expect(l.takesWheel()).toBe(false);
  }, 60000);

  it('does not scroll when the wheel turns somewhere else', async () => {
    const l = await open();
    l.point(900, 900, false);

    l.wheel(40);

    expect(l.scrolled()).toBe(0);
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

  it('picks a row by the list’s OWN down, not the screen’s', async () => {
    // A LIST THAT HAS BEEN TURNED IS STILL A LIST. Measuring the pointer's
    // plain `y` against the box's plain top asks how far down the SCREEN a
    // click was, which is the row only while the list is upright: on its side
    // every click picks from the wrong axis, and upside down the rows run
    // backwards.
    //
    // Third of its kind. The hit test had it (`rules/pointing`, `under`), the
    // Slider's drag had it (`alongX`), and this is the same question a third
    // time: where is the pointer relative to THIS thing.
    const l = await open();
    l.turn(90);

    // Turned a quarter, the list's own "down" points to the screen's LEFT —
    // a rotation takes local +y to (−sin, cos), which at ninety degrees is
    // (−1, 0). So the rows run right to left, row one at the right-hand end.
    //
    // Upright, the click that picks row three is twenty ABOVE the middle
    // (row three's band is 48 to 72 down a 144-tall box). Twenty up the
    // list's own length is now twenty to the screen's RIGHT: (120, 100).
    l.point(120, 100, true);
    l.point(120, 100, false);

    expect(l.onRow()).toBe(3);
    expect(l.said()).toBe('C3');
  }, 60000);

  it('runs its rows the right way up when it is upside down', async () => {
    // Half a turn makes the cosine negative, so the list's own down is the
    // screen's up — and the row under a click follows the thing on screen
    // rather than the axis it was authored on.
    const l = await open();
    l.turn(180);

    l.point(100, 120, true);
    l.point(100, 120, false);

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

  it('shows a TALLER box’s worth, not the default box’s', async () => {
    // THE WINDOW COMES FROM THE BOX. `ROWS` is what the default box holds, and
    // the window was written with it as though every List were that size — so
    // a List given a taller box scrolled through every row but drew six of
    // them. Notes' list is 320 tall, showed seven, and looked as though it had
    // stopped taking new notes.
    //
    // A page key moves by a windowful, which is the observable half of the
    // same expression: eight rows in a box tall enough for thirteen means one
    // page down lands on the last of them, where the default box lands on the
    // seventh (the test above).
    // Thirty rows, so nothing clamps: a box 320 tall holds thirteen, and the
    // page key must move by thirteen rather than by the default box's six.
    const l = await open({
      boxHeight: 320,
      words: Array.from({length: 30}, (_, at) => `row ${at + 1}`),
    });
    l.point(100, 40, true);
    l.point(100, 40, false);
    const from = l.onRow();

    l.press('page down');

    expect(l.onRow() - from).toBe(13);
  }, 60000);

  it('keeps walking while the arrow is HELD, not once per press', async () => {
    // A key held raises `presses` exactly once, so a hat on the press alone
    // moves one row however long the key is down. Holding an arrow should walk
    // the list, which is what the keyboard's own repeat does everywhere else
    // (`World.repeatingKeys`).
    const l = await open({
      words: Array.from({length: 30}, (_, at) => `row ${at + 1}`),
    });
    l.point(100, 40, true);
    l.point(100, 40, false);
    const from = l.onRow();

    // Long enough for the delay and several repeats.
    l.hold('down arrow', KEY_REPEAT_DELAY + KEY_REPEAT_INTERVAL * 5);

    expect(l.onRow()).toBeGreaterThan(from + 1);
  }, 60000);

  it('moves one row for a TAP, however the repeat is set', async () => {
    // The other half, and the one a repeat must not break: a tap is one row.
    const l = await open();
    l.point(100, 40, true);
    l.point(100, 40, false);
    const from = l.onRow();

    l.press('down arrow');

    expect(l.onRow()).toBe(from + 1);
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
