// A Portrait entering, end to end.
//
// A picture alone would not earn a place on the shelf — `set sprite` is one row
// — but a portrait that cannot come on or go off is not what anybody means by
// one, and entering is the fiddly part. So it ships its own tweens, which makes
// it the plainest example of what a DEFINITION is for: described once in the
// actor's own file, played by name from any handler.
//
// It starts invisible on purpose. A portrait standing there before anybody has
// spoken makes its own entrance impossible to see.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {OpacityProperty} from '../engine';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const me = () => ({block: {type: 'world_this_actor'}});

/** A world that places a Portrait and plays its own `enters` on it. */
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
            fields: {ACTOR: 'actors/portrait'},
          },
        },
      },
    ],
  },
});

const project = () => {
  const imported = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('portrait')!,
  ).source;
  const world = Object.values(imported.files).find(
    file => file.name === 'main.world',
  )!;
  return projectFiles({
    ...imported,
    files: {...imported.files, [world.id]: {...world, contents: WORLD}},
  });
};

describe('a Portrait', () => {
  it('brings its picture with it', () => {
    // A sprite it names and the project does not hold is a dropdown value with
    // no option behind it, and nothing anywhere reports that.
    const {source} = importStockActor(
      WORLD_SCENARIOS.empty.source,
      stockActorById('portrait')!,
    );

    expect(Object.values(source.files).map(file => file.name)).toContain(
      'player.png',
    );
  });

  it('needs no rule at all', () => {
    // A tween is not a rule, and a picture is the foundation's. Anything in
    // `requires` here would be a rule imported for nothing.
    expect(stockActorById('portrait')!.requires).toEqual([]);
  });

  it('starts invisible, so its entrance can be seen', async () => {
    const {world} = await compileProject(project());
    const actor = [...world.actors][0];

    expect(actor.get(OpacityProperty)).toBe(0);
  });

  it('carries `enters` and `leaves` as definitions of its own', () => {
    const portrait = stockActorById('portrait')!;

    expect(portrait.contents).toContain('world_define_tween');
    expect(portrait.contents).toContain('enters');
    expect(portrait.contents).toContain('leaves');
  });

  it('fades in when its own tween is played', async () => {
    // The claim everything else rests on: a definition in an ACTOR's file,
    // played on that actor, actually runs. It has to be played from inside
    // that file, which is the whole point of the scoping — the definition is
    // a `const` in its own module and nothing outside can name it.
    //
    // From an `each frame`, because the foundation raises no "this actor was
    // added" event to hang it on. Playing it every frame restarts it every
    // frame, which is not what a project would write — but one tick in, the
    // portrait has begun to appear, and that is the fact under test.
    const source = importStockActor(
      WORLD_SCENARIOS.empty.source,
      stockActorById('portrait')!,
    ).source;
    const file = Object.values(source.files).find(
      one => one.name === 'portrait.actor',
    )!;
    const held = JSON.parse(file.contents) as {
      blocks: {blocks: Array<Record<string, unknown>>};
    };
    const definition = held.blocks.blocks.find(
      block =>
        block.type === 'world_define_tween' &&
        (block.fields as {NAME?: string} | undefined)?.NAME === 'enters',
    )!;
    held.blocks.blocks.push({
      type: 'world_trait_step',
      x: 20,
      y: 700,
      fields: {PHASE: 'react', NAME: 'appear'},
      inputs: {
        DO: {
          block: {
            type: 'world_play_tween',
            fields: {TWEEN: definition.id},
            inputs: {ACTOR: me()},
          },
        },
      },
    });

    // …and a world to place it in, since the empty scenario places nothing.
    const worldFile = Object.values(source.files).find(
      one => one.name === 'main.world',
    )!;
    const {world} = await compileProject(
      projectFiles({
        ...source,
        files: {
          ...source.files,
          [file.id]: {...file, contents: JSON.stringify(held)},
          [worldFile.id]: {...worldFile, contents: WORLD},
        },
      }),
    );
    const actor = [...world.actors][0];

    expect(actor.get(OpacityProperty)).toBe(0);

    // TWO frames, not one, and the reason is the phase order. Tweens advance
    // in `adjust`; this step runs in `react`, which is after it. So the first
    // frame starts the tween and the second is the first that moves it — which
    // is exactly what a handler starting a tween late in a frame gets.
    world.tick(1 / 60);
    world.tick(1 / 60);

    expect(actor.get(OpacityProperty)).toBeGreaterThan(0);
  });
});
