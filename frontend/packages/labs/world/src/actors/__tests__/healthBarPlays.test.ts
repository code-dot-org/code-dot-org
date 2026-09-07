// The imported Health Bar, PLAYED, pointed at nobody.
//
// A bar is placed before it is wired: `subject` starts empty, and a learner who
// drags one in and reads the instructions has a bar watching nothing for as
// long as that takes. The bar works out `health ÷ most health` once a frame,
// and `health of ⟨nothing⟩` throws — from a step, every frame, forever, with
// nothing on screen saying which block did it.
//
// SO THE GUARD IS THE SUBJECT OF THIS FILE. It was written into the drawing
// when the bar asked the world for itself, moved into the step when the bar
// became a Progress Bar that fills itself in, and was covered by neither: the
// starter wires its bar up before the first tick, so removing the guard
// altogether broke no test. That is what this closes.
//
// The other half — that a wired bar actually empties — is `starterPlays`,
// which reads the fraction as the crawler takes the player apart.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const healthBar = stockActorById('healthBar')!;

/** `add actor ⟨actors/healthBar⟩`, placed and told nothing else. */
const placeBar = {
  type: 'world_add_actor',
  fields: {ACTOR: 'actors/healthBar'},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          X: {block: {type: 'math_number', fields: {NUM: 40}}},
          Y: {block: {type: 'math_number', fields: {NUM: 20}}},
        },
      },
    },
  },
};

/** The empty scenario with a bar imported, placed, and pointed at nobody. */
const unwired = () => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    healthBar,
  ).source;
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  return {
    ...source,
    files: {
      ...source.files,
      [world.id]: {
        ...world,
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_world',
                x: 20,
                y: 20,
                fields: {NAME: 'My World'},
                next: {block: placeBar},
              },
            ],
          },
        }),
      },
    },
  };
};

describe('a Health Bar pointed at nobody', () => {
  it('brings the rules it reads and the rule it IS', async () => {
    // Health for what it reads off its subject, Progress for the fraction it
    // fills to and the colors it fills with. A block from a rule the project
    // does not hold is one the palette never mints, and the file fails to
    // generate with nothing on screen saying why — so the shelf entry has to
    // ask for both (`actors/stock/index`).
    const {modules} = await compileProject(projectFiles(unwired()));

    expect(modules['rules/health']).toBeDefined();
    expect(modules['rules/progress']).toBeDefined();
  });

  it('runs, and draws an empty bar rather than throwing', async () => {
    // Ticked, not merely built: the step is where the division is, so a bar
    // that is going to throw does it on the first frame and not before.
    const {world, modules} = await compileProject(projectFiles(unwired()));
    const fraction = modules['rules/progress'].FractionProperty;

    expect(() => {
      for (let frame = 0; frame < 30; frame++) {
        world.tick(1 / 60);
      }
    }).not.toThrow();

    const bar = [...world.actors][0];
    expect(bar).toBeDefined();
    // EMPTY, not full. `fraction` defaults to 1, so a bar that never ran its
    // step would read as a full bar over an actor that does not exist — which
    // is the wrong picture and the one this used to draw.
    expect(bar.get(fraction as never) as unknown as number).toBe(0);
  });

  it('draws without throwing before anything has ticked', async () => {
    // The thumbnail path: `renderSnapshot` runs the drawing on a world nobody
    // has stepped. The drawing only reads `fraction` now, so there is nothing
    // here to divide — which is the point of having moved the division out.
    const {world} = await compileProject(projectFiles(unwired()));

    expect(() => world.renderSnapshot()).not.toThrow();
  });
});
