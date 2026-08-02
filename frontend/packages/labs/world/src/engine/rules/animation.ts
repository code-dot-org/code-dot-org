// The Animation rule ("Has Appearance") — governs how an Actor looks
// (INTERFACE.md §Animations). An Actor elects the appearance trait and sets a
// static `sprite` or a named `animation`; the rule advances the animation's
// current frame each tick by the frame's `delay` and emits `AnimationEnded` when
// a non-looping animation finishes. `World.renderSnapshot` reads the resulting
// frame; the driver draws it. The engine owns timing and events — not Phaser.
//
// Frame stepping is deterministic (a pure function of accumulated `delta` and
// the animation's per-frame delays), so it is snapshot-visible and unit-tested
// without a browser, like every other rule.

import {RuleBuilder} from '../builders/RuleBuilder';
import type {Actor} from '../core/Actor';
import type {AnimationDef} from '../core/animationTypes';
import {APPEARANCE} from '../core/spatialKeys';
import type {Property} from '../core/types';
import {Vector} from '../core/Vector';

import {IntrinsicSizeProperty, PositionalTrait, SpatialRule} from './spatial';

const rule = new RuleBuilder({
  id: APPEARANCE.rule,
  name: 'Appearance',
  ability: 'Has Appearance',
});
rule.requires([SpatialRule]);

export const AppearanceTrait = rule.addTrait({
  id: APPEARANCE.trait,
  name: 'Has Appearance',
});
// Drawing needs a place to draw.
AppearanceTrait.requires([PositionalTrait]);

/** A static sprite to draw (empty = none); an `animation` takes precedence. */
export const SpriteProperty = AppearanceTrait.addProperty(
  APPEARANCE.sprite,
  'string',
  '',
  {name: 'sprite'},
);

/** The animation to play — an id known to the world (empty = none). */
export const AnimationProperty = AppearanceTrait.addProperty(
  APPEARANCE.animation,
  'string',
  '',
  {name: 'animation'},
);

// Per-actor runtime state, written by the step. Internal to the rule, but stored
// as properties so they live in the actor's one state store (and snapshots).
// `readonly` marks them step-owned: not learner inputs, so world-authoring tools
// (the map editor) skip them.
export const FrameProperty = AppearanceTrait.addProperty(
  APPEARANCE.frame,
  'number',
  0,
  {readonly: true},
);
const ElapsedProperty = AppearanceTrait.addProperty(
  APPEARANCE.elapsed,
  'number',
  0,
  {readonly: true},
);
const DoneProperty = AppearanceTrait.addProperty(
  APPEARANCE.done,
  'boolean',
  false,
  {readonly: true},
);
// The animation currently playing, to detect when the selection changes.
const PlayingProperty = AppearanceTrait.addProperty(
  APPEARANCE.playing,
  'string',
  '',
  {readonly: true},
);
// A pending "play this animation now" request, raised by `playAnimation` and
// consumed by the step. It lets a replay of the *same* animation restart it —
// a selection change alone (`id !== PlayingProperty`) cannot express that.
const RestartRequestedProperty = AppearanceTrait.addProperty(
  APPEARANCE.restart,
  'boolean',
  false,
  {readonly: true},
);

/** Emitted once when a non-looping animation reaches its last frame. */
export const AnimationEndedEvent = rule.addEvent('animationEnded', {
  name: 'animation ends',
});

/**
 * Emitted each time an animation advances to a new frame, carrying that frame's
 * index as the event detail — so a handler can react to a specific frame (a
 * footstep, a hit frame). The learner reads the detail via the event value.
 */
export const FrameChangedEvent = rule.addEvent('frameChanged', {
  name: 'animation frame changes',
});

/**
 * Set the actor's `IntrinsicSizeProperty` to the largest cell in `def` — a
 * stable, frame-independent box. Leaves it untouched when no frame carries a
 * cell (a single image), so it stays `(0, 0)` = "unknown" and Collision falls
 * back to its default box.
 */
function publishIntrinsicSize(actor: Actor, def: AnimationDef): void {
  let width = 0;
  let height = 0;
  for (const frame of def.frames) {
    if (frame.position) {
      width = Math.max(width, frame.position.width);
      height = Math.max(height, frame.position.height);
    }
  }
  if (width > 0 && height > 0) {
    actor.set(IntrinsicSizeProperty, new Vector(width, height));
  }
}

export const AdvanceAnimationStep = rule.addStep(
  'advanceAnimation',
  (world, delta) => {
    for (const actor of world.actors.with(AppearanceTrait)) {
      const id = actor.get(AnimationProperty);
      const def = id ? world.animation(id) : undefined;
      // A replay was requested via `playAnimation` (consume it either way).
      const requested = actor.get(RestartRequestedProperty);
      if (requested) {
        actor.set(RestartRequestedProperty, false);
      }
      // Restart frame state when the selection changed — or when a replay of the
      // *same* animation was requested and that animation is non-looping. A
      // looping animation is already cycling, so replaying it leaves it be
      // (avoids a visible hitch); a non-looping one has stopped, so replaying it
      // starts it over. `world.animation` is missing until the id resolves, so
      // treat unknown ids as looping (the default) and let the guards below skip.
      const looping = def ? (def.loop ?? true) : true;
      const changed = id !== actor.get(PlayingProperty);
      if (changed || (requested && !looping)) {
        actor.set(PlayingProperty, id);
        actor.set(FrameProperty, 0);
        actor.set(ElapsedProperty, 0);
        actor.set(DoneProperty, false);
      }
      if (!id || actor.get(DoneProperty)) {
        continue;
      }
      if (!def || def.frames.length === 0) {
        continue;
      }
      // Publish this actor's intrinsic bounding size for Collision to default
      // its box to (spatial trait). Use the largest frame cell so the box is
      // stable across frames rather than pulsing with the animation; frames
      // without a cell (a whole single image) contribute nothing, since the
      // engine cannot know their pixel size.
      publishIntrinsicSize(actor, def);
      const loop = def.loop ?? true;
      const last = def.frames.length - 1;
      let frame = actor.get(FrameProperty);
      let elapsed = actor.get(ElapsedProperty) + delta * 1000;
      // Cross as many frame boundaries as `elapsed` allows. A non-positive or
      // infinite delay holds the frame (a static one-frame sprite never advances).
      for (;;) {
        const {delay} = def.frames[frame];
        if (!Number.isFinite(delay) || delay <= 0 || elapsed < delay) {
          break;
        }
        elapsed -= delay;
        if (frame < last) {
          frame += 1;
        } else if (loop) {
          frame = 0;
        } else {
          elapsed = 0;
          actor.set(DoneProperty, true);
          world.emit(AnimationEndedEvent, actor);
          break;
        }
        // The frame changed; report it (detail = the new frame index).
        world.emit(FrameChangedEvent, actor, frame);
      }
      actor.set(FrameProperty, frame);
      actor.set(ElapsedProperty, elapsed);
    }
  },
);

/** Anything the `playAnimation` routine can drive: an Actor or its ActorBuilder. */
interface AnimationTarget {
  set<T>(property: Property<T>, value: T): unknown;
}

/**
 * Play an animation on an actor, restarting it from the first frame. Selecting a
 * different animation restarts it anyway (the step notices the change); this
 * also restarts a *replay* of the same, non-looping animation — one that has run
 * to its held last frame plays again. (Written by the `play animation` block.)
 *
 * Works on a live Actor (in an event handler) and on an ActorBuilder (in an
 * `.actor` setup body): both `set` the same properties, so the initial play and
 * a runtime replay share one routine.
 */
export function playAnimation(target: AnimationTarget, id: string): void {
  target.set(AnimationProperty, id);
  target.set(RestartRequestedProperty, true);
}

// ── Stock animations ─────────────────────────────────────────────────────────
// Backed by the self-hosted vendor spritesheets (`public/vendor/sprites/`); the
// frame cells index a uniform horizontal strip of `CELL`-sized frames. Cell size
// and frame counts mirror the driver's asset manifest (`src/sprites.ts`); a test
// keeps them in sync.
const CELL = 32;

/**
 * An animation over a uniform horizontal spritesheet strip. Loops by default; a
 * non-looping strip (e.g. a switch) plays once, holds its last frame, and emits
 * `AnimationEnded`.
 */
function strip(
  sprite: string,
  frames: number,
  frameRate: number,
  name: string,
  loop = true,
): AnimationDef {
  return {
    name,
    loop,
    frames: Array.from({length: frames}, (_unused, i) => ({
      sprite,
      position: {x: i * CELL, y: 0, width: CELL, height: CELL},
      delay: 1000 / frameRate,
    })),
  };
}

rule.addAnimation('coinSpin', strip('coinSpin', 6, 12, 'Coin Spin'));
rule.addAnimation('playerWalk', strip('playerWalk', 4, 8, 'Player Walk'));
// A switch flips from one side to the other on activation, then holds — so it
// plays once (loop = false) rather than cycling.
rule.addAnimation('switch', strip('switch', 6, 12, 'Switch', false));

export const AnimationRule = rule.build();
