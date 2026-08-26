// A Portrait, end to end.
//
// A picture and a default of invisible. It starts that way on purpose: a
// portrait standing there before anybody has spoken makes its own entrance
// impossible to see, and that default is the whole of what this actor knows
// that a bare `set sprite` does not.
//
// It defines no tweens. It shipped `enters` and `leaves` until the scene that
// wanted them could not name them — a definition is reachable only from its
// own file — and the test that covered them had to build the handler itself to
// have anything to play, which is what testing an unreachable thing looks
// like. The mechanism is covered where it is real: `tweenPlays.test.tsx`.

import {describe, expect, it} from 'vitest';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {OpacityProperty} from '../engine';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

/** A world that places a Portrait, and nothing else. */
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

  it('defines no tween, because nothing outside this file could play one', () => {
    // Recorded as a test because `enters` is the obvious thing to add here and
    // reads as an improvement. A `play tween` names a definition in its OWN
    // workspace, so one written here is reachable only from a handler here —
    // and when the character comes on is the scene's call, not the portrait's.
    expect(stockActorById('portrait')!.contents).not.toContain(
      'world_define_tween',
    );
  });
});
