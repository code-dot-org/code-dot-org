// "Holds Things" — a bag, and the difference between having and having had.
//
// A walker crosses a key and a door. The key goes into the bag, the count goes
// up, the door opens, and the count goes back down — which is the whole of
// what this rule adds, and the half a record cannot do. Collection's own demo
// shows coins being taken and never anything being spent, because nothing
// could be until this.
//
// THE COUNT IS DRAWN because a bag is invisible. Two boxes and a number is the
// smallest thing that says "you have one" and then "you had one" — and it is
// counted the way a project counts one, with `how many ⟨Key⟩ in ⟨the bag⟩`
// rather than with anything of the rule's own.
//
// Both handlers are the project's half: Collection says a thing was picked up,
// this says it is worth keeping, and the door decides what a key is for
// (`rules/inventory`).

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** The kind of thing being carried, as a map or a dropdown names it. */
const KEY = 'actors/key';

/** Set by `build`, read by `look` — the bag is the walker's. */
let walkerOf: unknown;
let bagOf: unknown;

export const inventoryDemo: RuleDemo = {
  rules: [
    'rules/motion',
    'rules/collisions',
    'rules/collect',
    'rules/inventory',
  ],
  // The door opens at about 1.6 seconds; the rest is long enough to read the
  // count going back down and no longer.
  seconds: 2.1,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    bagOf = of('rules/inventory', 'ThingsProperty');
    const world = demoWorld('inventory', modules, inventoryDemo.rules);

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/collect', 'CollectsTrait'),
        of('rules/inventory', 'CarriesTrait'),
      ])
      .set(PositionProperty, new Vector(24, 88))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(0.62, 0))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .instantiate('walker');
    walkerOf = walker;
    // Picked up off the floor by Collection, and kept by this rule. One line,
    // and it is the line that makes the two rules one idea.
    walker.on(
      of('rules/collect', 'CollectsEvent'),
      (_world: unknown, _actor: unknown, item: unknown) => {
        walker.act(of('rules/inventory', 'TakesAction'), item as never);
      },
    );
    walker.on(
      of('rules/collisions', 'StartsTouchingEvent'),
      (_world: unknown, _actor: unknown, other: unknown) => {
        const door = other as {id: string};
        if (
          door.id === 'door' &&
          (walker.query(of('rules/inventory', 'HasAQuery'), KEY) as boolean)
        ) {
          walker.act(of('rules/inventory', 'SpendsAAction'), KEY as never);
          world.removeActor(door as never);
        }
      },
    );
    world.addActor(walker);

    world.addActor(
      new ActorBuilder({id: 'key', name: 'key'})
        .useTraits([
          of('rules/collect', 'CanBeCollectedTrait'),
          of('rules/inventory', 'CanBeCarriedTrait'),
        ])
        .set(PositionProperty, new Vector(74, 88))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(12, 12))
        // The KIND is what the bag sorts by, so the demo's key is instantiated
        // as one rather than merely called one.
        .instantiate('key', KEY),
    );
    world.addActor(
      new ActorBuilder({id: 'door', name: 'door'})
        .useTraits([of('rules/collisions', 'CanCollideTrait')])
        .set(PositionProperty, new Vector(140, 88))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 32))
        .instantiate('door'),
    );
    world.addActor(
      new ActorBuilder({id: 'tally', name: 'tally'})
        .set(PositionProperty, new Vector(96, 36))
        .instantiate('tally'),
    );

    return {world, cast: {walker}};
  },
  look(id: string) {
    if (id === 'tally') {
      // Read off the bag every frame, because the bag is the only place it
      // lives — the same bargain the health demo makes with health.
      const held = (
        (walkerOf as {get(p: unknown): unknown}).get(bagOf as never) as Array<{
          type: string;
        }>
      ).filter(item => item.type === KEY).length;
      return {
        width: 0,
        height: 0,
        color: '#abb2bf',
        text: `KEYS ${held}`,
        textScale: 2,
      };
    }
    if (id === 'key') {
      return {width: 12, height: 12, color: '#f6c453'};
    }
    return id === 'door'
      ? {width: 16, height: 32, color: '#5c6370'}
      : {width: 16, height: 16, color: '#61afef'};
  },
};
