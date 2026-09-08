// A Speech Box typing itself out, end to end.
//
// The typewriter is this actor's own — two properties, two blocks, one event
// and one handler on a timer it holds — where it used to be `Reveals Text`, a
// rule of four properties, a step and 40KB of generated workspace that nothing
// but a Speech Box ever elected. What a rule buys is a mechanic several kinds
// share; this was one kind's.
//
// None of that is visible in the file, so this plays it: `say` starts a line,
// the letters arrive at the pace asked for and stop at the end,
// `show all of it` skips, and `finishes revealing` reaches a handler in the
// WORLD exactly once — the half a handler inside the actor would not prove.
//
// NOT a "text box": that means a thing you type INTO everywhere else, and
// `specs/UI_ACTORS.md` reserves "Text field" for the one still waiting on a
// keyboard the world does not own.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const speechBox = stockActorById('speechBox')!;
const LINE = 'The rain had not stopped for three days.';

const me = () => ({block: {type: 'world_this_actor'}});
const anyBox = () => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: 'actors/speechBox'}},
});

/** `say ⟨LINE⟩ on ⟨this actor⟩`, as the placement body says it. */
const say = {
  type: 'world_do_ActorsSpeechBox_SayAction',
  inputs: {ACTOR: me(), VALUE: {block: {type: 'text', fields: {TEXT: LINE}}}},
};

/**
 * A world that places a box, says a line, and counts the cue.
 *
 * The count is a WORLD property, so `finishes revealing` has to cross a file
 * boundary to be seen — the box declares the event, the world names it.
 */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_rule_property',
            fields: {
              TYPE: 'number',
              ACCESS: 'writable',
              NAME: 'cues',
              DEFAULT: '0',
            },
            next: {
              block: {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/speechBox'},
                inputs: {DO: {block: say}},
              },
            },
          },
        },
      },
      {
        type: 'world_on_ActorsSpeechBox_FinishesRevealingEvent',
        x: 520,
        y: 20,
        inputs: {ACTOR: anyBox()},
        next: {
          block: {
            type: 'world_set_WorldsMain_CuesProperty',
            inputs: {
              VALUE: {
                block: {
                  type: 'math_arithmetic',
                  fields: {OP: 'ADD'},
                  inputs: {
                    A: {block: {type: 'world_get_WorldsMain_CuesProperty'}},
                    B: {block: {type: 'math_number', fields: {NUM: 1}}},
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

/** A box placed and left alone, for the default it ships with. */
const QUIET = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        x: 20,
        y: 20,
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/speechBox'},
          },
        },
      },
    ],
  },
});

const project = (world: string) => {
  const withBox = importStockActor(
    WORLD_SCENARIOS.empty.source,
    speechBox,
  ).source;
  const main = Object.values(withBox.files).find(
    file => file.name === 'main.world',
  )!;
  return projectFiles({
    ...withBox,
    files: {...withBox.files, [main.id]: {...main, contents: world}},
  });
};

/** What the box is showing. */
const showing = (world: {actors: Iterable<unknown>}, text: unknown): string =>
  ([...world.actors][0] as {get(p: unknown): unknown}).get(text) as string;

describe('a Speech Box saying a line', () => {
  it('brings the rules it reads: the words, and the clock', async () => {
    // Writing for `text`, which is what a Speech Box draws, and Time for the
    // timer the letters arrive on. A block from a rule the project does not
    // hold is one the palette never mints, and the file fails to generate with
    // nothing on screen saying why — so the shelf entry asks for both.
    const {modules} = await compileProject(project(WORLD));

    expect(modules['actors/label']).toBeDefined();
    expect(modules['rules/time']).toBeDefined();
  });

  it('arrives a few letters at a time, and stops at the end', async () => {
    const {world, modules} = await compileProject(project(WORLD));
    const text = modules['actors/label'].TextProperty;
    const cues = modules['worlds/main'].CuesProperty;

    // Nothing showing before the clock has run: `say` empties `text`, and the
    // first letter waits for the first firing.
    expect(showing(world, text)).toBe('');

    // Half a second at twenty letters a second: some of the line and not all
    // of it. A box that showed the whole thing at once — which is what setting
    // `text` rather than saying it does — fails here.
    for (let frame = 0; frame < 30; frame++) {
      world.tick(1 / 60);
    }
    const part = showing(world, text);
    expect(part.length).toBeGreaterThan(2);
    expect(part.length).toBeLessThan(LINE.length);
    expect(LINE.startsWith(part)).toBe(true);
    expect(world.get(cues as never)).toBe(0);

    // …and the rest of it. Three seconds is well past the two the line takes,
    // so this also says the timer STOPS: one that kept firing would be reading
    // past the end of the line.
    for (let frame = 0; frame < 180; frame++) {
      world.tick(1 / 60);
    }
    expect(showing(world, text)).toBe(LINE);
    // ONCE. The cue is what a scene waits for before it offers the next line,
    // and a timer left running would offer it again every twentieth of a
    // second.
    expect(world.get(cues as never)).toBe(1);
  });

  it('skips to the end when told to, and raises the cue once', async () => {
    // The impatient click. `show all of it` is guarded on the timer still
    // running, so a box that had already finished does not raise the cue a
    // second time — which a scene would show as a line advancing twice.
    const {world, modules} = await compileProject(project(WORLD));
    const text = modules['actors/label'].TextProperty;
    const cues = modules['worlds/main'].CuesProperty;
    const showAll = modules['actors/speechBox'].ShowAllOfItAction;
    const box = [...world.actors][0];

    world.tick(1 / 60);
    box.act(showAll as never);
    world.tick(1 / 60);

    expect(showing(world, text)).toBe(LINE);
    expect(world.get(cues as never)).toBe(1);

    // Told twice, and told again long after it would have finished anyway.
    box.act(showAll as never);
    for (let frame = 0; frame < 180; frame++) {
      world.tick(1 / 60);
    }
    box.act(showAll as never);
    world.tick(1 / 60);
    expect(world.get(cues as never)).toBe(1);
  });

  it('keeps the line it ships with until something is said', async () => {
    // A box dragged onto a map and left alone. `Has a Timer` runs by default
    // and fires on its first frame, so without the box stopping its own timer
    // the first tick would type the default line out of an empty
    // `the whole line` and leave the panel blank.
    const {world, modules} = await compileProject(project(QUIET));
    const text = modules['actors/label'].TextProperty;

    for (let frame = 0; frame < 30; frame++) {
      world.tick(1 / 60);
    }
    expect(showing(world, text)).toBe('Once upon a time…');
  });

  it('is drawn as a paragraph, so a sentence has somewhere to go', () => {
    // The reason `draw paragraph` had to exist first: canvas draws one line
    // and ignores newlines, so before it a box of dialogue was not something
    // this lab could draw at all.
    expect(speechBox.contents).toContain('world_draw_paragraph');
    expect(speechBox.contents).not.toContain('world_draw_text');
  });

  it('is anchored at its top left, so it fills downward as it is read', () => {
    // A centered box would jump about as each line arrived.
    expect(speechBox.contents).toContain('top left');
  });
});
