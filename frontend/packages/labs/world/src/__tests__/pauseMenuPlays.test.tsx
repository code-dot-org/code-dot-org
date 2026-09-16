// The stock pause menu in a game: P stops breakout and shows the menu,
// Resume takes the menu away and the ball moves again, Quit restarts.

import {describe, expect, it} from 'vitest';

import {type Actor, PositionProperty} from '../engine';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

describe('the pause menu, in breakout', () => {
  const open = async () => {
    const {world} = await compileProject(
      projectFiles(WORLD_SCENARIOS.breakout.source),
    );
    const actors = () => [...world.actors] as Actor[];
    const ofType = (type: string) =>
      actors().filter(actor => actor.type === type);
    const frame = () => {
      world.tick(1 / 60);
      world.renderSnapshot();
    };
    const tap = (key: string) => {
      world.setInput([key]);
      frame();
      world.setInput([]);
      frame();
      frame();
    };
    const click = (x: number, y: number) => {
      world.setPointer({x, y}, ['left']);
      frame();
      world.setPointer({x, y}, []);
      frame();
      frame();
    };
    return {world, ofType, tap, click, frame};
  };

  it('stops the game and shows the menu on P, and resumes on Resume', async () => {
    const g = await open();
    // Serve, and let the ball travel.
    g.tap('space');
    const ball = g.ofType('actors/ball')[0];
    const before = ball.get(PositionProperty).y;
    g.frame();
    g.frame();
    expect(ball.get(PositionProperty).y).not.toBe(before);

    g.tap('p');
    expect(g.world.isPaused()).toBe(true);
    const [menu] = g.ofType('actors/pauseMenu');
    expect(menu).toBeDefined();
    expect(menu.children()).toHaveLength(2);
    const held = ball.get(PositionProperty).y;
    for (let i = 0; i < 10; i++) {
      g.frame();
    }
    expect(ball.get(PositionProperty).y).toBe(held);

    // Resume is a plain Button the map names, the panel's child four below
    // its middle at (160, 160).
    const [resume] = g.world.actorsNamed('Resume');
    expect(resume.type).toBe('actors/button');
    const at = resume.get(PositionProperty);
    g.click(at.x, at.y);
    expect(g.world.isPaused()).toBe(false);
    expect(g.ofType('actors/pauseMenu')).toHaveLength(0);
    expect(g.world.actorsNamed('Resume')).toHaveLength(0);
    g.frame();
    g.frame();
    expect(ball.get(PositionProperty).y).not.toBe(held);
  }, 60000);

  it('starts the level over on Quit', async () => {
    const g = await open();
    g.tap('space');
    for (let i = 0; i < 30; i++) {
      g.frame();
    }
    g.tap('p');
    const [quit] = g.world.actorsNamed('Quit');
    const at = quit.get(PositionProperty);
    g.click(at.x, at.y);
    expect(g.world.isPaused()).toBe(false);
    expect(g.ofType('actors/pauseMenu')).toHaveLength(0);
    // A fresh ball, unserved, where the map puts one.
    const [ball] = g.ofType('actors/ball');
    expect(ball).toBeDefined();
    g.frame();
    g.frame();
    const rest = ball.get(PositionProperty);
    g.frame();
    expect(ball.get(PositionProperty)).toEqual(rest);
  }, 60000);
});
