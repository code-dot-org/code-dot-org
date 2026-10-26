// "Prowls" — a hunter that uses the level rather than walking through it.
//
// Two floors joined by a ladder, the quarry on the upper one and the robot on
// the lower. What the strip has to show is that the robot GOES ROUND: it walks
// to the ladder rather than at the wall under its target, climbs, and comes at
// it along the top. A hunter that moved toward its quarry would have gone
// straight up the wall, and the difference is only visible in the route.
//
// A gap in the upper floor exactly the ladder's width, because a one-way
// platform is something you rise THROUGH and this robot climbs rather than
// jumping — a solid ceiling over the ladder is a ladder to nowhere.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const prowlingDemo: RuleDemo = {
  rules: [
    'rules/motion',
    'rules/collisions',
    'rules/solid',
    'rules/gravity',
    'rules/climb',
    'rules/prowling',
  ],
  seconds: 3,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('prowling', modules, prowlingDemo.rules);

    const floor = (id: string, x: number, y: number, width: number) =>
      world.addActor(
        new ActorBuilder({id, name: 'floor'})
          .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
          .set(PositionProperty, new Vector(x, y))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(width, 8))
          .instantiate(id),
      );
    floor('lower', 96, 116, 192);
    // The upper floor either side of the ladder's column: a hole exactly 24
    // wide at x 84 to 108, which is where the rungs are.
    floor('upperLeft', 42, 52, 84);
    floor('upperRight', 150, 52, 84);

    // Walls at both ends. A room without them is a room a robot walks out of,
    // and this recording is about the route it picks rather than about the
    // edge of the world.
    const wall = (id: string, x: number) =>
      world.addActor(
        new ActorBuilder({id, name: 'wall'})
          .useTraits([
            of('rules/gravity', 'ActsAsGroundTrait'),
            of('rules/solid', 'SolidTrait'),
          ])
          .set(PositionProperty, new Vector(x, 64))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(8, 128))
          .instantiate(id),
      );
    wall('west', 4);
    wall('east', 188);

    [0, 1, 2].forEach(index => {
      world.addActor(
        new ActorBuilder({id: `rung${index}`, name: 'rung'})
          .useTraits([of('rules/climb', 'CanBeClimbedTrait')])
          .set(PositionProperty, new Vector(96, 60 + index * 24))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(24, 24))
          .instantiate(`rung${index}`),
      );
    });

    const prey = new ActorBuilder({id: 'prey', name: 'prey'})
      .set(PositionProperty, new Vector(36, 41))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .instantiate('prey');
    world.addActor(prey);

    const robot = new ActorBuilder({id: 'robot', name: 'robot'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/climb', 'ClimbsTrait'),
        of('rules/prowling', 'ProwlsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      // Faster than the default one, so the whole route — walk, climb, walk —
      // fits inside three seconds of recording.
      .set(of('rules/prowling', 'ProwlSpeedProperty'), 1.4)
      .set(of('rules/climb', 'ClimbSpeedProperty'), 1.4)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(168, 105))
      .instantiate('robot');
    robot.set(of('rules/prowling', 'ActorToHuntProperty'), prey as never);
    world.addActor(robot);

    return {world, cast: {robot, prey}};
  },
  look(id) {
    if (id === 'robot') {
      return {width: 14, height: 14, color: '#e06c75'};
    }
    if (id === 'prey') {
      return {width: 14, height: 14, color: '#61afef'};
    }
    if (id.startsWith('rung')) {
      return {width: 24, height: 24, color: '#b08050'};
    }
    if (id === 'west' || id === 'east') {
      return {width: 8, height: 128, color: '#5a7d5a'};
    }
    return {
      width: id === 'lower' ? 192 : 84,
      height: 8,
      color: '#5a7d5a',
    };
  },
};
