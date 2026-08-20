// "Keeps Score" — a number the whole world shares, and the moment it is enough.
//
// A collector walking a line of coins with the count above it, and the word
// WIN when the last one lands. Two rules doing what neither does alone:
// Collection says a coin was taken, Scoring says that was the third.
//
// THE BANNER IS THE POINT of the second half. Winning sets a flag and raises
// an event and does nothing else — the rule owns no policy — so what a strip
// can show is a project's handler answering it. Here that handler writes a
// word; in a game it might stop the music or open a door.
//
// The score is read off the WORLD in `look`, not kept here, for the reason the
// health demo reads health off its actor: the rule is the only place it lives.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** What a coin is worth, and how many there are. */
const PER_COIN = 10;
// Early enough that the last one lands with most of a second still to run:
// the banner is the payoff, and a payoff in the final two frames is one a
// learner scrubbing the strip will miss.
const COINS = [60, 95, 130];

/** Set by `build`, read by `look`. */
let scoreOf: unknown;
let wonOf: unknown;

export const scoreDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/collect', 'rules/score'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    scoreOf = of('rules/score', 'ScoreProperty');
    wonOf = of('rules/score', 'WonProperty');
    const world = demoWorld('score', modules, scoreDemo.rules);
    world.set(
      of('rules/score', 'TargetScoreProperty'),
      (COINS.length * PER_COIN) as never,
    );

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/collect', 'CollectsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(PositionProperty, new Vector(24, 84))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.62, 0))
      // The project's half: a coin was taken, so that is worth something.
      // Collection knows nothing about points and Scoring knows nothing about
      // coins; this line is where a game says they are the same event.
      .on(of('rules/collect', 'CollectsEvent'), () => {
        world.act(of('rules/score', 'AddToTheScoreAction'), PER_COIN as never);
      })
      .instantiate('walker');
    world.addActor(walker);

    COINS.forEach((x, index) => {
      const id = `coin${index}`;
      world.addActor(
        new ActorBuilder({id, name: 'coin'})
          .useTraits([of('rules/collect', 'CanBeCollectedTrait')])
          .set(PositionProperty, new Vector(x, 84))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(12, 12))
          .instantiate(id),
      );
    });

    // The score belongs to the WORLD, and the recorder draws actors — so the
    // display is an actor whose text is read from the world each frame. That
    // is what a project does too: `rules/writing` puts text on an actor, and
    // there is nothing else to put it on.
    for (const [id, y] of [
      ['tally', 28],
      ['banner', 52],
    ] as const) {
      world.addActor(
        new ActorBuilder({id, name: id})
          .set(PositionProperty, new Vector(96, y))
          .instantiate(id),
      );
    }

    return {world, cast: {walker, score: scoreOf, won: wonOf}};
  },
  look(id, _actor, world) {
    if (id === 'tally') {
      const points = world.get(scoreOf as never) as unknown as number;
      return {
        width: 0,
        height: 0,
        colour: '#abb2bf',
        text: `SCORE ${points}`,
        textScale: 2,
      };
    }
    if (id === 'banner') {
      // Empty until the target is reached, and an empty string draws nothing —
      // so the banner is present in every frame and visible in none until the
      // rule says otherwise.
      const won = world.get(wonOf as never) as unknown as boolean;
      return {
        width: 0,
        height: 0,
        colour: '#98c379',
        text: won ? 'YOU WIN' : '',
        textScale: 3,
      };
    }
    return id === 'walker'
      ? {width: 16, height: 16, colour: '#61afef'}
      : {width: 12, height: 12, colour: '#f6c453'};
  },
};
