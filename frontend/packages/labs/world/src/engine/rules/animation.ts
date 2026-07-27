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
import type {AnimationDef} from '../core/animationTypes';
import {APPEARANCE} from '../core/spatialKeys';

import {PositionalTrait, SpatialRule} from './spatial';

const rule = new RuleBuilder({id: APPEARANCE.rule, name: 'Has Appearance'});
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
export const FrameProperty = AppearanceTrait.addProperty(
  APPEARANCE.frame,
  'number',
  0,
);
const ElapsedProperty = AppearanceTrait.addProperty(
  APPEARANCE.elapsed,
  'number',
  0,
);
const DoneProperty = AppearanceTrait.addProperty(
  APPEARANCE.done,
  'boolean',
  false,
);
// The animation currently playing, to detect when the selection changes.
const PlayingProperty = AppearanceTrait.addProperty(
  APPEARANCE.playing,
  'string',
  '',
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

export const AdvanceAnimationStep = rule.addStep(
  'advanceAnimation',
  (world, delta) => {
    for (const actor of world.actors.with(AppearanceTrait)) {
      const id = actor.get(AnimationProperty);
      // Selecting a different animation (or clearing it) restarts frame state.
      if (id !== actor.get(PlayingProperty)) {
        actor.set(PlayingProperty, id);
        actor.set(FrameProperty, 0);
        actor.set(ElapsedProperty, 0);
        actor.set(DoneProperty, false);
      }
      if (!id || actor.get(DoneProperty)) {
        continue;
      }
      const def = world.animation(id);
      if (!def || def.frames.length === 0) {
        continue;
      }
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

// ── Stock animations ─────────────────────────────────────────────────────────
// Backed by the self-hosted vendor spritesheets (`public/vendor/sprites/`); the
// frame cells index a uniform horizontal strip of `CELL`-sized frames. Cell size
// and frame counts mirror the driver's asset manifest (`src/sprites.ts`); a test
// keeps them in sync.
const CELL = 32;

/** A looping animation over a uniform horizontal spritesheet strip. */
function strip(
  sprite: string,
  frames: number,
  frameRate: number,
  name: string,
): AnimationDef {
  return {
    name,
    loop: true,
    frames: Array.from({length: frames}, (_unused, i) => ({
      sprite,
      position: {x: i * CELL, y: 0, width: CELL, height: CELL},
      delay: 1000 / frameRate,
    })),
  };
}

rule.addAnimation('coinSpin', strip('coinSpin', 6, 12, 'Coin Spin'));
rule.addAnimation('playerWalk', strip('playerWalk', 4, 8, 'Player Walk'));

export const AnimationRule = rule.build();
