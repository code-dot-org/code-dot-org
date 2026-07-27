// The `world-lab` public surface — what a learner imports. Inside the sandbox
// the compiler marks `world-lab` external and the preview resolves it to this
// module (see specs/PLAN.md §7). It exposes the builders, the Vector value type,
// the engine's value-object types, and the standard rule library.

// Builders (INTERFACE.md).
export {RuleBuilder} from './builders/RuleBuilder';
export {WorldBuilder} from './builders/WorldBuilder';
export {ActorBuilder} from './builders/ActorBuilder';
export {SceneBuilder, type SceneMap} from './builders/SceneBuilder';

// Core value type and runtime classes.
export {Vector, type VectorLike} from './core/Vector';
export {Trait} from './core/Trait';
export {Actor, type ActorInit} from './core/Actor';
export {World, type WorldInit} from './core/World';
export {Scheduler} from './core/Scheduler';
export {EventQueue} from './core/EventQueue';
export {DependencySet} from './core/traits';

// Value-object shapes.
export type {
  Property,
  PropertyType,
  WorldAction,
  ActorAction,
  Query,
  GameEvent,
  EventHandler,
  Step,
  StepOrder,
  StepFn,
  Rule,
} from './core/types';

// The standard rule library (Spatial → Motion → Collision → Gravity).
export * from './rules/spatial';
export * from './rules/motion';
export * from './rules/collision';
export * from './rules/gravity';
