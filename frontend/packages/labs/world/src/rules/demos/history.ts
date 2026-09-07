// "Undoes Moves" — the world remembers where things were.
//
// A box that marches four squares to the right and then walks back through
// exactly the places it stood in. Nothing MOVES it back: each step of the
// return is `take back a move`, which puts it where the tape says it was, and
// the frames are the proof — a box returning under its own steam would drift,
// and this one lands on its own footprints.
//
// The footprints are drawn as it goes, so the strip carries its own evidence:
// by the halfway frame there are four marks and a box at the far end, and by
// the last there are four marks and a box back at the first of them.
//
// The beat is Time's, and the handler is the project's half — what counts as a
// move is the game's to say, which is the whole reason History cannot guess
// (`rules/history`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

const STRIDE = 30;
const START = 36;
/** Four moves out and four back, at a beat that fits both in the strip. */
const MOVES = 4;
const PERIOD = 0.3;

export const historyDemo: RuleDemo = {
  rules: ['rules/time', 'rules/history'],
  seconds: 2.75,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('history', modules, historyDemo.rules);

    const box = new ActorBuilder({id: 'box', name: 'box'})
      .useTraits([of('rules/history', 'RemembersWhereItWasTrait')])
      .set(PositionProperty, new Vector(START, 84))
      .instantiate('box');
    world.addActor(box);

    let beat = 0;
    const clock = new ActorBuilder({id: 'clock', name: 'clock'})
      .useTraits([of('rules/time', 'HasATimerTrait')])
      .set(of('rules/time', 'TimerPeriodProperty'), PERIOD)
      .set(PositionProperty, new Vector(96, 32))
      .on(of('rules/time', 'TimerFiresEvent'), () => {
        if (beat < MOVES) {
          // Remembered BEFORE the move it is about: the tape holds where things
          // were, not where they are going.
          world.act(of('rules/history', 'RememberThisMoveAction'));
          const at = box.get(PositionProperty);
          box.set(PositionProperty, new Vector(at.x + STRIDE, at.y));
          const id = `step${beat}`;
          world.addActor(
            new ActorBuilder({id, name: 'step'})
              .set(PositionProperty, new Vector(at.x, 108))
              .instantiate(id),
          );
        } else {
          world.act(of('rules/history', 'TakeBackAMoveAction'));
        }
        beat++;
      })
      .instantiate('clock');
    world.addActor(clock);

    return {world, cast: {box, clock}};
  },
  look(id: string) {
    if (id === 'clock') {
      return {width: 14, height: 14, color: '#c678dd'};
    }
    // The footprints are what the return is measured against, so they have to
    // be visible: a dim mark on a dark ground is a mark nobody can see the box
    // land on.
    return id === 'box'
      ? {width: 18, height: 18, color: '#61afef'}
      : {width: 8, height: 8, color: '#abb2bf'};
  },
};
