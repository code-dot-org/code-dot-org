// Breakout, compiled and run: its level is played inside a Viewport on the
// main map, and starting over is loading the level into that Viewport again
// (specs/RETIREMENTS_PLAN.md). The first whole game run inside a space, so
// what is pinned here is what a space has to get right for one: the level's
// actors are the space's, the rules that read the map's size read the
// level's, and a restart replaces the level and nothing else.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import type {Actor, GameEvent, World, WorldMap} from '../../engine';
import {projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

const compiled = () =>
  compileProject(projectFiles(WORLD_SCENARIOS.breakout.source));

const ofKind = (world: World, kind: string): Actor[] =>
  [...world.actors].filter(actor => actor.type === kind);

describe('breakout, in a Viewport', () => {
  it('plays its level in the Viewport’s space, and nothing in the root', async () => {
    const {world} = await compiled();
    world.tick(0);

    const [game] = ofKind(world, 'actors/viewport');
    expect(game.id).toBe('Game');
    const space = world.viewportSpaceOf(game)!;
    expect(space.bounds).toEqual({x: 320, y: 320});

    const level = [...world.actors].filter(actor => actor !== game);
    expect(ofKind(world, 'actors/brick')).toHaveLength(16);
    expect(ofKind(world, 'actors/ball')).toHaveLength(1);
    expect(level.every(actor => actor.space === space)).toBe(true);
  });

  it('starts over by loading the level again, under a menu that stays', async () => {
    const {world, modules} = await compiled();
    world.tick(0);
    const [game] = ofKind(world, 'actors/viewport');

    // A brick taken, and the menu up over the game.
    world.removeActor(ofKind(world, 'actors/brick')[0]);
    const menu = modules['maps/pauseMenu'] as unknown as {
      default: WorldMap;
      QuitEvent: GameEvent;
    };
    world.loadMap(menu.default);
    world.tick(16);
    expect(ofKind(world, 'actors/brick')).toHaveLength(15);
    const panel = ofKind(world, 'actors/panel');
    expect(panel).toHaveLength(1);

    world.emitToWorld(menu.QuitEvent);
    world.tick(16);
    world.tick(16);

    // The level is whole again and in the same space; the Viewport is the
    // one it was, and the menu in the root was not part of what went.
    const space = world.viewportSpaceOf(game)!;
    const bricks = ofKind(world, 'actors/brick');
    expect(bricks).toHaveLength(16);
    expect(bricks.every(brick => brick.space === space)).toBe(true);
    expect(ofKind(world, 'actors/ball')).toHaveLength(1);
    expect(ofKind(world, 'actors/viewport')).toEqual([game]);
    expect(ofKind(world, 'actors/panel')).toEqual(panel);
  });
});
