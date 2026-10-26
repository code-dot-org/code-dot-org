// "Has Switches" — one thing walked over, two things changed.
//
// The pair of walls is the demonstration rather than a saving. A switch with
// one wall could only open it or close it, and what a room actually wants is a
// corridor that SWAPS: the way you came in shuts as the way on opens. Two walls
// of the switch's color, in opposite states, say that in one frame.
//
// The walls are drawn from what they hold rather than from a color this demo
// chose: `passes through things` is the property the rule flips, so an open
// wall is drawn hollow and a closed one solid, and the picture cannot disagree
// with the rule about which is which.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** Set by `build`, read by `look` — what the rule flips, and what it says. */
let passable: unknown;
let wallColor: unknown;

export const switchesDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/collisions', 'rules/solid', 'rules/switches'],
  seconds: 2.5,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    passable = of('rules/collisions', 'PassesThroughThingsProperty');
    wallColor = of('rules/switches', 'WallColorProperty');
    const world = demoWorld('switches', modules, switchesDemo.rules);
    const color = '#e0484a';

    [false, true].forEach((open, index) => {
      const wall = new ActorBuilder({id: `wall${index}`, name: 'wall'})
        .useTraits([
          of('rules/switches', 'IsASwitchedWallTrait'),
          of('rules/solid', 'SolidTrait'),
        ])
        .set(PositionProperty, new Vector(112 + index * 48, 64))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(20, 64))
        .instantiate(`wall${index}`);
      wall.set(wallColor as never, color as never);
      wall.set(passable as never, open as never);
      world.addActor(wall);
    });

    const pad = new ActorBuilder({id: 'pad', name: 'switch'})
      .useTraits([of('rules/switches', 'IsASwitchTrait')])
      .set(PositionProperty, new Vector(56, 64))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(24, 24))
      .instantiate('pad');
    pad.set(of('rules/switches', 'SwitchColorProperty'), color as never);
    world.addActor(pad);

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/collisions', 'CanCollideTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(of('rules/collisions', 'SizeProperty'), new Vector(14, 14))
      .set(PositionProperty, new Vector(14, 64))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.55, 0))
      .instantiate('walker');
    world.addActor(walker);

    return {world, cast: {walker}};
  },
  look(id, actor) {
    if (id === 'walker') {
      return {width: 14, height: 14, color: '#61afef'};
    }
    if (id === 'pad') {
      return {width: 24, height: 24, color: '#e0484a'};
    }
    // Open walls are drawn faint and closed ones solid, from the property the
    // rule actually flips — so what the strip shows is what the rule did.
    const open = (actor as {get(p: unknown): boolean}).get(passable as never);
    const said = (actor as {get(p: unknown): string}).get(wallColor as never);
    return {
      width: 20,
      height: 64,
      color: open ? '#4a2224' : said || '#e0484a',
    };
  },
};
