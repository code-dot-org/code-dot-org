// "Moves on a Grid" — a whole square at a time, and a crate that goes with you.
//
// Everything else in this library moves by a speed. This one asks which square
// next, and the difference is visible in a strip and in nothing else: the
// player crosses a tile in a tenth of a second and then STOPS, on the square,
// every time. A box with a velocity never stops anywhere in particular.
//
// THE CRATE IS THE SECOND HALF. Pushing is part of stepping rather than
// something a project writes — deciding whether a step is legal means looking
// at what is in the target square, and if that thing can be pushed the answer
// depends on the square beyond it. So the strip shows the player push the
// crate one square, and then both of them stop dead against the wall: the
// refusal is the rule working, not the demo running out.
//
// The beat is Time's, because nobody is pressing an arrow key in a recording
// and a step is a thing a project asks for.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Tile centers on the engine's own 32-pixel grid. */
const at = (column: number) => column * 32 + 16;
const ROW = 80;
/** A step takes 0.12s; a beat of 0.4 leaves the eye time to see it land. */
const PERIOD = 0.4;

export const gridDemo: RuleDemo = {
  rules: ['rules/time', 'rules/grid'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('grid', modules, gridDemo.rules);

    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([
        of('rules/grid', 'StepsOnTheGridTrait'),
        of('rules/time', 'HasATimerTrait'),
      ])
      .set(of('rules/time', 'TimerPeriodProperty'), PERIOD)
      .set(PositionProperty, new Vector(at(0), ROW))
      .instantiate('player');
    player.on(of('rules/time', 'TimerFiresEvent'), () => {
      player.act(of('rules/grid', 'StepRightAction'));
    });
    world.addActor(player);

    // A crate is a wall that gives way: it fills its tile, it can be pushed,
    // and it steps like anything else on the board.
    world.addActor(
      new ActorBuilder({id: 'crate', name: 'crate'})
        .useTraits([of('rules/grid', 'CanBePushedTrait')])
        .set(PositionProperty, new Vector(at(3), ROW))
        .instantiate('crate'),
    );
    // …and a wall is a thing that only fills its tile, which is as small as a
    // wall should be.
    world.addActor(
      new ActorBuilder({id: 'wall', name: 'wall'})
        .useTraits([of('rules/grid', 'FillsATileTrait')])
        .set(PositionProperty, new Vector(at(5), ROW))
        .instantiate('wall'),
    );

    return {world, cast: {player, crate: 'crate', wall: 'wall'}};
  },
  look(id: string) {
    if (id === 'wall') {
      return {width: 30, height: 30, color: '#5c6370'};
    }
    return id === 'crate'
      ? {width: 26, height: 26, color: '#e5c07b'}
      : {width: 22, height: 22, color: '#61afef'};
  },
};
