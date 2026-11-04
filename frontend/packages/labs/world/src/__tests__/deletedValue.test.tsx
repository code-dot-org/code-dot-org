// A game-wide value deleted while blocks still use it (the Main Screen's
// inspector, `screenProperties.removeScreenProperty`). The inspector says
// which files use it and deletes it anyway, so this is a state a project is
// one click from. The project must go on compiling, and those blocks must do
// nothing rather than throw.

import {describe, expect, it} from 'vitest';

import {PositionProperty} from '../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {removeScreenProperty} from '../mapEditor/screenProperties';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

/** Tapper, which counts its clicks in the Main Screen's `score`, without it. */
const withoutScore = () => {
  const files = projectFiles(WORLD_SCENARIOS.tapper.source);
  const main = Object.keys(files).find(path => path.endsWith('main.screen'))!;
  return {...files, [main]: removeScreenProperty(files[main], 'score')};
};

const mainCode = (code: Record<string, string>) =>
  Object.entries(code).find(([path]) => path.endsWith('screens/main'))![1];

describe('a deleted game-wide value', () => {
  // First, as a project loaded after the delete: nothing defines the blocks.
  it('compiles, and its blocks generate nothing', async () => {
    const {code, world} = await compileProject(withoutScore());
    expect(mainCode(code)).not.toMatch(/\bScoreProperty\b/);
    expect(() => world.tick(1 / 60)).not.toThrow();
  }, 60000);

  // …then in the session that deleted it: the old definitions are still
  // registered, and generated `world.set(ScoreProperty, …)` for a declaration
  // that was gone, which threw on the first click.
  it('generates nothing in the session that deleted it either', async () => {
    await compileProject(projectFiles(WORLD_SCENARIOS.tapper.source));
    const {code, world} = await compileProject(withoutScore());
    expect(mainCode(code)).not.toMatch(/\bScoreProperty\b/);
    world.tick(1 / 60);
    const coin = [...world.actors].find(actor => actor.type === 'actors/coin')!;
    const at = coin.get(PositionProperty);
    world.setPointer(at, ['left']);
    expect(() => world.tick(1 / 60)).not.toThrow();
  }, 60000);
});
