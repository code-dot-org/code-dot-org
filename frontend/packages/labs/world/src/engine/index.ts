// The `world-lab` public surface — what a learner imports. Inside the sandbox
// the compiler marks `world-lab` external and the preview resolves it to this
// module (see specs/PLAN.md §7). It exposes the builders, the Vector value type,
// the engine's value-object types, and the standard rule library.

// Builders (INTERFACE.md).
export {RuleBuilder} from './builders/RuleBuilder';
export {WorldBuilder, type WorldMap} from './builders/WorldBuilder';
export {ActorBuilder, FOUNDATION_TRAIT_IDS} from './builders/ActorBuilder';

// Core value type and runtime classes.
export {Vector, type VectorLike} from './core/Vector';
// The scale between rates and positions, reachable from blocks as `pixels per
// unit` — the rule that converts is authored (rules/stock/motion).
export {PIXELS_PER_UNIT} from './core/units';
export {Trait} from './core/Trait';
export {Actor, type ActorInit} from './core/Actor';
// One actor or several, and what an operation means when it is several
// (specs/ACTOR_LISTS.md). Generated code routes through these.
// Lists of plain values — numbers, words, places (specs/LISTS.md). Generated
// code routes through these the way it routes actor values through the two
// below: what a list operation MEANS is one place rather than in every block.
export {
  addTo,
  addToFront,
  items,
  lastOf,
  listHas,
  takeFirst,
} from './core/lists';
export {
  all,
  each,
  anyOf,
  extreme,
  filtered,
  firstOf,
  firstWhere,
  isSameActor,
  LazyActors,
  one,
  ordered,
  pushed,
  taken,
  type ActorSource,
  type ActorValue,
} from './core/actorValue';
// A value said as words — a list joins with one space (`core/textValue`).
export {text} from './core/textValue';
export {
  World,
  DEFAULT_BACKDROP_COLOR,
  STOP_ALL_SOUNDS,
  type SoundCue,
  type WorldInit,
  type RenderState,
  type BackdropState,
  type DrawingState,
  type WorldSnapshot,
} from './core/World';
// What a drawing routine says (specs/DRAWING.md). The driver reads the
// commands; generated `.actor` code calls the pen.
export {
  TEXT_ANCHORS,
  type DrawCommand,
  type Pen,
  type TextAnchor,
} from './core/drawing';
export {Scheduler} from './core/Scheduler';
export {EventQueue} from './core/EventQueue';
export {DependencySet} from './core/traits';

// Value-object shapes.
export type {
  ActionParam,
  AppliedEffectSpec,
  ArgType,
  Property,
  PropertyType,
  WorldAction,
  ActorAction,
  Query,
  WorldQuery,
  GameEvent,
  EventHandler,
  Step,
  StepOrder,
  StepFn,
  Rule,
} from './core/types';

// The standard rule library (Spatial → Motion → Collision → Gravity → Input →
// Animation).
export * from './rules/spatial';
export * from './rules/animation';

// The animation serialization model.
export type {
  AnimationDef,
  AnimationFrame,
  Cell,
  FrameState,
} from './core/animationTypes';
// How long a frame is held — exported because the editor's preview has to play
// an animation by the same rule the engine steps it by.
export {DEFAULT_FRAME_DELAY, frameDelay} from './core/animationTypes';
export {parseAnimationFile, type AnimationFile} from './core/animationFile';

// Color conversion for effect parameters: the generated `add effect` call
// wraps whatever a color block produced, so any of them can drive a uniform.
export {rgb, rgba, toHex, type Rgb, type Rgba} from './core/color';
export {
  advanceTween,
  beginTween,
  isTweenable,
  tweenDisplaced,
  tweenValue,
  type Curve,
  type Tweenable,
  type TweenPlan,
  type TweenRun,
  type TweenStep,
} from './core/tween';
