// The Animation rule ("Has Appearance") — governs how an Actor looks
// (INTERFACE.md §Animations; specs/ANIMATION_PLAN.md). Every actor that is
// drawn has the appearance trait, with a still `sprite` or a named
// `animation` playing: one of its KIND's own, a timeline of keyframes
// (`core/keyframes`). Each tick the rule advances it and sets what each of
// its tracks says — the picture, where the picture is drawn against the
// actor, how solid, which effects — and emits `AnimationEnded` when one that
// does not loop finishes. `World.renderSnapshot` reads the result; the driver
// draws it. The engine owns timing and events — not Phaser.
//
// Deterministic (a pure function of accumulated `delta` and the timeline), so
// it is snapshot-visible and unit-tested without a browser, like every other
// rule.

import {RuleBuilder} from '../builders/RuleBuilder';
import type {Actor} from '../core/Actor';
import type {Cell} from '../core/animationTypes';
import {timeIn, valueAt, type Timeline} from '../core/keyframes';
import {APPEARANCE} from '../core/spatialKeys';
import type {Property} from '../core/types';
import {Vector} from '../core/Vector';
import {fitToTile} from '../core/viewport';
import type {World} from '../core/World';

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
  description: 'Is drawn with a sprite, and can play its animations.',
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

/**
 * How solid this actor is drawn: 1 is opaque, 0 is invisible.
 *
 * FOUNDATION, not a trait. It sits beside `scale` and `rotation` in the same
 * sense — a thing that can be drawn can be drawn faintly, and asking an actor
 * to elect "Can Fade" before it may be half-visible would be electing a fact
 * rather than an ability. It is on APPEARANCE rather than the positional
 * foundation because it is about drawing, which is exactly the line a Camera
 * falls on the other side of.
 *
 * FADING IS NOT HERE. This is the value; moving it over time is a tween's
 * business, and several rules already hand-roll that arithmetic
 * (`cameraEase`'s note on why a per-frame fraction is frame-rate dependent is
 * the clearest statement of it).
 */
export const OpacityProperty = AppearanceTrait.addProperty(
  APPEARANCE.opacity,
  'number',
  1,
  {name: 'opacity'},
);

/**
 * Which cell of a spritesheet {@link SpriteProperty} draws.
 *
 * Two vectors rather than one rectangle, because a rectangle is not a property
 * type and these are: where the cell starts, and how big it is. A size of
 * (0, 0) — the default — means the whole image, which is what a picture is.
 *
 * The rectangle, never a grid: the engine has no idea what a spritesheet is
 * (INTERFACE.md §Animations). The editor knows the `.sheet` and resolves a
 * chosen cell to these numbers when it generates the code, exactly as an
 * animation frame carries the rectangle it draws.
 *
 * `readonly` keeps them out of the world-authoring tools' property lists: they
 * are half of `set sprite`, not a field to fill in on their own.
 */
export const SpriteCellOriginProperty = AppearanceTrait.addProperty(
  APPEARANCE.spriteCellOrigin,
  'vector',
  new Vector(0, 0),
  {readonly: true},
);
export const SpriteCellSizeProperty = AppearanceTrait.addProperty(
  APPEARANCE.spriteCellSize,
  'vector',
  new Vector(0, 0),
  {readonly: true},
);

/**
 * Where the picture is drawn, against the actor's own position — an offset
 * in world pixels, which an animation moves (a bob, a shake) while the rule
 * that moves the actor goes on moving it (specs/ANIMATION_PLAN.md).
 *
 * `readonly`, as the frame is: the animation's to set, and not a field the
 * map editor's inspector offers on every drawn actor.
 */
export const DrawnOffsetProperty = AppearanceTrait.addProperty(
  APPEARANCE.drawnOffset,
  'vector',
  new Vector(0, 0),
  {name: 'drawn offset', readonly: true},
);

/** …how much bigger the picture is drawn than the actor's own scale says. */
export const DrawnScaleProperty = AppearanceTrait.addProperty(
  APPEARANCE.drawnScale,
  'number',
  1,
  {name: 'drawn scale', readonly: true},
);

/** …and how far it is turned past the actor's own turn, in degrees. */
export const DrawnTurnProperty = AppearanceTrait.addProperty(
  APPEARANCE.drawnTurn,
  'number',
  0,
  {name: 'drawn turn', readonly: true},
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
 * Set the actor's `IntrinsicSizeProperty` from the picture it is drawing.
 *
 * FITTED TO A TILE ON THE WAY IN, which is the whole of how that change is
 * made (specs/ACTOR_SIZE.md). The property holds world units rather than the
 * picture's own pixels, so every reader of it — the collision box, "Stays in
 * the Map", `outsideMapAt` — is right without being touched, and cannot drift
 * from what is drawn. The drawing side applies the same factor to the texture
 * (`World.renderSnapshot`).
 *
 * Two answers, and neither needs an animation. A cell says its own size, so a
 * spritesheet frame is measured for free. A whole image does not, so the world
 * is asked — the project measures every image it holds and states them all
 * (`World.imageSize`).
 *
 * Before this, only the spritesheet path below published anything, and its own
 * comment said the engine could not know a single image's pixel size. That was
 * true and is not any more, and it mattered more than it sounds: intrinsic size
 * is what `collision size of` falls back to, so EVERY actor drawing one picture
 * collided as a 32 by 32 square whatever shape it really was.
 */
function publishPictureSize(world: World, actor: Actor): void {
  const cell = actor.get(SpriteCellSizeProperty);
  if (cell.x > 0 && cell.y > 0) {
    const fit = fitToTile(cell.x, cell.y);
    actor.set(IntrinsicSizeProperty, new Vector(cell.x * fit, cell.y * fit));
    return;
  }
  const sprite = actor.get(SpriteProperty);
  const measured = sprite ? world.imageSize(sprite) : undefined;
  if (measured) {
    const fit = fitToTile(measured.width, measured.height);
    actor.set(
      IntrinsicSizeProperty,
      new Vector(measured.width * fit, measured.height * fit),
    );
  }
}

/**
 * Set the actor's `IntrinsicSizeProperty` to the largest cell its animation
 * draws — a stable box, so it does not pulse as the pictures change.
 *
 * Runs after {@link publishPictureSize} and overrides it for an animated
 * actor, which is the right way round: that one reports the cell being drawn
 * NOW. A key naming a whole picture contributes nothing; the engine knows a
 * whole picture's size only by asking, which `publishPictureSize` does.
 */
function publishAnimationSize(actor: Actor, timeline: Timeline): void {
  let width = 0;
  let height = 0;
  for (const key of timeline.tracks.sprite ?? []) {
    const cell = (key.value as {cell?: Cell} | undefined)?.cell;
    if (cell) {
      width = Math.max(width, cell.width);
      height = Math.max(height, cell.height);
    }
  }
  if (width > 0 && height > 0) {
    // The LARGEST cell decides the fit, so a smaller picture draws smaller
    // rather than every one swelling to fill a tile — which is the same
    // reason the largest cell is what the box is measured from.
    const fit = fitToTile(width, height);
    actor.set(IntrinsicSizeProperty, new Vector(width * fit, height * fit));
  }
}

export const AdvanceAnimationStep = rule.addStep(
  'advanceAnimation',
  (world, delta) => {
    for (const actor of world.actors.with(AppearanceTrait)) {
      // Every actor that is drawn at all, before the animation guards below
      // send a picture-only one away — it has a size too.
      publishPictureSize(world, actor);
      const id = actor.get(AnimationProperty);
      // The actor's KIND's animation of that name, kept on the kind
      // (specs/ANIMATION_PLAN.md). There is no other kind of animation.
      const timeline = id ? world.timelineOf(actor, id) : undefined;
      // A replay was requested via `playAnimation` (consume it either way).
      const requested = actor.get(RestartRequestedProperty);
      if (requested) {
        actor.set(RestartRequestedProperty, false);
      }
      // Restart when the selection changed — or when a replay of the SAME
      // animation was requested and that animation does not loop. A loop is
      // already cycling, so replaying it leaves it be (avoids a visible
      // hitch); one that does not loop has stopped, so replaying it starts it
      // over.
      const changed = id !== actor.get(PlayingProperty);
      if (changed || (requested && !timeline?.loop)) {
        actor.set(PlayingProperty, id);
        actor.set(FrameProperty, 0);
        actor.set(ElapsedProperty, 0);
        actor.set(DoneProperty, false);
      }
      if (!timeline || actor.get(DoneProperty)) {
        continue;
      }
      publishAnimationSize(actor, timeline);
      playTimeline(world, actor, timeline, delta);
    }
  },
);

/** A picture a sprite key names: a file, or one cell of one. */
type SpriteKey = string | {sprite: string; cell?: Cell};

/**
 * Advance a timeline animation and set what each of its tracks says now
 * (specs/ANIMATION_PLAN.md, step 2; `core/keyframes`).
 *
 * The frame is which picture the sprite track shows, so `animation frame
 * changes` means what it meant for a flipbook: a new picture. A track that says nothing
 * yet — before its first key — leaves its property as the actor has it.
 */
function playTimeline(
  world: World,
  actor: Actor,
  timeline: Timeline,
  delta: number,
): void {
  const elapsed = actor.get(ElapsedProperty) + delta * 1000;
  const {t, ended} = timeIn(timeline, elapsed / 1000);
  for (const [property, track] of Object.entries(timeline.tracks)) {
    const value = valueAt(track, t);
    if (value === undefined) {
      continue;
    }
    applyTrack(world, actor, property, value);
  }
  // The frame is which PICTURE, counted as they change: a key repeating the
  // one before it — the closing key that gives a flipbook's last picture its
  // time (`core/keyframes`) — is the same frame, and changes nothing.
  const sprites = timeline.tracks.sprite ?? [];
  let frame = -1;
  for (let at = 0; at < sprites.length && sprites[at].at <= t; at++) {
    if (
      at === 0 ||
      JSON.stringify(sprites[at].value) !==
        JSON.stringify(sprites[at - 1].value)
    ) {
      frame += 1;
    }
  }
  // Against the frame before, which a start has just put at 0: so starting
  // says nothing, and every picture after it says which it is.
  if (frame >= 0 && frame !== actor.get(FrameProperty)) {
    world.emit(FrameChangedEvent, actor, frame);
  }
  actor.set(FrameProperty, Math.max(frame, 0));
  // Where it is, not how long it has run: kept small while it loops, so a
  // game left running for an hour is not counting milliseconds a float can
  // no longer tell apart.
  actor.set(ElapsedProperty, t * 1000);
  if (ended) {
    actor.set(DoneProperty, true);
    world.emit(AnimationEndedEvent, actor);
  }
}

/** Set one track's value on the actor. A track nothing knows is left alone. */
function applyTrack(
  world: World,
  actor: Actor,
  property: string,
  value: unknown,
): void {
  if (property.startsWith('effect:')) {
    const path = property.slice('effect:'.length);
    const worn = actor.effects().some(effect => effect.path === path);
    if (value === true && !worn) {
      const effect = world.animationEffect(actor, path);
      if (effect) {
        actor.addEffect(path, effect.document, effect.values);
      }
    } else if (value === false && worn) {
      actor.removeEffect(path);
    }
    return;
  }
  switch (property) {
    case 'sprite': {
      const key = value as SpriteKey;
      const sprite = typeof key === 'string' ? key : key.sprite;
      const cell = typeof key === 'string' ? undefined : key.cell;
      actor.set(SpriteProperty, sprite);
      actor.set(
        SpriteCellOriginProperty,
        new Vector(cell?.x ?? 0, cell?.y ?? 0),
      );
      actor.set(
        SpriteCellSizeProperty,
        new Vector(cell?.width ?? 0, cell?.height ?? 0),
      );
      return;
    }
    case 'drawnOffset': {
      const at = value as {x: number; y: number};
      actor.set(DrawnOffsetProperty, new Vector(at.x, at.y));
      return;
    }
    case 'drawnScale':
      actor.set(DrawnScaleProperty, value as number);
      return;
    case 'drawnTurn':
      actor.set(DrawnTurnProperty, value as number);
      return;
    case 'opacity':
      actor.set(OpacityProperty, value as number);
      return;
  }
}

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

// NO STOCK ANIMATIONS. An animation is the actor's own, made in the Actor
// Editor or copied from the appearance library (`src/appearance/stock`) onto
// the actor that takes it; the rule owns timing and the properties, and plays
// what the kind declares (`ActorBuilder.useAnimations`).

export const AnimationRule = rule.build();
