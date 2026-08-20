// "Stays in the Map" — a thing that reaches an edge stops there.
//
// Two boxes crossing on opposite diagonals, each electing both halves of the
// rule, so each ends up parked in the corner it was heading for. Two rather
// than one because a single box in a corner is a box in a corner: what says
// the rule did it is that the OTHER one, going the other way, stopped just as
// dead at the opposite edge.
//
// Drawn 32 by 32 because that is the size the rule assumes. It holds an actor
// back by half its picture, and an actor nothing has measured counts as
// thirty-two square (`rules/bounds`); a box drawn any smaller would park with
// a gap between it and the edge, and demonstrate a rule that missed.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const boundsDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/bounds'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('bounds', modules, boundsDemo.rules);
    const traits = [
      of('rules/motion', 'CanMoveTrait'),
      of('rules/bounds', 'StaysAcrossTrait'),
      of('rules/bounds', 'StaysDownTrait'),
    ];
    const box = (id: string, at: Vector, going: Vector) => {
      const actor = new ActorBuilder({id, name: id})
        .useTraits(traits)
        .set(PositionProperty, at)
        .set(of('rules/motion', 'VelocityProperty'), going)
        .instantiate(id);
      world.addActor(actor);
      return actor;
    };
    return {
      world,
      cast: {
        // Both reach their edges around a second and a half in, so the strip
        // is two parts travelling to one part unmistakably stopped.
        falling: box('falling', new Vector(60, 40), new Vector(1, 0.5)),
        rising: box('rising', new Vector(140, 100), new Vector(-1, -0.6)),
      },
    };
  },
  look(id: string) {
    return id === 'falling'
      ? {width: 32, height: 32, colour: '#61afef'}
      : {width: 32, height: 32, colour: '#e5c07b'};
  },
};
