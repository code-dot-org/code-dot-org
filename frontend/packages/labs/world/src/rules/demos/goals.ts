// "Has an Ending" — the game is over, and which way.
//
// A walker crossing to a flag with a spike after it, and a banner that says
// what happened. The flag makes it a win; the spike, a moment later, does not
// make it a loss — which is the rule's one real claim, THE FIRST ENDING WINS,
// and it is a claim about a moment that has already gone by. A strip is the
// only thing that can show it: the frames after the spike are the evidence,
// and they look like nothing at all happening.
//
// Both handlers are the project's half, written here in TypeScript instead of
// blocks: the rule says which ending happened and owns nothing about what an
// ending looks like (`rules/goals`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look`. */
let wonOf: unknown;
let lostOf: unknown;

export const goalsDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/goals'],
  // Long enough for the spike to be reached and ignored, and no longer: the
  // frames after that are a walker walking, which is not the demonstration.
  seconds: 2.2,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    wonOf = of('rules/goals', 'WonProperty');
    lostOf = of('rules/goals', 'LostProperty');
    const world = demoWorld('goals', modules, goalsDemo.rules);

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/collisions', 'CanCollideTrait'),
      ])
      .set(PositionProperty, new Vector(24, 88))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.62, 0))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      // The project's half. A flag is a win and a spike is a loss because this
      // game says so; the rule has never seen either.
      .on(
        of('rules/collisions', 'StartsTouchingEvent'),
        (_world: unknown, _actor: unknown, other: unknown) => {
          const id = (other as {id: string}).id;
          world.act(
            of(
              'rules/goals',
              id === 'flag' ? 'WinTheGameAction' : 'LoseTheGameAction',
            ),
          );
        },
      )
      .instantiate('walker');
    world.addActor(walker);

    const mark = (id: string, x: number) =>
      world.addActor(
        new ActorBuilder({id, name: id})
          .useTraits([of('rules/collisions', 'CanCollideTrait')])
          .set(PositionProperty, new Vector(x, 88))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
          .instantiate(id),
      );
    // Far enough apart that the win is on screen for half a second before the
    // spike arrives to be ignored.
    mark('flag', 84);
    mark('spike', 140);

    world.addActor(
      new ActorBuilder({id: 'banner', name: 'banner'})
        .set(PositionProperty, new Vector(96, 40))
        .instantiate('banner'),
    );

    return {world, cast: {walker, won: wonOf, lost: lostOf}};
  },
  look(id: string, _actor: unknown, world) {
    if (id === 'banner') {
      const won = world.get(wonOf as never) as unknown as boolean;
      const lost = world.get(lostOf as never) as unknown as boolean;
      return {
        width: 0,
        height: 0,
        color: won ? '#98c379' : '#e06c75',
        // Empty until an ending happens, and an empty string draws nothing —
        // so the banner is in every frame and visible in none until then.
        text: won ? 'YOU WIN' : lost ? 'YOU LOSE' : '',
        textScale: 3,
      };
    }
    if (id === 'flag') {
      return {width: 16, height: 16, color: '#98c379'};
    }
    return id === 'spike'
      ? {width: 16, height: 16, color: '#e06c75'}
      : {width: 16, height: 16, color: '#61afef'};
  },
};
