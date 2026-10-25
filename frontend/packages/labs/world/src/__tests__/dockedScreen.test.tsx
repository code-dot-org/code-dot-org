// A game's Viewport docked to its whole Main Screen (specs/DOCKING_PLAN.md,
// step 3): compiled from the project, it is the window's size in any window.

import {describe, expect, it} from 'vitest';

import {Vector} from '../engine/core/Vector';
import {HeightProperty, WidthProperty} from '../engine/rules/boxed';
import {PositionProperty} from '../engine/rules/spatial';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

describe.each(['simple', 'flappy', 'breakout'] as const)(
  'the %s Main Screen',
  tag => {
    it('fills the window with its Viewport, whatever the window', async () => {
      const {world} = await compileProject(
        projectFiles(WORLD_SCENARIOS[tag].source),
      );
      const game = [...world.actors].find(actor => actor.id === 'Game')!;

      world.setViewSize(15, 12);

      // The starter's HUD bar, one tile, is above it (step 6); the others
      // have the window to themselves.
      const bar = tag === 'simple' ? 32 : 0;
      expect(game.get(WidthProperty)).toBe(480);
      expect(game.get(HeightProperty)).toBe(384 - bar);
      expect(game.get(PositionProperty)).toEqual(
        new Vector(240, bar + (384 - bar) / 2),
      );
    });
  },
);

describe('the starter’s HUD', () => {
  it('is a bar over the game, the Health Bar watching the Player in the level', async () => {
    const {world} = await compileProject(
      projectFiles(WORLD_SCENARIOS.simple.source),
    );
    world.tick(1 / 60);
    const named = (id: string) =>
      [...world.actors].find(actor => actor.id === id)!;

    // Fixed at the right of a bar one tile tall, a whole room under it.
    expect(named('HealthBar').get(PositionProperty)).toEqual(
      new Vector(320 - 48, 16),
    );
    expect(named('Game').get(HeightProperty)).toBe(320);
    // …and it watches the Player, who is in another space.
    const subject = named('HealthBar')
      .ownProperties()
      .find(property => property.id === 'subject')!;
    expect(named('HealthBar').get(subject)).toEqual([named('Player')]);
  });
});
