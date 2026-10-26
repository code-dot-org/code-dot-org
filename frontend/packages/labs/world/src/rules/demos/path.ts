// "Finds a Way" — the step that is not toward.
//
// A walker on the left, a mark on the right, and a wall between them with a gap
// under it. The walker never heads straight at the mark: it goes DOWN first,
// round the end of the wall, and only then across — which is the whole rule in
// one line and the one thing Steering cannot do. A strip of a chaser walking
// into a wall and a strip of one going round it look nothing alike, and that is
// the demonstration.
//
// The mark is a plain actor with no abilities at all: what is chased does not
// have to know it is being chased.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/** The wall's column, and how far down it reaches — the gap is under it. */
const WALL_X = 96;
const WALL_ROWS = [16, 48, 80];

export const pathDemo: RuleDemo = {
  rules: ['rules/motion', 'rules/solid', 'rules/path'],
  // Long enough to get round the end of the wall and start back up the far
  // side, which is the frame where the detour reads as a detour.
  seconds: 2.6,
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld('path', modules, pathDemo.rules);

    for (const y of WALL_ROWS) {
      world.addActor(
        new ActorBuilder({id: `wall${y}`, name: 'wall'})
          .useTraits([of('rules/solid', 'SolidTrait')])
          .set(PositionProperty, new Vector(WALL_X, y))
          .instantiate(`wall${y}`),
      );
    }

    const mark = world.addActor(
      new ActorBuilder({id: 'mark', name: 'mark'})
        .set(PositionProperty, new Vector(160, 24))
        .instantiate('mark'),
    );

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([of('rules/path', 'FindsAWayTrait')])
      .set(PositionProperty, new Vector(24, 24))
      .set(of('rules/path', 'GoingToProperty'), [mark])
      // Its own thinking, faster than the half-second default: a strip is two
      // and a half seconds long, and a walker that thought five times in it
      // would turn corners in visible steps.
      .set(of('rules/path', 'ThinkEveryProperty'), 0.12)
      .set(of('rules/path', 'StepSizeProperty'), 32)
      .set(of('rules/path', 'HowFarToLookProperty'), 8)
      .instantiate('walker');
    world.addActor(walker);

    return {world, cast: {walker, mark}};
  },
  look(id: string) {
    if (id.startsWith('wall')) {
      return {width: 30, height: 30, color: '#5c6370'};
    }
    return id === 'mark'
      ? {width: 16, height: 16, color: '#98c379'}
      : {width: 18, height: 18, color: '#c678dd'};
  },
};
