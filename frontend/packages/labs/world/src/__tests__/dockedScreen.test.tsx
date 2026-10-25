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

      expect(game.get(WidthProperty)).toBe(480);
      expect(game.get(HeightProperty)).toBe(384);
      expect(game.get(PositionProperty)).toEqual(new Vector(240, 192));
    });
  },
);
