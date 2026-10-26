// "Digs Holes" — the floor being something you can go through.
//
// A row of blocks with something standing on them, digging down through one
// and dropping into the hole it made. The recording runs long enough for the
// hole to CLOSE again, which is the half of the rule a dig alone does not show:
// a hole is temporary, and a digger who does not keep moving is a digger the
// floor grows back around.
//
// The hole is drawn from `is a hole` rather than by removing the block, because
// that is what the rule does — a dug block is still there and still says so.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `input` and `look`. */
let digAction: unknown;
let isHole: unknown;

export const diggingDemo: RuleDemo = {
  rules: [
    'rules/motion',
    'rules/collisions',
    'rules/solid',
    'rules/gravity',
    'rules/digging',
  ],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    digAction = of('rules/digging', 'DigTowardsAction');
    isHole = of('rules/digging', 'IsAHoleProperty');
    const world = demoWorld('digging', modules, diggingDemo.rules);

    // The bedrock, so a digger that goes through the diggable layer has
    // somewhere to land. Without it the strip is a box falling out of the
    // bottom of the picture, which is a demo of gravity and not of digging.
    world.addActor(
      new ActorBuilder({id: 'bedrock', name: 'bedrock'})
        .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
        .set(PositionProperty, new Vector(96, 112))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(192, 16))
        .instantiate('bedrock'),
    );

    // Six blocks across, so there is floor either side of the one that opens
    // and the hole reads as a hole rather than as an edge.
    [0, 1, 2, 3, 4, 5].forEach(column => {
      const block = new ActorBuilder({id: `block${column}`, name: 'block'})
        .useTraits([
          of('rules/digging', 'CanBeDugTrait'),
          of('rules/gravity', 'ActsAsGroundTrait'),
          of('rules/solid', 'SolidTrait'),
        ])
        .set(PositionProperty, new Vector(column * 32 + 16, 80))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(32, 32))
        .instantiate(`block${column}`);
      // Short enough that the floor grows back inside the recording.
      block.set(of('rules/digging', 'ClosesAfterProperty'), 1.1 as never);
      world.addActor(block);
    });

    const digger = new ActorBuilder({id: 'digger', name: 'digger'})
      .useTraits([
        of('rules/digging', 'DigsTrait'),
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(80, 40))
      .instantiate('digger');
    world.addActor(digger);

    return {world, cast: {digger}};
  },
  // One dig, straight down, once it has settled on the floor. Everything after
  // that is the rule's: the fall through, and the floor closing over.
  input(world: World, seconds: number) {
    if (Math.round(seconds * 60) !== Math.round(0.4 * 60)) {
      return;
    }
    const digger = [...world.actors].find(one => one.id === 'digger');
    if (digger) {
      // `⟨who⟩ dig towards ⟨direction⟩`, which is the block a project puts
      // under a key press: down is (0, 1), because +y is down.
      (digger as {act(a: unknown, v: unknown): void}).act(
        digAction as never,
        new Vector(0, 1),
      );
    }
  },
  look(id, actor) {
    if (id === 'digger') {
      return {width: 14, height: 14, color: '#61afef'};
    }
    if (id === 'bedrock') {
      return {width: 192, height: 16, color: '#5a7d5a'};
    }
    // An open block is drawn as the hole it is — dark, and still occupying its
    // square, because that is exactly what the rule leaves behind.
    const open = (actor as {get(p: unknown): boolean}).get(isHole as never);
    return {width: 32, height: 32, color: open ? '#1c1c2a' : '#8a5a3b'};
  },
};
