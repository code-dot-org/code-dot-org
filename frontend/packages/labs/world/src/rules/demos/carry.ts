// "Carries Riders" — the moving platform, and the thing that is not
// on one.
//
// TWO BOXES, and the second is the demonstration. A rider going along with a
// platform looks exactly like a rider with a velocity of its own; the box
// beside it, identical but for the trait, is what says the platform is doing
// it. The gap between them opens a pixel a frame and is unmistakable by the
// end of the strip.
//
// The platform is moved by a plain velocity rather than by Patrol, which is
// the rule's own claim made visible: it MEASURES rather than asking, so
// whatever moves the platform, the rider goes with it (`rules/carry`).
//
// The bystander is left hanging in the air by the end, because nothing here
// has gravity — and that is the header's own sentence drawn: a platform holds
// somebody up perfectly and then slides out from under them.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** The platform's middle, and where a box standing on it sits.
 *
 * Two pixels INTO the deck rather than resting exactly on it: contact is what
 * a rider is found by, and two boxes that share an edge and nothing else are a
 * coin-toss between touching and not. Two pixels is invisible at this size and
 * is the difference between a demo and a strip of a box sitting still. */
const DECK = 96;
const STANDING = DECK - 10 - 8 + 2;

export const carryDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/carry'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('carry', modules, carryDemo.rules);

    const platform = new ActorBuilder({id: 'platform', name: 'platform'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/carry', 'CarriesTrait'),
      ])
      .set(PositionProperty, new Vector(60, DECK))
      // The collision box IS the deck: the riders are carried because they are
      // touching it, so what is drawn and what is touched have to be one thing
      // or the strip shows a box floating beside the platform that moves it.
      .set(of('rules/collisions', 'SizeProperty'), new Vector(96, 20))
      // A quarter of a unit is twenty-five pixels a second, so the deck
      // travels sixty-odd pixels in the strip — far enough for the gap to be
      // unmistakable and near enough that the platform is still in the frame
      // at the end of it.
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.25, 0))
      .instantiate('platform');
    world.addActor(platform);

    const standing = (id: string, x: number, rides: boolean) =>
      new ActorBuilder({id, name: id})
        .useTraits([
          of('rules/collisions', 'CanCollideTrait'),
          ...(rides ? [of('rules/carry', 'RidesTrait')] : []),
        ])
        .set(PositionProperty, new Vector(x, STANDING))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
        .instantiate(id);

    // The rider on the RIGHT and the bystander on the left, so the gap between
    // them OPENS as the platform travels. The other way round they cross over
    // half way through, which reads as two things passing rather than as one
    // being carried.
    const rider = standing('rider', 86, true);
    const bystander = standing('bystander', 30, false);
    world.addActor(rider);
    world.addActor(bystander);

    return {world, cast: {platform, rider, bystander}};
  },
  look(id: string) {
    if (id === 'platform') {
      return {width: 96, height: 20, color: '#5c6370'};
    }
    // The rider is the one the rule is about; the bystander is drawn in the
    // color of a thing that is merely there.
    // Both boxes bright against the deck, or the demonstration is a box beside
    // something the same color as the thing it is standing on.
    return id === 'rider'
      ? {width: 16, height: 16, color: '#61afef'}
      : {width: 16, height: 16, color: '#dcdfe4'};
  },
};
