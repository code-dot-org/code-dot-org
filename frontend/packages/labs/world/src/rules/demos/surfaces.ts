// "Has Special Floors" — the ground having an opinion about how you cross it.
//
// Three tiles side by side and a walker crossing all three: a belt that carries
// it, ordinary ground that does not, and ice that lets it keep going after it
// has stopped pushing. One walker over three floors is the comparison the rule
// is about, and it is a comparison a still cannot make — three tiles and a box
// says nothing about which is which.
//
// The walker is pushed by the Arrow Keys rule with the key held for the first
// half only, so the ice reads: the box goes on sliding into the third tile
// after the pushing stops, where on the ordinary tile it would have halted.

import {ActorBuilder, PositionProperty, Vector, type World} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

export const surfacesDemo: RuleDemo = {
  rules: [
    'rules/motion',
    'rules/collisions',
    'rules/solid',
    'rules/gravity',
    'rules/input',
    'rules/arrows',
    'rules/surfaces',
  ],
  seconds: 2.5,
  input(world: World, seconds: number) {
    // Held for the first stretch only. What happens after it comes up is the
    // whole of what ice means.
    world.setInput(seconds < 1.1 ? ['right arrow'] : []);
  },
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('surfaces', modules, surfacesDemo.rules);

    const floor = (id: string, x: number, width: number, extra: unknown[]) => {
      const one = new ActorBuilder({id, name: id})
        .useTraits([
          of('rules/gravity', 'ActsAsGroundTrait'),
          ...(extra as never[]),
        ])
        .set(PositionProperty, new Vector(x, 104))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(width, 16))
        .instantiate(id);
      world.addActor(one);
      return one;
    };
    // Edge to edge, with no gaps between them: a position is a MIDDLE, so a
    // tile 64 wide at 32 runs from 0 to 64 and the next one has to start
    // there. The first cut left eight pixels of nothing between the belt and
    // the ground, and the walker went through it.
    const belt = floor('belt', 28, 56, [of('rules/surfaces', 'ConveysTrait')]);
    // Slower than the default two, which is a belt that throws a walker across
    // a 192-pixel frame in under a second.
    (belt as {set(p: unknown, v: unknown): void}).set(
      of('rules/surfaces', 'BeltSpeedProperty'),
      0.9,
    );
    floor('plain', 80, 48, []);
    floor('ice', 144, 80, [of('rules/surfaces', 'SlipperyTrait')]);

    // The far wall, which is what a slide needs at the end of it: ice does not
    // stop you, so without something there the demonstration ends with the
    // walker off the side of the picture.
    world.addActor(
      new ActorBuilder({id: 'wall', name: 'wall'})
        .useTraits([
          of('rules/solid', 'SolidTrait'),
          of('rules/collisions', 'CanCollideTrait'),
        ])
        .set(PositionProperty, new Vector(188, 72))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(8, 80))
        .instantiate('wall'),
    );

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/input', 'TakesKeyboardInputTrait'),
        of('rules/arrows', 'MovesAcrossTrait'),
        of('rules/surfaces', 'StandsOnSurfacesTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(of('rules/arrows', 'AcrossSpeedProperty'), 0.55)
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(10, 88))
      .instantiate('walker');
    world.addActor(walker);

    return {world, cast: {walker}};
  },
  look(id) {
    switch (id) {
      case 'walker':
        // Not the ice's pale blue: the last thing this strip shows is the
        // walker sliding across the ice, and it has to be visible doing it.
        return {width: 14, height: 14, color: '#e06c75'};
      // A belt reads as a belt by being a different color from the ground it
      // is part of; ice reads as ice by being the pale one.
      case 'belt':
        return {width: 56, height: 16, color: '#c98b3a'};
      case 'ice':
        return {width: 80, height: 16, color: '#8fc7e8'};
      case 'wall':
        return {width: 8, height: 80, color: '#5a7d5a'};
      default:
        return {width: 48, height: 16, color: '#5a7d5a'};
    }
  },
};
