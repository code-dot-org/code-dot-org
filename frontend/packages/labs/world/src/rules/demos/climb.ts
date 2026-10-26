// "Climbs Ladders" — up a thing gravity would otherwise pull you off.
//
// A ladder standing on a floor, and a climber going up it and back down. The
// point of the strip is the SECOND half: anything can be moved upward, and what
// makes this a ladder is that letting go leaves you on it rather than dropping
// you. So the recording holds still in the middle, with gravity pulling the
// whole time and nothing happening.
//
// The rungs are `Acts as Ground` as well as `Can Be Climbed`, which is the
// shape the rule is written for: you land on the top of a ladder, you fall
// through the rest of it, and you climb down through the top when you ask to.
//
// Climbing is switched on and off by the rule's own actions, which is what a
// key handler in a project calls (`actors/enhance/climbArrows`). Hands are not
// in the frame because the demonstration is the ladder rather than the keys —
// the Arrow Keys demo is where a cluster of caps belongs.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `input` — the three switches the rule offers. */
let climbUp: unknown;
let climbDown: unknown;
let stopClimbing: unknown;

export const climbDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/gravity', 'rules/climb'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    climbUp = of('rules/climb', 'StartClimbingUpAction');
    climbDown = of('rules/climb', 'StartClimbingDownAction');
    stopClimbing = of('rules/climb', 'StopClimbingAction');
    const world = demoWorld('climb', modules, climbDemo.rules);

    world.addActor(
      new ActorBuilder({id: 'floor', name: 'floor'})
        .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
        .set(PositionProperty, new Vector(96, 116))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(192, 16))
        .instantiate('floor'),
    );

    // Three rungs from the floor up, each 24 tall — a ladder that fits a
    // 128-pixel frame with the floor and a little sky either side of it.
    [0, 1, 2].forEach(index => {
      world.addActor(
        new ActorBuilder({id: `rung${index}`, name: 'rung'})
          .useTraits([
            of('rules/climb', 'CanBeClimbedTrait'),
            of('rules/gravity', 'ActsAsGroundTrait'),
          ])
          .set(PositionProperty, new Vector(96, 96 - index * 24))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(24, 24))
          .instantiate(`rung${index}`),
      );
    });

    const climber = new ActorBuilder({id: 'climber', name: 'climber'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/climb', 'ClimbsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      // Slower than the default two, which crosses this whole ladder in a
      // third of a second and reads as a teleport.
      .set(of('rules/climb', 'ClimbSpeedProperty'), 0.7)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(96, 100))
      .instantiate('climber');
    world.addActor(climber);

    return {world, cast: {climber}};
  },
  // Up, then a pause holding on to nothing, then down. The pause is the half
  // of the rule that a climb alone does not show.
  input(world: World, seconds: number) {
    const climber = [...world.actors].find(one => one.id === 'climber');
    if (!climber) {
      return;
    }
    const edge = (at: number) => Math.round(at * 60);
    const now = edge(seconds);
    const act = (what: unknown) => world.act(what as never, climber as never);
    if (now === edge(0.2)) {
      act(climbUp);
    }
    if (now === edge(1.1)) {
      act(stopClimbing);
    }
    if (now === edge(1.7)) {
      act(climbDown);
    }
  },
  look(id) {
    if (id === 'climber') {
      return {width: 14, height: 14, color: '#61afef'};
    }
    if (id === 'floor') {
      return {width: 192, height: 16, color: '#5a7d5a'};
    }
    return {width: 24, height: 24, color: '#b08050'};
  },
};
