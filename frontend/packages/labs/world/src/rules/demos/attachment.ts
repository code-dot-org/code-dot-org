// "Rides Along with an Actor" — two things that move as one.
//
// A walker with a tag over its head and a shadow under its feet, all three
// moving as one thing. Three actors and one rule: the walker is the only one
// that moves itself, and the other two are pointed at it with different
// offsets — which is the whole of what the rule does.
//
// TWO RIDERS, not one, because one rider is a bigger sprite. What says these
// are separate actors following a third is that they sit in different places
// relative to it and hold those places while it goes.
//
// The walker turns round, so the strip shows the riders turning with it rather
// than sliding past — a rider that lagged or led would be obvious the moment
// the direction changed, which is why the walk is a patrol rather than a line.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const attachmentDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/patrol', 'rules/attachment'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('attachment', modules, attachmentDemo.rules);

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/patrol', 'PatrolsAcrossTrait'),
      ])
      .set(of('rules/patrol', 'AcrossSpeedProperty'), 0.8)
      .set(of('rules/patrol', 'AcrossTimeProperty'), 1.1)
      .set(PositionProperty, new Vector(40, 70))
      .instantiate('walker');
    world.addActor(walker);

    const rider = (id: string, offset: Vector) => {
      const actor = new ActorBuilder({id, name: id})
        .useTraits([of('rules/attachment', 'AttachedTrait')])
        .set(of('rules/attachment', 'OffsetProperty'), offset)
        // Where it will ride, rather than the origin. A rider is not moved
        // until the world has ticked once, so a strip that started them at
        // nothing would open on two boxes in the corner — which is the rule
        // working (it moves nobody it has not been pointed at) and reads as it
        // failing.
        .set(PositionProperty, new Vector(40 + offset.x, 70 + offset.y))
        .instantiate(id);
      actor.set(of('rules/attachment', 'AttachedToProperty'), walker as never);
      world.addActor(actor);
      return actor;
    };

    return {
      world,
      cast: {
        walker,
        tag: rider('tag', new Vector(0, -22)),
        shadow: rider('shadow', new Vector(0, 16)),
      },
    };
  },
  look(id: string) {
    if (id === 'tag') {
      return {width: 30, height: 8, colour: '#e5c07b'};
    }
    return id === 'shadow'
      ? {width: 22, height: 5, colour: '#3b4048'}
      : {width: 18, height: 18, colour: '#61afef'};
  },
};
