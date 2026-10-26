// A data-shaped actor plays as its block-shaped self (specs/ACTOR_EDITOR_PLAN.md,
// step 2): every scenario, built once as it ships and once with each of its
// actors folded into data, runs the same second of game.

import {describe, expect, it, vi} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {PositionProperty} from '../../engine';
import {
  SCENARIOS_AS_WRITTEN as WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {asActorData} from '../actorData';

/**
 * Where everything is after a second, by name, in a stable order. The same
 * random numbers each time, since some games scatter their pieces with them.
 */
async function aSecondOf(files: Record<string, string>): Promise<string[]> {
  let seed = 1;
  const random = vi.spyOn(Math, 'random').mockImplementation(() => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  });
  const {world} = await compileProject(files);
  // …counted from here: Blockly draws ids from the same source while it
  // compiles, and the two shapes are different blocks to give ids to.
  seed = 1;
  for (let frame = 0; frame < 60; frame++) {
    world.tick(1 / 60);
  }
  const placed = [...world.actors]
    .map(actor => {
      const at = actor.get(PositionProperty);
      return `${actor.name} ${at.x.toFixed(3)},${at.y.toFixed(3)}`;
    })
    .sort();
  random.mockRestore();
  return placed;
}

describe.each(WORLD_SCENARIO_TAGS)('the %s scenario in the data shape', tag => {
  it('plays the same second as it ships', async () => {
    const files = projectFiles(WORLD_SCENARIOS[tag].source);
    const folded = Object.fromEntries(
      Object.entries(files).map(([path, contents]) => [
        path,
        path.endsWith('.actor') ? asActorData(contents) : contents,
      ]),
    );
    expect(
      Object.entries(folded).filter(
        ([path, contents]) =>
          path.endsWith('.actor') && JSON.parse(contents).type !== 'actor',
      ),
    ).toEqual([]);

    expect(await aSecondOf(folded)).toEqual(await aSecondOf(files));
  });
});
