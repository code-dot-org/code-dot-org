// "Takes Turns" — a game where time is a sequence rather than a rate.
//
// Three boxes on three lines. The top one is the player and moves on a beat;
// the second takes a turn every turn and keeps step with it exactly; the third
// has `turns per move` of two and falls half a square behind on every beat.
//
// THE THIRD BOX IS THE DEMONSTRATION. Two boxes moving together read as two
// boxes with the same speed — which is the reading a rate would give, and the
// one this rule is not. A box that moves on every OTHER turn cannot be
// explained by a speed at all: it is standing still while the others move, and
// then catching up in one jump.
//
// The beat is Time's and the move is the project's, because what counts as a
// move is the game's to say (`rules/turns`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

const STRIDE = 26;
const START = 26;
/** Fast enough for five turns in the strip, which is where the slow one shows. */
const PERIOD = 0.45;

export const turnsDemo: RuleDemo = {
  rules: ['rules/time', 'rules/turns'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('turns', modules, turnsDemo.rules);

    /** A thing that steps right when it is told to. */
    const taker = (id: string, y: number, perMove: number) => {
      const actor = new ActorBuilder({id, name: id})
        .useTraits([of('rules/turns', 'TakesATurnTrait')])
        .set(of('rules/turns', 'TurnsPerMoveProperty'), perMove)
        .set(PositionProperty, new Vector(START, y))
        .on(of('rules/turns', 'TakesItsTurnEvent'), () => {
          const at = actor.get(PositionProperty);
          actor.set(PositionProperty, new Vector(at.x + STRIDE, at.y));
        })
        .instantiate(id);
      world.addActor(actor);
      return actor;
    };
    const quick = taker('quick', 68, 1);
    const slow = taker('slow', 100, 2);

    // The player: it moves, and then says a turn has happened. On the move
    // that HAPPENED — which here is a beat, and in a game is a step that
    // finished.
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([of('rules/time', 'HasATimerTrait')])
      .set(of('rules/time', 'TimerPeriodProperty'), PERIOD)
      .set(PositionProperty, new Vector(START, 36))
      .instantiate('player');
    player.on(of('rules/time', 'TimerFiresEvent'), () => {
      const at = player.get(PositionProperty);
      player.set(PositionProperty, new Vector(at.x + STRIDE, at.y));
      world.act(of('rules/turns', 'EndTheTurnAction'));
    });
    world.addActor(player);

    return {world, cast: {player, quick, slow}};
  },
  look(id: string) {
    if (id === 'player') {
      return {width: 18, height: 18, color: '#61afef'};
    }
    return id === 'quick'
      ? {width: 18, height: 18, color: '#e5c07b'}
      : {width: 18, height: 18, color: '#c678dd'};
  },
};
