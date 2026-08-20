// The camera family, filmed on one stage.
//
// Four rules whose entire effect is on the VIEW, so every strip is the same
// walker crossing the same posts and each difference is wholly in how the
// picture moves. Read side by side: Follow pins the walker to the middle of
// the frame, Ease lets it run ahead and drift back, Deadzone holds the view
// still until the walker has actually gone somewhere, and Confined stops at
// the map's edge and lets the walker walk away from centre.
//
// THE MAP IS TWICE THE FRAME in all of them, because a camera panning across a
// world no larger than the picture pans across nothing — which is why the
// recorder learned to see through the camera at all (specs/RULE_DEMOS.md).
//
// The posts are the other half. A followed actor is motionless on screen by
// definition, so with nothing else in the world the recording is one box
// sitting still: what moves is the world going past it.

import {ActorBuilder, PositionProperty, Vector} from '../../engine';

import {demoWorld, type RuleDemo, type RuleModules} from './types';

/**
 * The map: twice the frame across, and as tall as the ENGINE's viewport.
 *
 * The width is what makes a pan possible. The height is for Camera Confined
 * alone, and is the one place where these demos have to know that the frame
 * and the engine's viewport are different rectangles: confinement keeps the
 * VIEWPORT inside the map, so a map shorter than the viewport has no legal
 * vertical position at all and the rule pins the camera somewhere the demo
 * never meant. Ten tiles is that viewport (engine/core/viewport), so the
 * clamp is satisfied and the vertical stays where every other demo puts it.
 */
const TILES = {columns: 12, rows: 10};

/** Where the walker walks, and where the scenery stands: middle of the map. */
const WALK_Y = 160;
const POST_Y = 196;

/** Scenery, spread the length of the map, so a pan has something to measure. */
const POSTS = [20, 90, 160, 230, 300, 370];

const SECONDS = 2.5;

interface Stage {
  /** The camera traits beyond Follows, as `[module, trait]`. */
  readonly also?: ReadonlyArray<readonly [string, string]>;
  /** Where the walker starts, in pixels from the left of the map. */
  readonly from: number;
  /** How fast it goes, in units a second (a unit is a hundred pixels). */
  readonly speed: number;
  /** Anything the extra trait needs told, once the camera exists. */
  readonly tune?: (
    set: (path: string, name: string, value: unknown) => void,
  ) => void;
}

/**
 * A demo of one camera rule: the shared stage, plus that rule's trait.
 *
 * Every one of them also elects Follows, because the camera rules divide into
 * one that decides where to look and three that adjust the answer. Ease,
 * Deadzone and Confined all rewrite a goal somebody else set; on a camera with
 * nothing aiming it they each adjust the place it is already looking at, which
 * demonstrates nothing.
 */
const cameraDemo = (id: string, module: string, stage: Stage): RuleDemo => ({
  rules: [
    'rules/motion',
    'rules/camera',
    'rules/cameraFollow',
    ...(module === 'rules/cameraFollow' ? [] : [module]),
  ],
  seconds: SECONDS,
  tiles: TILES,
  // The posts exist to be left behind; the walker is the demonstration.
  filmed: ['walker'],
  build(modules: RuleModules) {
    const of = (path: string, name: string) => modules[path][name] as never;
    const world = demoWorld(id, modules, this.rules, TILES);

    const walker = new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([of('rules/motion', 'CanMoveTrait')])
      .set(PositionProperty, new Vector(stage.from, WALK_Y))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(stage.speed, 0))
      .instantiate('walker');
    world.addActor(walker);

    POSTS.forEach((x, n) =>
      world.addActor(
        new ActorBuilder({id: `post${n}`, name: 'post'})
          .set(PositionProperty, new Vector(x, POST_Y))
          .instantiate(`post${n}`),
      ),
    );

    world.defineCamera({
      id: 'view',
      traits: [
        of('rules/cameraFollow', 'FollowsTrait'),
        ...(stage.also ?? []).map(([path, trait]) => of(path, trait)),
      ],
      // Starting on the walker, so a strip opens on the state the rule is
      // about rather than on the camera hurrying to catch up.
      position: new Vector(stage.from, WALK_Y),
    });
    world.setActiveCamera('view');
    const camera = world.camera('view');
    const set = (path: string, name: string, value: unknown) =>
      camera.set(of(path, name), value as never);
    set('rules/cameraFollow', 'ActorToFollowProperty', walker);
    stage.tune?.(set);

    return {world, cast: {walker, camera}};
  },
  look(id: string) {
    return id === 'walker'
      ? {width: 16, height: 16, colour: '#61afef'}
      : // The scenery green the other demos use for what does not move.
        {width: 12, height: 36, colour: '#5a7d5a'};
  },
});

/** "Follows an Actor" — the view goes where the player goes, at once. */
export const cameraFollowDemo = cameraDemo(
  'cameraFollow',
  'rules/cameraFollow',
  {from: 60, speed: 1},
);

/**
 * "Eases the Camera" — the view catches up instead of snapping.
 *
 * Smoothness is the fraction of the gap closed each frame at sixty frames a
 * second, so a small one lags: at 0.05 a walker moving a hundred pixels a
 * second settles about a third of the way toward the right edge and stays
 * there, which is a lag you can see in a still frame rather than one you have
 * to believe.
 */
export const cameraEaseDemo = cameraDemo('cameraEase', 'rules/cameraEase', {
  also: [['rules/cameraEase', 'EasesTrait']],
  from: 60,
  speed: 1,
  tune: set => set('rules/cameraEase', 'SmoothnessProperty', 0.05),
});

/**
 * "Ignores Small Movements" — the view holds until the walker leaves the box.
 *
 * The slack is the default forty-eight pixels, so the first half-second is a
 * walker crossing a motionless picture and everything after it is the picture
 * travelling with the walker held that far off centre.
 */
export const cameraDeadzoneDemo = cameraDemo(
  'cameraDeadzone',
  'rules/cameraDeadzone',
  {also: [['rules/cameraDeadzone', 'HasADeadzoneTrait']], from: 60, speed: 1},
);

/**
 * "Keeps the View in the Map" — the view stops at the edge and the walker goes on.
 *
 * Started to the right of the map and walking slowly, so the recording is
 * about two parts pan to three parts stopped: long enough at the start to
 * establish that the view does move, and long enough at the end to show the
 * posts frozen while the walker keeps travelling through them, which is the
 * whole promise of the rule.
 */
export const cameraConfinedDemo = cameraDemo(
  'cameraConfined',
  'rules/cameraConfined',
  {
    also: [['rules/cameraConfined', 'ConfinedToTheMapTrait']],
    from: 180,
    speed: 0.4,
  },
);
