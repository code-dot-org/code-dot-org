// Words arriving a few letters at a time, PLAYED.
//
// The typewriter is a counter, a clamp and a substring, and every way of
// getting it wrong looks fine for the first half second: a line one letter
// short for ever, a line that finishes twice, a line that starts again when it
// should not. So this runs one — real files, real generator, real ticks.
//
// IT WRITES `Writing`'S OWN `text`, which is what makes it compose: a Label
// already draws `text`, so it reveals itself without knowing anything changed.
// That is the property most worth pinning, because the alternative design — a
// `shown` property of its own — would have needed every drawing rewritten.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {importStockRule} from '../rules/importStockRule';
import {stockRuleByName} from '../rules/stock';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const LINE = 'Hello there';

const me = () => ({block: {type: 'world_this_actor'}});

/**
 * A world holding one Label that reveals a line.
 *
 * The trait is given with `add trait`, the RUNTIME block, because this is a
 * live actor being placed — `use trait` is a builder row and belongs under
 * `define actor`.
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
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/label'},
            inputs: {
              DO: {
                block: {
                  type: 'world_add_trait',
                  fields: {TRAIT: 'Reveals Text#RevealsTextTrait'},
                  inputs: {ACTOR: me()},
                  next: {
                    block: {
                      type: 'world_set_RevealsText_TheWholeLineProperty',
                      inputs: {
                        ACTOR: me(),
                        VALUE: {block: {type: 'text', fields: {TEXT: LINE}}},
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

const project = () => {
  // The Label brings Writing; the RULE behind the trait has to come too, or
  // `add trait` names something nothing declares and generates nothing at all
  // — which is what this test found the first time it ran.
  const withLabel = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('label')!,
  ).source;
  const imported = importStockRule(
    withLabel,
    stockRuleByName('Reveals Text')!,
  ).source;
  const world = Object.values(imported.files).find(
    file => file.name === 'main.world',
  )!;
  return projectFiles({
    ...imported,
    files: {...imported.files, [world.id]: {...world, contents: WORLD}},
  });
};

/** Compile, tick for `seconds`, and hand back what the assertions need. */
const run = async (seconds: number) => {
  const {world, modules} = await compileProject(project());
  const writing = modules['rules/writing'] as unknown as {TextProperty: never};
  const reveals = modules['rules/reveals'] as unknown as {
    FinishesRevealingEvent: never;
  };
  const actor = [...world.actors][0];
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
  return {world, actor, writing, reveals};
};

describe('a label that reveals its line', () => {
  it('writes Writing’s own text, so a Label reveals itself', async () => {
    const {actor, writing} = await run(0.25);
    const shown = actor.get(writing.TextProperty) as string;

    expect(LINE.startsWith(shown)).toBe(true);
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.length).toBeLessThan(LINE.length);
  });

  it('arrives at the pace it was given', async () => {
    // Twenty letters a second, so half a second reveals about twice what a
    // quarter does. A RATIO rather than an exact count: the substring
    // truncates a fractional letter, so fifteen frames of a sixtieth land
    // either side of five depending on how the arithmetic rounds, and pinning
    // the count would be pinning the rounding.
    const quarter = await run(0.25);
    const half = await run(0.5);
    const lettersIn = (at: Awaited<ReturnType<typeof run>>) =>
      (at.actor.get(at.writing.TextProperty) as string).length;

    expect(lettersIn(quarter)).toBeGreaterThanOrEqual(4);
    expect(lettersIn(half)).toBeGreaterThan(lettersIn(quarter));
  });

  it('ends on the whole line, not one letter short of it', async () => {
    // The clamp. A substring that ran past the end would be harmless; one that
    // stopped short leaves a line missing its last letter for ever.
    const {actor, writing} = await run(3);

    expect(actor.get(writing.TextProperty)).toBe(LINE);
  });

  it('says when it has finished, once', async () => {
    const {world, actor, reveals} = await run(0);
    const heard: unknown[] = [];
    actor.on(reveals.FinishesRevealingEvent, () => heard.push(1));

    for (let frame = 0; frame < 240; frame++) {
      world.tick(1 / 60);
    }

    // Once, not every frame after: `all shown` is what makes the difference,
    // and a counter alone could not say which frame was the one.
    expect(heard).toHaveLength(1);
  });
});
