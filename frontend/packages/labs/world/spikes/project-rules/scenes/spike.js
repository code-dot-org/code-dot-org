// The spike entry: a JS scene that runs the PROJECT gravity rule end to end. A
// player affected by it falls and lands on a ground defined via the same project
// rule's GroundTrait — the traits are imported FROM rules/gravity, so their
// object identity matches the rule the world runs (the load-bearing constraint:
// a built-in trait object would not be seen by a project rule's steps).
//
// To run: add rules/gravity.js + this file to DEFAULT_PROJECT (a `rules` folder
// and a `scenes/spike.js` entry) and set ENTRY_FILE = 'scenes/spike.js'. Revert
// after — this lives in spikes/, not the shipped default project.

import {
  SceneBuilder,
  WorldBuilder,
  ActorBuilder,
  SpatialRule,
  MotionRule,
  CollisionRule,
  AnimationRule,
  AppearanceTrait,
  SolidTrait,
  SpriteProperty,
  PositionProperty,
  Vector,
} from 'world-lab';
import GravityRule, {
  AffectedByGravityTrait,
  GroundTrait,
  StartsFallingEvent,
  StopsFallingEvent,
} from 'rules/gravity';

const scene = new SceneBuilder({id: 'spike', name: 'Spike'});
scene.useWorld(
  new WorldBuilder({id: 'spikeWorld', name: 'Spike World'}).useRules([
    SpatialRule,
    MotionRule,
    CollisionRule,
    AnimationRule,
    GravityRule,
  ]),
);

const player = scene.addActor(
  new ActorBuilder({id: 'player', name: 'Player'})
    .useTraits([AffectedByGravityTrait, AppearanceTrait])
    .set(SpriteProperty, 'player'),
  'player',
  'actors/player',
);
player.set(PositionProperty, new Vector(240, 60));
player.on(StartsFallingEvent, () =>
  console.log('[spike] project gravity: started falling'),
);
player.on(StopsFallingEvent, () =>
  console.log('[spike] project gravity: landed'),
);

scene
  .addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait, SolidTrait, AppearanceTrait])
      .set(SpriteProperty, 'ground'),
    'ground',
    'actors/ground',
  )
  .set(PositionProperty, new Vector(240, 420));

export default scene;
