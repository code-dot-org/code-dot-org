// A World is the encapsulation of the laws (Rules) in play (GLOSSARY.md). The
// instance holds the reference-counted rule set, the world-scoped property
// store, the actors living under those laws, and the per-tick Scheduler and
// EventQueue. `tick(delta)` advances the simulation: run every Step in order,
// then flush the events those steps raised.

import {STYLED} from '../rules/styled';
import {
  VIEWPORT,
  ViewportContentProperty,
  ViewportMapProperty,
  ViewportScrollProperty,
  ViewportShowsMapEvent,
  ViewportShowsThroughProperty,
  ViewportTrait,
} from '../rules/viewport';

import type {Actor} from './Actor';
import {anchored, isAnchor, type Anchor} from './anchors';
import type {AnimationDef, FrameState} from './animationTypes';
import {DEFAULT_CAMERA_ID, makeCamera, Camera, type CameraInit} from './Camera';
import {
  isTimePart,
  NO_CLOCK,
  partOf,
  timeText as clockText,
  TIME_STYLES,
  type TimeStyle,
} from './clock';
import {rgba, type ColorValue, type Rgba} from './color';
import {
  CommandPen,
  drawingKey,
  type ActorDrawing,
  type DrawCommand,
} from './drawing';
import {effectContentHash, effectSlotId} from './effectIds';
import {EventQueue} from './EventQueue';
import {KEY_REPEAT_DELAY, KEY_REPEAT_INTERVAL, RESERVED_KEYS} from './keys';
import {
  DEFAULT_LAYER_ID,
  layersOfMap,
  makeLayer,
  type Layer,
  type LayerInit,
  type LayerSlot,
  type MapLayer,
  type SlotName,
} from './Layer';
import {asList, isListType} from './lists';
import {parentingKeys} from './parenting';
import {phaseIndex} from './phases';
import {ruleContentHash} from './ruleIds';
import {Scheduler} from './Scheduler';
import {ROOT_SPACE_ID, Space} from './Space';
import {SpatialIndex} from './spatialIndex';
import {APPEARANCE, SPATIAL} from './spatialKeys';
import {text} from './textValue';
import {
  NO_THEME,
  resolveTheme,
  type ResolvedStyle,
  type ResolvedTheme,
} from './theme';
import type {Trait} from './Trait';
import {DependencySet} from './traits';
import type {
  AppliedEffectSpec,
  GameEvent,
  Property,
  Rule,
  Step,
  WorldAction,
  WorldEventHandler,
  WorldQuery,
  WorldStorage,
} from './types';
import {Vector, type VectorLike} from './Vector';
import {
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
  fitToTile,
} from './viewport';

/**
 * The steps a paused world still runs: the `sense` phase, where held keys
 * and buttons become events, and nothing else (`World.pause`). A step with
 * no phase — the Animation rule's frame advance is one — is work, and waits
 * with the rest; the only thing a paused world does is notice.
 */
const SENSE = phaseIndex('sense') ?? 0;
const whilePaused = (step: Step): boolean =>
  step.order.kind === 'phase' &&
  (phaseIndex(step.order.phase) ?? Infinity) <= SENSE;

/**
 * The part of an `ActorBuilder` that placing one needs.
 *
 * Structural rather than the class itself: `ActorBuilder` imports the engine
 * core, so naming it here would close a cycle for the sake of one type.
 */
export interface ActorTemplate {
  readonly id: string;
  instantiate(id?: string, type?: string): Actor;
  /**
   * Per-frame bodies this KIND of actor carries — see `ActorBuilder.defineStep`.
   *
   * Optional because the shape is structural: a stand-in template in a test has
   * no opinion about steps, and neither did any template before this existed.
   */
  readonly ownSteps?: readonly ActorStep[];
  /**
   * How this KIND draws itself — see `ActorBuilder.defineDrawing`. Optional for
   * the same structural reason `ownSteps` is.
   */
  readonly ownDrawing?: ActorDrawing;
}

/**
 * A Map: initial actor instances as data (GLOSSARY.md), loaded into a World.
 *
 * The only way a project expresses an arrangement of actors — a level, a menu,
 * a HUD. A world may load several.
 */
/**
 * How wide `text` is, drawn at `size` and in `weight` — lent by the driver.
 *
 * DECLARED HERE rather than beside the canvas that implements it, because the
 * engine is the one that asks: a type owned by the driver would have the
 * engine importing from it, which is the direction this lab keeps apart
 * (`runtime/driver/textMetrics`).
 */
export type TextMeasure = (
  text: string,
  size: number,
  weight?: 'bold',
) => number;

export interface WorldMap {
  /**
   * How big the map is, in tiles, and how big one tile is.
   *
   * Already in every `.map` file the editor writes — it is what the map
   * editor's Width/Height set — and it used to stop there: `loadMap` took the
   * whole object and read only `actors`, so nothing downstream could ask how
   * big the level was. A camera that keeps the view inside the level is the
   * first thing that needs to (`World.mapBounds`).
   *
   * Optional, because a map block synthesises its placements without one.
   */
  size?: {width: number; height: number};
  tile?: {width: number; height: number};
  /**
   * Whether loading this map COVERS what is already there.
   *
   * A screen says yes and an overlay says no. It is a fact about the map
   * rather than about the block that loads it: a dialog is a dialog wherever
   * it is put on, and a HUD is never one (specs/MODALITY_PLAN.md).
   */
  modal?: boolean;
  /**
   * The theme this map's controls are painted out of, by module path.
   *
   * THE MIDDLE OF THREE. A drawing names a class and never a file; which file
   * cascades — the world sets the base, this overrides it for everything the
   * map places, and a placement overrides that. A map that says nothing takes
   * the world's, which is every map written before this
   * (specs/STYLES_PLAN.md).
   */
  theme?: string;
  actors: Array<{
    type: string;
    /** Stable instance id; a random unique one is assigned when omitted. */
    id?: string;
    /** Overrides keyed by owner id (rule or trait), then property id. */
    properties?: Record<string, Record<string, unknown>>;
    /**
     * The layer this placement is on, by id (specs/LAYERS_PLAN.md). Absent,
     * it is on the layer the load was given, which is the default's unless a
     * block said otherwise.
     */
    layer?: string;
    /**
     * Where this placement holds on, when the window is not the shape the map
     * was drawn at — one of nine named places (`core/anchors`).
     *
     * A fact about the ARRANGEMENT and not about the kind, which is why it is
     * here and not a property: a Label is a Label wherever it is put
     * (specs/ANCHORS_PLAN.md). Absent means what it has always meant, which
     * is a position in the map.
     */
    anchor?: string;
  }>;
  /**
   * The map's layers, back to front, with their slots. They become a
   * Viewport's space's own when the map is loaded into one; the main map's
   * are declared into the world by the world's module; a map loaded into
   * the root while the game runs cannot add any, since the world's list is
   * fixed when it is built, and its placements' layers resolve against the
   * world's (specs/LAYERS_PLAN.md).
   */
  layers?: MapLayer[];
  /**
   * Where the space's camera looks once the map is loaded: the entry id of
   * the placement it keeps in the middle (specs/MAP_FIRST.md, "Camera-follow
   * is the level's property"). Read when the map is loaded into a Viewport;
   * the world's own camera is the camera rules' to steer.
   */

  /**
   * What the map DOES, run once per load — see {@link MapLoad}.
   *
   * A `.map` file's placements each carry a workspace of hats about that one
   * instance, and the map one for its own events (specs/MAP_FIRST.md, "What
   * a map script looks like"). The generator compiles them to this function:
   * `placed` is the actors this load placed, by the id the map gave each
   * entry, and `map` is the load itself, for `unload this map` and the hats
   * about it. Absent on a map that says nothing, which is most of them.
   */
  script?: (world: World, placed: Record<string, Actor>, map: MapLoad) => void;
}

/**
 * One loading of a map: what it placed, and the way to take it back.
 *
 * A map loaded twice is two of these, each closed over its own actors, so a
 * pause menu's Resume closes its own menu and not the other one's. Nothing on
 * an Actor says which load placed it; the load holds the list, and that is
 * the whole record.
 */
export class MapLoad {
  private readonly unloadHandlers: Array<(world: World) => void> = [];
  private readonly world: World;
  /**
   * The list this load is ON, so it can take itself off.
   *
   * A space keeps its loads oldest first and nothing used to come off that
   * list except by clearing the whole of it — which was harmless while the
   * only question asked of it was "unload everything", and is wrong the
   * moment anything asks which load is on TOP. `go back` asks exactly that
   * (specs/SCREENS_PLAN.md).
   */
  private readonly among: MapLoad[];
  /** Every actor this load placed, in placement order. */
  readonly actors: readonly Actor[];
  /**
   * Whether this load COVERS what is under it — a dialog rather than a HUD.
   *
   * Input stops at the topmost modal load: everything placed by it or by a
   * load above it can be clicked, tabbed to and typed at, and everything
   * below cannot (`World.canReach`). A screen is modal; an overlay is not,
   * and the difference is not "which is on top" — an on-screen keyboard sits
   * ABOVE the form it types into and must not lock it out
   * (specs/MODALITY_PLAN.md).
   */
  readonly modal: boolean;

  /** The theme this map named, or empty — see `WorldMap.theme`. */
  readonly theme: string;

  constructor(
    world: World,
    actors: readonly Actor[],
    among: MapLoad[] = [],
    modal = false,
    theme = '',
  ) {
    this.world = world;
    this.actors = actors;
    this.among = among;
    this.modal = modal;
    this.theme = theme;
  }

  /**
   * Remove everything this load placed.
   *
   * Through `removeActor`, so a parent's children go with it and the
   * `is removed` events fire — the same removal a handler writes by hand —
   * and deferred to the end of the tick when asked mid-tick, as that is.
   * An actor already gone is skipped, not an error: a script that removed
   * the ball itself may still unload the level.
   */
  unload(): void {
    // OFF THE LIST FIRST, and before the handlers, because a handler is a
    // map's own `when this map unloads` and may unload another — a screen
    // that closes the one under it. Left on, it would still look like the
    // newest to whatever ran next.
    const at = this.among.indexOf(this);
    if (at >= 0) {
      this.among.splice(at, 1);
    }
    for (const handler of this.unloadHandlers) {
      handler(this.world);
    }
    for (const actor of this.actors) {
      this.world.removeActor(actor);
    }
  }

  /** Hear this load being unloaded — `when this map unloads`. */
  onUnload(handler: (world: World) => void): void {
    this.unloadHandlers.push(handler);
  }
}

/** One per-frame body an actor kind declares, before it is bound to a kind. */
export interface ActorStep {
  readonly id: string;
  readonly phase: string;
  readonly run: (actor: Actor, world: World, delta: number) => void;
}

/**
 * A pristine, comparable view of a built world — its structure and every
 * property value, keyed by `${owner}.${id}` path. The driver diffs two of these
 * across a rebuild to decide hot-reload strategy (PLAN §9): if only `world`
 * values changed, patch the running world live; otherwise restart.
 */
export interface WorldSnapshot {
  ruleIds: string[];
  /**
   * What each rule's code says, hashed, by rule id (`ruleIds.ts`).
   *
   * Structural, like {@link handlerIds} and for the same reason: the running
   * world holds the Rule objects it was built with, and a patch cannot replace
   * a step the scheduler has already ordered. Separate from `ruleIds` because
   * the two answer different questions — which rules are in play, and whether
   * one of them was edited.
   */
  ruleCode: Record<string, string>;
  actorIds: string[];
  /**
   * The layers, in stack order (core/Layer).
   *
   * Structural, and ORDERED rather than sorted: a layer cannot be spliced into
   * a live scene graph, and reordering two of them changes what is drawn on top
   * of what — both are reloads, not patches. Only the IDS, though: how a layer
   * responds to the camera is read every frame and builds nothing, so it is a
   * value ({@link layerMotion}) and a rule may turn it mid-game.
   */
  layers: string[];
  /** How each layer responds to the camera. A value, patched like a property. */
  layerMotion: Record<string, {parallax: {x: number; y: number}; fit: boolean}>;
  /**
   * Which cameras exist, in declaration order.
   *
   * Structural for the reason layers are: a viewport is built to draw through
   * one, so gaining or losing a camera is a reload. Where each is LOOKING is
   * not here — see {@link cameraPositions}, which is written every tick by a
   * camera that follows something.
   */
  cameras: string[];
  /** Where each camera looks from, by id. A value, patched like a property. */
  cameraPositions: Record<string, {x: number; y: number}>;
  /** Which one the view is taken through. A value: cutting between them is not a reload. */
  activeCamera: string;
  /**
   * Which effects are in play and what carries each — `[owner, path]` per
   * applied effect, across the world, its backdrops and every actor
   * (`effectIds.ts`).
   *
   * Structural: gaining or losing an effect restarts the game, because nothing
   * can patch an attachment. RETUNING one does not appear here — see
   * {@link effectValues}.
   */
  effectIds: string[];
  /**
   * Every event handler in the world — `<actorId>:<event>@<hash>` — in the
   * order each actor will run them (`Actor.handlerIds`).
   *
   * Structural, and it has to be: a handler is a closure the running actors
   * already hold, so there is no patch that removes one, replaces one, or
   * changes what one does. Nothing else here would notice — an actor's traits,
   * properties and effects are all unchanged by adding a `when` block — so
   * without this the reconciler patches, keeps the running actors, and their
   * copies of the handler go on firing after the block is gone.
   */
  handlerIds: string[];
  /**
   * Which traits each actor holds, by actor id, in dependency order.
   *
   * Structural, and it has to be for the reason {@link handlerIds} gives: a
   * trait is what puts an actor in a step's `where`, and the running actors
   * were made with the set they had. Nothing else here notices a `use trait`
   * row arriving — a trait that declares no property of its own (Gravity's
   * "Acts as Ground") changes no value at all, and one that does declares
   * SLOTS, which read as edited values rather than as a new membership. So the
   * reconciler patched, `setActorProperty` found no slot for the new paths and
   * silently returned false, and the game went on with a ground that was not
   * ground until something else forced a restart.
   */
  actorTraits: Record<string, string[]>;
  /**
   * Each applied effect's knob settings, by the same slot key.
   *
   * Values, not structure: a filter that is already running can be retuned in
   * place, and the driver does exactly that when it notices (effects.ts). So a
   * learner nudging a number on an `add effect` block sees it in the running
   * game instead of watching the game restart around them.
   */
  effectValues: Record<string, AppliedEffectSpec['values']>;
  /**
   * The graph behind each effect in play, hashed, by module path.
   *
   * Deliberately NOT part of the structure. A shader can be swapped underneath
   * a filter that is already running, so editing a `.effect` patches the live
   * game instead of restarting it — which is the difference between authoring a
   * shader and rebooting a game on every keystroke.
   */
  effectDocs: Record<string, string>;
  /**
   * What each layer's background draws, in stack order, named by layer.
   *
   * Values, not structure, and patched live like world properties: changing the
   * sky is the kind of edit a learner makes while watching the game, and it
   * would be a poor trade to restart for it. The layers' EFFECTS are not here —
   * they are in `effectIds` with everyone else's, so gaining or losing one is
   * structural exactly as it is on an actor.
   */
  backdrops: SlotValues[];
  /** The same for what each layer draws in front of its actors. */
  foregrounds: SlotValues[];
  /**
   * The track this world is playing, or undefined for silence.
   *
   * A VALUE, patched like a backdrop and for the same reason: swapping the
   * music while the game runs should swap the music, not restart the game. It
   * is the half of sound that IS state — the other half already happened, and
   * is deliberately not here (specs/SOUND.md).
   */
  music?: string;
  /** The one color behind everything — a value, patched like the sky above. */
  clearColor: Rgba;
  /** World-scoped property values, by `${ruleId}.${propId}`. */
  world: Record<string, unknown>;
  /** Per-actor property values, by actor id then `${traitId}.${propId}`. */
  actors: Record<string, Record<string, unknown>>;
}

/**
 * One image slot's values, as the snapshot carries them.
 *
 * All of it patchable. An offset is written every tick by a drifting layer, so
 * restarting the game for one would restart it sixty times a second.
 */
export interface SlotValues {
  layer: string;
  sprite?: string;
  offset: {x: number; y: number};
  repeat: boolean;
}

const slotValues = (layer: string, slot: LayerSlot): SlotValues => ({
  layer,
  ...(slot.sprite === undefined ? {} : {sprite: slot.sprite}),
  offset: {x: slot.offset.x, y: slot.offset.y},
  repeat: slot.repeat,
});

/**
 * A renderer-friendly view of one positional actor. The driver's Phaser binding
 * consumes these each frame; it needs no engine internals, only these numbers.
 */
export interface RenderState {
  actor: Actor;
  /**
   * The actor this one is carried by, and its transform IN THAT ACTOR'S
   * FRAME, for a driver that nests (specs/PARENTING.md). `x`, `y`, `scaleX`,
   * `scaleY` and `rotation` are the world values whether or not there is a
   * parent, for everything that does not nest.
   */
  parent?: Actor;
  local?: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
  };
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  /** Degrees. */
  rotation: number;
  /** Vertical skew in degrees — a shear the driver applies about the actor's
   * center (0 = none). */
  skew: number;
  /**
   * How solid to draw it: 1 opaque, 0 invisible.
   *
   * 1 for an actor with no appearance trait, which is the honest answer — it
   * has no opacity, and the driver still has to be told a number.
   */
  opacity: number;
  /** Effects to play on this actor's image; empty for most actors. */
  effects: readonly AppliedEffectSpec[];
  /**
   * The Viewport's space this actor is in, by id, when it is not the root's
   * — the driver draws it inside that Viewport (specs/VIEWPORT_PLAN.md).
   */
  space?: string;
  /** The current appearance frame to draw; absent means draw a plain rectangle. */
  frame?: FrameState;
  /**
   * A picture the actor's kind describes for itself, which wins over `frame`
   * when both are there (specs/DRAWING.md).
   *
   * `key` is the identity of the commands: the driver rasterizes on a key it
   * has not seen and reuses the texture otherwise, which is why nine actors
   * drawn the same way cost one texture and a drawing that never changes costs
   * one rasterization.
   */
  drawing?: DrawingState;
  /**
   * Which layer draws this actor, as its DEPTH — the layer's position in the
   * stack, not its id. The driver wants a number to sort by and nothing else,
   * and resolving the id here keeps the layer list an engine concern.
   */
  layer: number;
}

/** A described picture, and the identity that says whether it is a new one. */
export interface DrawingState {
  key: string;
  width: number;
  height: number;
  commands: readonly DrawCommand[];
}

/**
 * One layer's background, as the driver draws it.
 *
 * The appearance half of an actor with none of the body: something to draw,
 * effects to draw it through, and nothing the simulation can reach — no
 * position, no traits, no place in the rules (BACKGROUNDS.md §1). One per
 * layer, drawn behind that layer's actors; the COLOR is the world's, since a
 * color on any layer but the bottom can never be seen.
 */
export interface BackdropState {
  /** An image file name, as a frame names one; absent means nothing drawn. */
  sprite?: string;
  /** Effects filtering this image's own pixels — not the whole camera. */
  effects: readonly AppliedEffectSpec[];
  /** Where it sits, in world pixels — author-driven motion (core/Layer). */
  offset: {x: number; y: number};
  /** Whether it tiles rather than stretching to the surface. */
  repeat: boolean;
}

/**
 * What a world draws behind everything until told otherwise.
 *
 * The color the preview has always cleared to, moved here so the driver reads
 * it off the world rather than carrying its own copy.
 */
export const DEFAULT_BACKDROP_COLOR = '#101020';

/** The data a WorldBuilder hands the World constructor. */
export interface WorldInit {
  id: string;
  name: string;
  /** Explicitly-used rules; their dependencies are pulled in implicitly. */
  rules: Rule[];
  /** Animations to register beyond the active rules' stock, by id. */
  animations?: Array<[string, AnimationDef]>;
  /**
   * The layers actors are drawn in, back to front (core/Layer).
   *
   * A world that names none still has one — the default — so there is never a
   * placed actor with nowhere to be. A world that names some gets exactly
   * those, in the order given, which IS the draw order.
   */
  layers?: LayerInit[];
  /**
   * State the WORLD declared for itself, with no rule to carry it
   * (specs/WORLD_STATE.md). Seeded like a rule's world-scoped properties, and
   * from a second source because a world's score is not a mechanic.
   */
  ownProperties?: readonly Property<unknown>[];
}

// `vector` and `point` are both stored as a `Vector` (see Actor's coerce), and
// a list is copied on the way in for the reason `core/lists` gives: a default
// held by reference is one array behind every holder of it.
const coerce = <T>(property: Property<T>, value: unknown): T => {
  if (property.type === 'vector' || property.type === 'point') {
    return Vector.from(value as Vector) as unknown as T;
  }
  if (isListType(property.type)) {
    return asList(property.type, value) as unknown as T;
  }
  return value as T;
};

/**
 * `world.cameras` — iterable, with the same trait filter the actors have.
 *
 * A rule's step walks the cameras that elected its trait, exactly as gravity's
 * step walks the actors that elected `Affected by Gravity`. That symmetry is
 * the whole point of a camera holding traits.
 */
class CameraCollection {
  private readonly list: Camera[];
  private readonly spaces: () => readonly Space[];

  /**
   * `list` is the world's own cameras — the root space's. `spaces` answers with
   * the Viewport spaces, whose cameras are theirs (`Space.cameras`).
   *
   * BOTH, because a camera rule finds its subjects through here and a
   * Viewport's camera was never offered to one: the collection wrapped the
   * world's list alone, so following a subject had to be written a second time
   * in the engine (specs/SPACE_CAMERAS_PLAN.md).
   *
   * A function rather than the array, because Viewports are placed as a world
   * runs and a collection built once would answer about the spaces there were.
   */
  constructor(list: Camera[], spaces: () => readonly Space[]) {
    this.list = list;
    this.spaces = spaces;
  }

  /** Every camera in the world, the root's first and then each space's. */
  private all(): Camera[] {
    const found = [...this.list];
    for (const space of this.spaces()) {
      found.push(...space.cameras);
    }
    return found;
  }

  /** Every camera with a trait — a copy, so a body may add one while walking. */
  with(trait: Parameters<Camera['has']>[0]): Camera[] {
    return this.all().filter(camera => camera.has(trait));
  }

  [Symbol.iterator](): Iterator<Camera> {
    return this.all()[Symbol.iterator]();
  }
}

/** `world.actors` — iterable, with a trait filter (`world.actors.with(t)`). */
class ActorCollection {
  private readonly list: Actor[];

  constructor(list: Actor[]) {
    this.list = list;
  }

  with(trait: Parameters<Actor['has']>[0]): Actor[] {
    return this.list.filter(actor => actor.has(trait));
  }

  /**
   * Every actor of a kind — the module a template was registered under
   * (`actors/coin`).
   *
   * What `any ⟨Coin⟩` means everywhere except a handler's subject socket: the
   * coins there are, right now. (In that one socket it means the TEMPLATE, so
   * that a handler registered on it reaches the coins placed later too.)
   */
  ofType(type: string): Actor[] {
    return this.list.filter(actor => actor.type === type);
  }

  /**
   * Every actor drawn in a layer.
   *
   * A copy, like `ofType`, because a source is read once at the top of a loop —
   * a rule that adds actors while iterating them terminates. An unknown id
   * gives none rather than throwing, for the reason `addActor` gives about ids
   * that come from generated code naming a block.
   */
  inLayer(layer: string): Actor[] {
    return this.list.filter(actor => actor.layer === layer);
  }

  /**
   * A COPY, like the three above, and for the reason they give.
   *
   * This was the live array's iterator, which made the collection's one
   * un-copied exit the one a loop actually walks (`blockly/domainBlocks`'s
   * `actorSource` emits `world.actors` for a loop over `all actors`). Both ways
   * that goes wrong are reachable from blocks:
   *
   *   - a body that ADDS walks what it added, so `for each actor … do
   *     ⟨add actor⟩` never returns — a hung frame, not a wrong answer;
   *   - a body that REMOVES skips the next actor every time, because
   *     `removeActor` splices, so `for each actor … do ⟨remove actor⟩` removes
   *     half of them and says nothing.
   *
   * The second is the one worth the copy: "remove everything" is a sentence a
   * learner writes, and half-working is worse than failing.
   */
  [Symbol.iterator](): Iterator<Actor> {
    return [...this.list][Symbol.iterator]();
  }
}

/**
 * "Stop everything", as a thing that can sit in the sound queue.
 *
 * A SENTINEL and not a flag, so that a tick's sound keeps its order: whatever
 * was said after it still plays (`World.stopSounds`). A symbol rather than a
 * reserved name, because every other cue in the queue is a file name and a
 * project may name a file anything.
 */
export const STOP_ALL_SOUNDS: unique symbol = Symbol('stop all sounds');

/** One thing said about sound in a tick: play this, or stop everything. */
export type SoundCue = string | typeof STOP_ALL_SOUNDS;

export class World {
  readonly id: string;
  readonly name: string;
  readonly actors: ActorCollection;
  private readonly membership = new DependencySet<Rule>(
    rule => rule.requires,
    rule => rule.id,
  );
  private readonly store = new Map<Property, unknown>();
  private readonly actorList: Actor[] = [];
  /**
   * How many actors are in `actorList` under each id — the index that makes
   * {@link hasActor} a lookup rather than a scan.
   *
   * A COUNT and not the actor, because the list has never promised ids are
   * unique: `addActor(template, …)` goes through {@link resolveInstanceId} and
   * cannot collide, but the overload that places an actor somebody else built
   * takes whatever id it was given. A map to the actor would have to choose
   * which of two duplicates it held, and deleting one would leave `hasActor`
   * lying about the other. A count cannot: it is `some(…)` with the scan taken
   * out, and it answers the same for every input.
   *
   * WHY IT IS WORTH AN INDEX AT ALL: every `add actor` block passes its own
   * block id, so placing n of them from one block probes `id`, `id#2`, `id#3` …
   * — n²/2 probes, each of which WAS a scan of the whole list. `repeat 1000
   * times` cost 636ms of arithmetic before a single frame was drawn, and the
   * lesson that asks a learner to find where their machine gives out
   * (`simulation/many`) was measuring this instead.
   */
  private readonly actorsById = new Map<string, number>();
  /**
   * The ordinal {@link resolveInstanceId} should try FIRST for a base id.
   *
   * Without it the n-th actor from one block counts up from 2 again, so a
   * `repeat` of n costs n²/2 probes. It is a hint and not an answer — the
   * candidate is still checked — so the only thing it changes is where the
   * counting starts, and the only thing it gives up is REUSING an ordinal
   * freed by a removal. `bullet#5` staying spent after `bullet#5` dies is the
   * better answer anyway: an id that comes back refers to two different things
   * over one run.
   */
  private readonly nextOrdinal = new Map<string, number>();
  // Not readonly: an actor KIND can contribute per-frame steps of its own, and
  // a kind is not known until one of its actors is placed (`useActorKind`).
  private scheduler: Scheduler;
  // Every step the world runs, rules' and actor kinds' alike, in the order they
  // were contributed — kept so a kind arriving later can be folded in without
  // asking the rules again.
  private readonly stepList: Step[] = [];
  // Which actor kinds have already contributed, by the TYPE they were placed
  // under: a kind contributes once however many of it there are.
  private readonly kindsWithSteps = new Set<string>();
  /** How each kind that describes its own picture draws itself, by type. */
  private readonly kindDrawings = new Map<string, ActorDrawing>();
  /** The properties this world declared for itself — see `defineOwnProperty`. */
  private readonly ownProperties: Array<Property<unknown>> = [];
  private readonly events = new EventQueue();
  /**
   * Handlers for the world's own events, by event.
   *
   * On the World rather than on some actor standing in for it. `rules/input`
   * used to raise its key events once per actor per frame purely to have a
   * subject, and every `.actor` that cared had to register on itself.
   */
  private readonly worldHandlers = new Map<GameEvent, WorldEventHandler[]>();
  /**
   * How big the world is; see `mapBounds`. One screen until a map is loaded.
   *
   * A VECTOR, not a `{width, height}`. The blocks that report it are typed
   * `Vector`, and every block that takes one apart reads `.x`/`.y` — so a pair
   * named the other way is a value whose own type is a lie about it, and the
   * failure is silent: `x of ⟨map size⟩` is `undefined`, the arithmetic around
   * it is NaN, and nothing throws.
   */
  private get bounds(): Vector {
    return this.rootSpace.bounds;
  }

  private set bounds(value: Vector) {
    this.rootSpace.bounds = value;
  }

  /**
   * The world's spaces (specs/VIEWPORT_PLAN.md): the root, which the main
   * map and every `load map` fill, and one per Viewport placed. Every actor
   * is in exactly one; see `Actor.space`.
   */
  private readonly rootSpace = new Space(
    ROOT_SPACE_ID,
    undefined,
    new Vector(VIEWPORT_WIDTH, VIEWPORT_HEIGHT),
    // No cameras of its own: the root's are the world's `cameraList`, which it
    // owns directly for want of a placement to own them for it
    // (specs/SPACE_CAMERAS_PLAN.md).
  );
  private readonly viewportSpaces: Space[] = [];

  /**
   * The actor IN HAND: the subject whose handler is running, the actor a
   * per-kind step or a loop is at, the candidate a predicate is asked about.
   * What the world is asked without an actor — the map's size, the mouse's
   * place, what is near a point, where to put a spawn — is answered for this
   * actor's space, so a rule written before spaces existed keeps meaning
   * what it meant in each space (specs/VIEWPORT_PLAN.md).
   */
  private readonly inHand: Array<Actor | Camera> = [];

  /** The project's maps by module path — see `defineMap`. */
  private readonly maps = new Map<string, WorldMap>();

  /**
   * How much of the world is on screen at once, in pixels — the game's native
   * resolution. Ten tiles square unless the world says otherwise
   * (`setViewSize`).
   */
  private view = new Vector(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  // Game seconds since the first tick — see `time`. Advanced by `tick` and by
  // nothing else, so a world nobody ticks stays at zero however long it exists.
  private elapsed = 0;
  // Animations known to this world, by id — seeded from the active rules' stock
  // animations. The Animation rule's step and renderSnapshot resolve ids here.
  private readonly animationDefs = new Map<string, AnimationDef>();
  /**
   * How big each of the project's images is, by file name.
   *
   * A fact about a file, not about any actor — which is why the world holds it
   * rather than an actor doing: two actors wearing one picture are the same
   * size, and neither of them is where that is written down.
   *
   * Here so a SINGLE-IMAGE actor can have an intrinsic size at all. The
   * Animation rule publishes one from a spritesheet's cells, and a plain
   * picture has no cells — so before this, everything not animated measured
   * zero, and every rule that asks how big an actor is fell back to a guess.
   */
  private readonly imageSizes = new Map<
    string,
    {width: number; height: number}
  >();
  // Effects played across the whole viewport, not on any one actor. Mutable for
  // the same reason an actor's list is: the driver re-reads it every frame.
  private readonly appliedEffects: AppliedEffectSpec[];
  // The one color behind everything. World-scoped, not per layer: a color on
  // any layer but the bottom is behind the layer under it and can never be
  // seen, so there is one sky (BACKGROUNDS.md).
  private clearColor: Rgba;
  // The layers actors are drawn in, back to front. Never empty: index 0 is the
  // default, which is where an actor placed without being told a layer goes.
  private readonly layerList: Layer[];
  // The cameras, and the default among them. Never empty, for the reason the
  // layer list is not: a view taken through no camera would be a second kind of
  // view, and every question about the view would have to answer twice.
  private readonly cameraList: Camera[];
  // Which camera the view is taken through. One today, because a VIEWPORT is
  // what would give a layer a different one and viewports are not built — so
  // this is the default viewport's camera by another name, and generalises to
  // that rather than being replaced by it.
  private activeCameraId: string = DEFAULT_CAMERA_ID;
  private readonly cameraCollection: CameraCollection;
  // Layer id -> its index, which is its depth. Built once; layers cannot be
  // added or removed while the world runs (they are structural — a layer cannot
  // be spliced into a live scene graph, see `snapshot`).
  private readonly layerIndex = new Map<string, number>();
  // Which load placed each actor, for `canReach`. A WeakMap because an actor
  // removed from the world should not be held alive by this, and because the
  // question is only ever asked of an actor somebody already has in hand.
  private readonly loadOf = new WeakMap<Actor, MapLoad>();
  // The set of currently-pressed input keys, refreshed by the driver each frame
  // before `tick` (the engine is DOM-free, so input arrives as plain data).
  // Rule steps read it through `isKeyDown`; keys carry OUR names — 'left arrow',
  // 'a', 'space' — which the driver translates the DOM's into (core/keys).
  private keys: ReadonlySet<string> = new Set();
  // What the DRIVER last said, before anything the world pressed itself is
  // folded in. `keys` is the two together and is what everything reads; this
  // is kept apart so that a key the world pressed lasts one frame rather than
  // sticking until the driver next speaks (`pendingKeys`).
  private held: ReadonlySet<string> = new Set();
  /**
   * The characters TYPED since the last tick, in the order they were typed.
   *
   * A QUEUE, where the keys are a set, and the difference is the whole reason
   * this is separate. A key is held or it is not, so a set answers everything
   * anybody asks about one; typing is a sequence — "aa" is two characters and
   * "ab" is not "ba" — and a set loses both facts. It is also not the same
   * question: shift, a dead key, an IME and a paste all produce characters and
   * no key edge anybody could name (specs/UI_ACTORS.md).
   *
   * Drained by `tick`, so a frame sees exactly what was typed into it.
   */
  private typed: string[] = [];
  /**
   * What the WORLD typed, waiting for the next frame.
   *
   * A SEPARATE QUEUE FROM THE ONE ABOVE, because of when it is filled. The
   * driver adds to `typed` between frames, which is before the Input rule's
   * step reads it; a block adds here from a handler, and handlers run after
   * every step and before the drain — so a character added to `typed` from an
   * on-screen keyboard would be cleared at the end of the same tick without
   * ever having been read (specs/KEYBOARD_PLAN.md).
   *
   * Folded into `typed` at the top of the next `tick`, in FRONT of that
   * frame's own: an on-screen key was pressed a frame ago and a real keystroke
   * arrived since, so that is the order they happened in.
   */
  private pendingTyped: string[] = [];
  /**
   * Keys the world pressed, waiting for the next frame — same reasoning.
   *
   * Held for exactly one tick, which is what makes it a keystroke rather than
   * a key held down: the frame it is folded into is a rising edge against the
   * previous frame's set, and the frame after — with nothing pending — is a
   * falling edge. The Input rule turns both into events without knowing either
   * came from a button.
   */
  private pendingKeys = new Set<string>();
  /**
   * Keys the game has asked the browser to leave alone.
   *
   * THE BROWSER HAS ITS OWN USE FOR SOME KEYS, and which ones a game needs is
   * a fact about the game rather than a constant in the driver — where it has
   * been living (`PhaserBinding`'s `SCROLL_KEYS`, arrows and space, hard-coded
   * so a platformer does not scroll the page). Tab is the case that could not
   * be a constant: an interface actor holding the focus wants it, and a game
   * with nothing focused must NOT have it, or the canvas is somewhere a
   * keyboard user can enter and not leave (specs/UI_ACTORS.md).
   *
   * So the world says, and the driver reads. Escape is never in here — see
   * `RESERVED_KEYS`.
   */
  private captured = new Set<string>();
  /**
   * Whether the game window took the keyboard since the last tick.
   *
   * ONE FRAME, drained by `tick` like the typed characters, because it is the
   * same kind of thing: a moment rather than a state. It is how a rule tells
   * an arrival from an ordinary keypress — tabbing ONTO the game and pressing
   * Tab INSIDE it both look like a Tab edge, and they mean opposite things
   * (one comes in, the other goes on or leaves).
   */
  private keyboardArrived = false;
  /**
   * How wide a line of text is, or nothing when nobody has said.
   *
   * THE ONE MEASUREMENT THE ENGINE CANNOT MAKE. Everything else about a
   * picture is arithmetic on numbers the project stated; a letter's width is a
   * fact about a font, and this half has no font and no canvas by design
   * (specs/DRAWING.md). `draw paragraph` avoids the question by handing its
   * column down and letting the painter break the lines.
   *
   * A CARET IS THE CASE THAT COULD NOT BE AVOIDED. It belongs after the last
   * letter, and it MOVES on a click — which is a handler, not a paint, so an
   * answer published by the last frame's drawing arrives too late to place it.
   * So the tape is lent the other way: a driver that has a canvas hands one
   * over (`runtime/driver/textMetrics`), built from the same font string the
   * painter sets, and `textWidth` is what blocks ask through.
   *
   * Undefined is the headless case and answers zero rather than guessing.
   */
  private measure: TextMeasure | undefined;
  /**
   * What time it is out there, and which zone that is — lent by the driver.
   *
   * THE THIRD THING THE ENGINE CANNOT KNOW, beside the width of a letter and
   * the browser's storage, and lent the same way and for the same reason: this
   * half has no machine and no locale by design, and `time` answers a
   * different question — seconds since the world STARTED, which is what a
   * cooldown is measured in (specs/CLOCK_PLAN.md).
   *
   * Undefined is the headless case and answers a FIXED moment rather than the
   * real one (`core/clock`, NO_CLOCK). A test, a rule demo and a check all run
   * headless, and a clock that answered the real time there would make every
   * one of them differ between runs.
   */
  private clock: (() => number) | undefined;
  private zoneOffset = 0;
  /**
   * The moment this frame is at, sampled once at the top of `tick`.
   *
   * For the same reason `elapsed` is advanced there: every step and handler in
   * one frame should read ONE value, or two blocks a line apart could land on
   * opposite sides of a second and a project that compared them would see time
   * run backwards within a frame.
   */
  private moment = NO_CLOCK;
  /** Actor templates by the module path a map names them with (`define`). */
  private readonly types = new Map<string, ActorTemplate>();
  // The previous tick's pressed set, so a rule step can detect rising/falling
  // edges (a key *just* pressed or released) rather than only the held state.
  // Advanced at the end of each `tick`.
  private previousKeys: ReadonlySet<string> = new Set();
  // The mouse, on the same terms: held buttons, the previous tick's for edges,
  // and where the pointer is. Buttons carry OUR names — 'left', 'middle',
  // 'right' (core/pointer).
  private buttons: ReadonlySet<string> = new Set();
  private previousButtons: ReadonlySet<string> = new Set();
  // IN VIEWPORT PIXELS, measured from the top left of the window onto the
  // world — which is what the driver can actually report, since that is where
  // the pointer is. Turning it into a place in the WORLD needs the camera, and
  // the camera is here (`mousePosition`).
  private pointer = new Vector(0, 0);

  constructor(init: WorldInit) {
    this.id = init.id;
    this.name = init.name;
    this.actors = new ActorCollection(this.actorList);

    for (const rule of init.rules) {
      this.membership.add(rule);
    }
    const rules = this.membership.items();

    // Seed world-scoped properties from every present rule's defaults. A world
    // that wants other values is TOLD them, by the same `set` an event handler
    // calls — see WorldBuilder's note on the call log.
    for (const rule of rules) {
      for (const property of Object.values(rule.properties)) {
        this.store.set(property, coerce(property, property.default));
      }
    }
    // …and the world's OWN, which belong to no rule. After the rules, so a
    // world declaring a name one of its rules also uses gets its own value:
    // the file in front of the learner wins over one they imported.
    for (const property of init.ownProperties ?? []) {
      this.defineOwnProperty(property, property.default);
    }

    // Seed the animation registry from every active rule's stock animations,
    // then apply any the builder registered (imported `.anim` files).
    for (const rule of rules) {
      for (const [id, def] of Object.entries(rule.animations)) {
        this.animationDefs.set(id, def);
      }
    }
    for (const [id, def] of init.animations ?? []) {
      this.animationDefs.set(id, def);
    }

    this.appliedEffects = [];
    this.clearColor = rgba(DEFAULT_BACKDROP_COLOR);

    // Layers, back to front, with the default guaranteed. A world told nothing
    // has exactly one, which is every world today — so an actor always has
    // somewhere to be and nothing has to special-case its absence.
    this.layerList = (init.layers ?? []).map(makeLayer);
    if (!this.layerList.some(layer => layer.id === DEFAULT_LAYER_ID)) {
      this.layerList.unshift(makeLayer({id: DEFAULT_LAYER_ID}));
    }
    this.layerList.forEach((layer, index) =>
      this.layerIndex.set(layer.id, index),
    );
    // Every world has the default camera; the rest are declared into it.
    this.cameraList = [makeCamera({id: DEFAULT_CAMERA_ID})];
    this.cameraCollection = new CameraCollection(
      this.cameraList,
      () => this.viewportSpaces,
    );
    for (const camera of this.cameraList) {
      camera.world = this;
    }

    // The per-tick order starts as the active rules' steps. An actor kind may
    // add to it later, which is what makes the order a `let` (`useActorKind`).
    for (const rule of rules) {
      this.stepList.push(...Object.values(rule.steps));
    }
    this.scheduler = new Scheduler(this.stepList);
  }

  get<T>(property: Property<T>): T {
    if (!this.store.has(property)) {
      throw new Error(
        `World '${this.id}' has no property '${property.id}' ` +
          `(is rule '${property.ownerId}' in use?)`,
      );
    }
    return this.store.get(property) as T;
  }

  set<T>(property: Property<T>, value: T): void {
    this.store.set(property, coerce(property, value));
  }

  /**
   * Give the world a slot for a property no rule declared.
   *
   * The world's counterpart to the overrides an Actor is built with, and the
   * whole of what `WorldBuilder.defineProperty` needs from here: `get` and
   * `set` already take any property, and the only thing they insist on is that
   * the slot exists.
   *
   * Idempotent-by-overwrite on purpose. A world module declares its properties
   * as it loads, and a hot reload replays that module against a world that may
   * already be running; re-seeding a slot to the value the file now states is
   * what "the default changed" should mean.
   */
  defineOwnProperty<T>(property: Property<T>, value: T): void {
    if (!this.store.has(property)) {
      this.ownProperties.push(property as Property<unknown>);
    }
    this.store.set(property, coerce(property, value));
  }

  act(action: WorldAction, ...args: unknown[]): void {
    action.apply(this, ...args);
  }

  /** Answer a rule's world-scoped query (e.g. Collision's `TouchingQuery`). */
  query<T>(query: WorldQuery<T>, ...args: unknown[]): T {
    return query.evaluate(this, ...args);
  }

  /**
   * Actors asked to leave while a tick was in progress; swept when it ends.
   * See {@link removeActor}.
   */
  private readonly leaving = new Set<Actor>();
  /** Whether a tick is running, which is what makes removal deferred. */
  private inTick = false;
  /** Whether the game is paused — see {@link pause}. */
  private paused = false;

  /**
   * Whether the world is inside a frame right now.
   *
   * Which is the same as "a handler is running": handlers are flushed inside
   * `tick`. `WorldBuilder.act` asks, to tell an action that is part of what the
   * world IS from one that merely happened while it ran.
   */
  get ticking(): boolean {
    return this.inTick;
  }
  /** Sounds raised since the driver last drained, in the order raised. */
  private readonly queuedSounds: SoundCue[] = [];
  /** The track playing, or undefined for silence (specs/SOUND.md). */
  private track: string | undefined;

  /**
   * Place an actor, in `layer` or in the default one.
   *
   * An unknown layer id is the default rather than an error: the id comes from
   * generated code naming a `define layer` block, and a layer deleted while a
   * `within layer` still names it should put its actors somewhere visible
   * rather than take the world down. The same reasoning as a `use rule` naming
   * a rule that has gone.
   */
  addActor(actor: Actor, layer?: string): Actor;
  addActor(
    template: ActorTemplate,
    id?: string,
    type?: string,
    layer?: string,
  ): Actor;
  /**
   * Place an actor, or make one from a template and place that.
   *
   * TWO shapes because one BLOCK reaches both. `add actor` generates
   * `world.addActor(Template, id, type, layer)`, and under `define world` that
   * lands on `WorldBuilder`; in a rule step or an event handler — spawning a
   * bullet, splitting an asteroid — it lands here. A method that existed on one
   * of them only is a crash carrying the block's own name at the moment a
   * learner runs their game (`builderSurface.test`), so the two agree.
   *
   * The template form is told apart by duck-typing rather than by importing
   * `ActorBuilder` for an `instanceof`: that import would be a cycle, and the
   * same trade is already made in `Traited`'s coercion.
   */
  addActor(
    subject: Actor | ActorTemplate,
    idOrLayer?: string,
    type?: string,
    layer?: string,
  ): Actor {
    if (typeof (subject as ActorTemplate).instantiate !== 'function') {
      return this.place(subject as Actor, idOrLayer);
    }
    const template = subject as ActorTemplate;
    const actor = template.instantiate(
      this.resolveInstanceId(template, idOrLayer),
      type,
    );
    // The kind's own per-frame steps, if it declared any. After instantiate so
    // the type is settled: `Actor.type` falls back to the instance id when the
    // caller named none, and that is the type the step has to walk.
    this.useActorKind(actor.type, template);
    return this.place(actor, layer);
  }

  /**
   * A free id for a new instance.
   *
   * A block's id is stable and unique in a WORLD, which is what makes it the
   * right name for something placed once while describing one. It is neither
   * once the same block runs again — a spawn in a step fires every frame — so a
   * taken id gains an ordinal. An id nobody asked for gets a random one, since
   * there is no name to keep.
   */
  private resolveInstanceId(
    template: ActorTemplate,
    explicitId?: string,
  ): string {
    const base = explicitId ?? template.id;
    if (!this.hasActor(base)) {
      return base;
    }
    if (explicitId === undefined) {
      return `${template.id}-${crypto.randomUUID()}`;
    }
    let ordinal = this.nextOrdinal.get(base) ?? 2;
    while (this.hasActor(`${base}#${ordinal}`)) {
      ordinal += 1;
    }
    this.nextOrdinal.set(base, ordinal + 1);
    return `${base}#${ordinal}`;
  }

  /**
   * Let an actor KIND contribute its own per-frame steps.
   *
   * The `each frame` an `.actor` file may declare (blockly/actorMeta), and the
   * counterpart to `defineProperty`: state a kind carries without a rule, and
   * now behavior a kind runs without one. A rule is still what you write when
   * the behavior is shared, elected or answerable — this is for the case where
   * it is none of those and a whole `.rule` file is more ceremony than the thing
   * deserves.
   *
   * PER KIND, NOT PER ACTOR. One step is added however many of the kind there
   * are, and it walks `actors.ofType(type)` — so thirty-one ground tiles are one
   * entry in the order rather than thirty-one, and an actor placed later is
   * swept up without anything being registered again.
   *
   * Called where the template and the TYPE it is being placed under are both in
   * hand, which is `addActor` here and `loadMap` on the builder. The type is
   * what binds them: it is what `any ⟨Coin⟩` means everywhere else, so a step
   * declared by the coin runs for exactly the actors a learner would point at.
   *
   * The scheduler is rebuilt, not appended to — the order is a topological sort
   * and a new step may belong anywhere in it. A rebuild during a tick is safe:
   * `Scheduler.run` is iterating the array it started with, so a kind spawned
   * mid-frame joins the order on the next one.
   */
  useActorKind(type: string, template: ActorTemplate): void {
    // A kind's picture, remembered against the same type its steps are bound
    // to, and independently of them: a Label declares a drawing and no steps,
    // which is the commonest shape an interface actor has (specs/UI_ACTORS.md).
    if (template.ownDrawing && !this.kindDrawings.has(type)) {
      this.kindDrawings.set(type, template.ownDrawing);
    }
    const steps = template.ownSteps ?? [];
    if (!steps.length || this.kindsWithSteps.has(type)) {
      return;
    }
    this.kindsWithSteps.add(type);
    for (const step of steps) {
      this.stepList.push({
        id: `${type}.${step.id}`,
        ownerId: type,
        order: {kind: 'phase', phase: step.phase},
        run: (world, delta) => {
          for (const actor of world.actors.ofType(type)) {
            world.withActor(actor, () => step.run(actor, world, delta));
          }
        },
      });
    }
    this.scheduler = new Scheduler(this.stepList);
  }

  /**
   * The `intrinsic size` property, resolved through the membership rather than
   * imported.
   *
   * `renderSnapshot` reaches Space's properties the same way and for the same
   * reason: the World holds rules it was given, and importing one of them here
   * would make the core depend on a rule it is supposed to merely run.
   */
  private intrinsicSizeProperty(): Property<Vector> | undefined {
    return this.positionalProperty(SPATIAL.intrinsicSize);
  }

  /** …and `scale`, which is the other half of how big a thing is drawn. */
  private scaleProperty(): Property<Vector> | undefined {
    return this.positionalProperty(SPATIAL.scale);
  }

  /**
   * The `Has a Style` trait's `theme`, if this world's rules declare it.
   *
   * Asked of the RULES rather than imported, exactly as the positional
   * properties above are: the rule is a foundation one, but a world that
   * shadowed it with one of its own should be answered from the rule that is
   * actually in play.
   */
  private styleThemeProperty(): Property<string> | undefined {
    const styled = this.membership.items().find(r => r.id === STYLED.rule);
    const trait: Trait | undefined = styled?.traits[STYLED.trait];
    return trait?.properties[STYLED.theme] as Property<string> | undefined;
  }

  private positionalProperty(id: string): Property<Vector> | undefined {
    const spatial = this.membership.items().find(r => r.id === SPATIAL.rule);
    const positional: Trait | undefined = spatial?.traits[SPATIAL.trait];
    return positional?.properties[id] as Property<Vector> | undefined;
  }

  private place(
    actor: Actor,
    layer: string = DEFAULT_LAYER_ID,
    space?: Space,
  ): Actor {
    // The back-reference an actor-scoped action or query reads to reach the
    // world (see `Actor.world`). Set here because placement is what makes it
    // true, and cleared when it leaves (`detach`) for the same reason.
    actor.world = this;
    // The zero its age counts from. Placement is what starts the clock, so a
    // template instantiated and placed twice gives two actors of different ages.
    actor.bornAt = this.elapsed;
    // Against the layers of the space it is going into: the world's for
    // the root, the loaded map's for a Viewport's (specs/LAYERS_PLAN.md).
    const target = space ?? this.spaceOf(this.inHand.at(-1));
    const known =
      target === this.rootSpace
        ? this.layerIndex.has(layer)
        : target.layers.some(held => held.id === layer);
    actor.layer = known ? layer : DEFAULT_LAYER_ID;
    // The space it is in: the one asked for, else the actor in hand's — a
    // bullet a ball spawns lands in the ball's level — else the root.
    actor.space = space ?? this.spaceOf(this.inHand.at(-1));
    // A drawn actor's size is DECLARED, so it is known the moment the actor
    // exists and never measured. Everything that asks how big an actor is
    // reads `intrinsic size` — the click box (rules/mouse), the collision box,
    // "Stays in the Map" — so a Button is the size of the picture it draws
    // without anything looking at pixels (specs/DRAWING.md).
    const drawing = this.kindDrawings.get(actor.type);
    if (drawing) {
      const property = this.intrinsicSizeProperty();
      if (property) {
        // ASKED OF THIS ACTOR, because the size is per-instance: two Buttons
        // of one kind may be two widths (`ActorDrawing.size`). It is asked
        // again wherever the drawing runs, so a size that CHANGES is followed
        // rather than frozen here — see `renderSnapshot`.
        const {width, height} = drawing.size(actor, this);
        actor.set(property, new Vector(width, height));
      }
    }
    this.actorList.push(actor);
    this.actorsById.set(actor.id, (this.actorsById.get(actor.id) ?? 0) + 1);
    // A Viewport gets a space of its own, seen through a camera of its own
    // that starts at the middle of what it shows (`rules/viewport`). After
    // its size is known, since the space is as big as the window at first.
    if (actor.has(ViewportTrait) && !this.viewportSpaceOf(actor)) {
      const view = this.viewSizeOf(actor);
      const space = new Space(
        `${ROOT_SPACE_ID}/${actor.id}`,
        actor,
        new Vector(view.x, view.y),
      );
      this.viewportSpaces.push(space);
      // THE SPACE'S MAIN CAMERA, which every space has and which cannot be
      // taken away — the world's `main` one level down
      // (specs/SPACE_CAMERAS_PLAN.md). Through the same door every other camera
      // a space gets comes through, so the id is scoped and the two
      // back-references are set in one place rather than two.
      this.addCameraTo(space, {id: DEFAULT_CAMERA_ID});
    }
    // …and the actor hears that it exists, which is the one event every actor
    // gets without electing anything (`rules/spatial`). Queued like the rest,
    // so a handler that adds ANOTHER actor — which is the commonest thing to
    // do here — is not growing this list while somebody is walking it.
    //
    // Looked up by id rather than imported: core cannot reach the rule layer,
    // and this is the same door `renderSnapshot` opens for the transform.
    const created = this.spatialEvent(SPATIAL.created);
    if (created) {
      this.emit(created, actor);
    }
    return actor;
  }

  /**
   * One of the Spatial rule's events, if that rule is in play.
   *
   * Absent for a world built without the foundation, which is a world with no
   * positions in it — nothing to raise the event on and nothing to hear it.
   */
  private spatialEvent(id: string): GameEvent | undefined {
    const spatial = this.membership
      .items()
      .find(one => one.id === SPATIAL.rule);
    return spatial?.events?.[id];
  }

  /** The cameras this world holds. Never empty; the default is among them. */
  get cameras(): CameraCollection {
    return this.cameraCollection;
  }

  /**
   * A camera by id, or the default.
   *
   * An unknown id is the default rather than an error, for the reason
   * `addActor` gives about layers: the id comes from generated code naming a
   * block that may since have been deleted, and a world with no view at all is
   * not a better answer than a world looking through its default.
   */
  /**
   * Declare a camera.
   *
   * Not hoisted, unlike a layer: a camera is an entry in a list rather than a
   * place in a scene graph, so one can be added to a world that already exists.
   * Declaring the same id twice is the earlier one, so a reload cannot stack
   * duplicates.
   */
  defineCamera(init: CameraInit): this {
    // A SPACE'S, if it says which. The world's own are the root's and go in the
    // list they always went in (specs/SPACE_CAMERAS_PLAN.md).
    if (init.viewport !== undefined) {
      this.defineSpaceCamera(init.viewport, init);
      return this;
    }
    if (!this.cameraList.some(camera => camera.id === init.id)) {
      // A camera with no position of its own rests in the middle of THIS
      // world's view. `Camera` defaults to the middle of the standard one,
      // which is the wrong middle for a world that has said how wide it is —
      // and `set size of view` is written above `define camera`, so a camera
      // declared afterwards would never be caught by the sweep in
      // `setViewSize` either.
      const camera = makeCamera({
        ...init,
        position: init.position ?? new Vector(this.view.x / 2, this.view.y / 2),
      });
      // The back-reference a camera-scoped body reads (see `Camera.world`).
      camera.world = this;
      this.cameraList.push(camera);
    }
    return this;
  }

  /**
   * Add a camera to the space a Viewport owns.
   *
   * The id carries the space and the name does not: `win:wide` is the id, `wide`
   * the name, so two Viewports may each have a `wide` and a list of every camera
   * in the world still tells them apart (`Space.cameraNamed`).
   *
   * THROWS FOR ANYTHING THAT IS NOT A VIEWPORT, as `loadMapInto` does and for
   * the same reason: a camera declared of a Panel can never look at anything,
   * and holding the declaration in silence — which an earlier version of this
   * did, forever — is the failure this lab keeps meeting. The place to declare a
   * Viewport's camera is that Viewport's own `on create`, where it exists
   * (specs/SPACE_CAMERAS_PLAN.md).
   */
  private defineSpaceCamera(owner: string | Actor, init: CameraInit): void {
    const space =
      typeof owner === 'string'
        ? this.viewportSpaces.find(one => one.owner?.id === owner)
        : this.viewportSpaceOf(owner);
    if (!space) {
      const named = typeof owner === 'string' ? owner : owner?.id;
      throw new Error(
        `world-lab: a camera cannot be defined for “${named}”, which is not ` +
          `a Viewport in this world`,
      );
    }
    this.addCameraTo(space, init);
  }

  /** Put one declared camera into a space, unless it already has that name. */
  private addCameraTo(space: Space, init: CameraInit): void {
    if (space.cameraNamed(init.name ?? init.id)) {
      return;
    }
    const view = space.owner ? this.viewSizeOf(space.owner) : this.view;
    const camera = makeCamera({
      ...init,
      id: `${space.owner?.id ?? space.id}:${init.id}`,
      name: init.name ?? init.id,
      // The middle of the space's OWN window, as its main camera starts, and
      // for the same reason the world's rest in the middle of the world's view.
      position: init.position ?? new Vector(view.x / 2, view.y / 2),
    });
    camera.space = space.mirrors ? this.rootSpace : space;
    camera.window = space.owner;
    camera.world = this;
    space.cameras.push(camera);
  }

  /**
   * Take the view through a different camera.
   *
   * A VALUE, not structure: switching cameras moves a transform and rebuilds
   * nothing, so a game may cut between them without restarting. An unknown id
   * leaves the view where it is rather than blacking it out.
   */
  setActiveCamera(id: string): this {
    if (this.cameraList.some(camera => camera.id === id)) {
      this.activeCameraId = id;
    }
    return this;
  }

  /** The camera the view is currently taken through. */
  activeCamera(): Camera {
    return this.camera(this.activeCameraId);
  }

  camera(id: string = DEFAULT_CAMERA_ID): Camera {
    const own = this.cameraList.find(camera => camera.id === id);
    if (own) {
      return own;
    }
    // …THEN EVERY SPACE'S, by the id it was declared under rather than the one
    // it is held under. A space scopes its cameras' ids with the Viewport that
    // owns them — `win:wide`, so a list of every camera in the world tells two
    // `wide`s apart — and the generator does not know that convention and must
    // not have to: a second place computing the same name is the silent-name
    // failure this lab keeps meeting (specs/SPACE_CAMERAS_PLAN.md). So the
    // engine, which owns the convention, resolves it.
    //
    // This is what binds `camera` inside `define camera ⟨…⟩ of ⟨…⟩`, so that
    // `set actor to follow` in its mouth means the camera being defined.
    for (const space of this.viewportSpaces) {
      const found = space.cameras.find(
        camera => camera.id === id || camera.id.endsWith(`:${id}`),
      );
      if (found) {
        return found;
      }
    }
    return (
      this.cameraList.find(entry => entry.id === DEFAULT_CAMERA_ID) ??
      this.cameraList[0]
    );
  }

  /**
   * Move a camera, in world pixels.
   *
   * Copied rather than adopted, like a slot's offset and for the same reason: a
   * step that follows the player writes this every tick, and sharing one Vector
   * with the world would let a later mutation move the view with no call.
   */
  setCameraPosition(position: Vector, id: string = DEFAULT_CAMERA_ID): this {
    this.camera(id).position = new Vector(position.x, position.y);
    return this;
  }

  /**
   * How much of the camera's motion a layer takes, per axis.
   *
   * Copied rather than adopted, like a camera's position and a slot's offset:
   * a rule turning this every tick would otherwise share one Vector with the
   * world.
   */
  setLayerParallax(parallax: Vector, layer = DEFAULT_LAYER_ID): this {
    const found = this.layer(layer) ?? this.layerList[0];
    found.parallax = new Vector(parallax.x, parallax.y);
    return this;
  }

  /** Whether a layer ignores the camera entirely — what a HUD is. */
  setLayerFit(fit: boolean, layer = DEFAULT_LAYER_ID): this {
    (this.layer(layer) ?? this.layerList[0]).fit = fit;
    return this;
  }

  /** The layers, back to front. Index is depth; index 0 is the default. */
  get layers(): readonly Layer[] {
    return this.layerList;
  }

  /** A layer by id, or undefined. */
  layer(id: string): Layer | undefined {
    const index = this.layerIndex.get(id);
    return index === undefined ? undefined : this.layerList[index];
  }

  /** How deep a layer draws — its position in the stack. */
  depthOf(layer: string, space?: Space): number {
    if (space && space !== this.rootSpace) {
      const at = space.layers.findIndex(held => held.id === layer);
      return at < 0 ? 0 : at;
    }
    return this.layerIndex.get(layer) ?? 0;
  }

  /**
   * Take an actor out of the world.
   *
   * The other half of `addActor`, and a thing a learner asks for directly:
   * "when the player touches a coin, remove the coin". Takes the actor or its
   * id, and says whether there was one to remove.
   *
   * DEFERRED while a tick is running, and immediate otherwise. A removal
   * almost always comes from inside the tick that noticed it — an event
   * handler, a rule's step — where the world is being walked by whatever is
   * running, and splicing the list underneath a `for each` would skip the
   * actor after the one removed. The sweep happens after the steps and their
   * events, still before the frame is drawn, so the coin is gone from the
   * picture the learner sees.
   */
  removeActor(actor: Actor | string): boolean {
    const target =
      typeof actor === 'string'
        ? this.actorList.find(candidate => candidate.id === actor)
        : actor;
    if (!target || !this.actorList.includes(target)) {
      return false;
    }
    if (this.inTick) {
      this.leaving.add(target);
      return true;
    }
    this.detach(target);
    return true;
  }

  /** Actually take it out: off the list, and no longer pointing at this world. */
  private detach(actor: Actor): void {
    // Its children first: a parent's children are part of what it is, so
    // they go with it and hear `is removed` themselves (specs/PARENTING.md).
    // Nobody hears a loss — there is no actor left to have lost anything.
    for (const child of this.childrenOf(actor)) {
      this.detach(child);
    }
    // …and the actor hears that it is going. Here rather than in
    // `removeActor`, because that has two paths — straight out, or added to
    // the set swept at the end of a tick — and this is the one moment both of
    // them pass through.
    const removed = this.spatialEvent(SPATIAL.removed);
    if (removed && this.actorList.includes(actor)) {
      this.emit(removed, actor);
    }
    const index = this.actorList.indexOf(actor);
    if (index >= 0) {
      this.actorList.splice(index, 1);
      const left = (this.actorsById.get(actor.id) ?? 1) - 1;
      if (left > 0) {
        this.actorsById.set(actor.id, left);
      } else {
        this.actorsById.delete(actor.id);
      }
    }
    // The back-references `addActor` set; an actor that is nowhere should not
    // be able to reach the world it used to be in, nor claim a layer in it.
    actor.world = undefined;
    actor.layer = undefined;
    // A Viewport removed takes what it holds with it, as a parent takes its
    // children: the level in it has nowhere to be seen.
    const space = this.viewportSpaceOf(actor);
    if (space) {
      this.unloadSpace(space);
      this.viewportSpaces.splice(this.viewportSpaces.indexOf(space), 1);
    }
    actor.space = undefined;
  }

  /**
   * The actors carried by `actor`, in placement order — asked here rather
   * than stored on the parent, so a `parent` set anywhere is the one answer
   * (specs/PARENTING.md).
   */
  childrenOf(actor: Actor): Actor[] {
    return this.actorList.filter(candidate => candidate.parent() === actor);
  }

  /**
   * Stop the game moving, and keep it listening.
   *
   * A paused world still ticks: the clock runs, the driver draws, and the
   * `sense` phase runs — key and mouse edges become events, so a pause menu's
   * buttons still hear a click and Tab still walks the focus — and every
   * event handler runs, since handlers are how a menu answers. What stops is
   * every step after `sense`: nothing decides, moves, collides, settles or
   * animates until {@link resume}. That is what "paused" means to a player,
   * and it needs no rule to know it is paused (specs/UI_ACTORS.md).
   *
   * The interface actors that DO something each frame — a slider following
   * the pointer, a field sliding its caret — are steps too, and stop with
   * the rest; a pause menu is buttons, and buttons are events.
   */
  pause(): void {
    this.paused = true;
  }

  /** The other end of {@link pause}. */
  resume(): void {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  /** Whether an actor with `id` is already in this world. */
  hasActor(id: string): boolean {
    return this.actorsById.has(id);
  }

  /** The index, and the moment it was built for. */
  private index?: SpatialIndex;
  private indexAt = -1;
  private indexMark = -1;
  private indexCount = -1;

  /**
   * Which STEP is running, counted from the start of the world.
   *
   * The stamp the spatial index is kept against, and the reason it is a step
   * rather than a frame: a step is exactly the unit of "somebody may have moved
   * things". Two questions inside one step get one index — which is what makes
   * a search affordable, since a flood asks hundreds in a row — and the first
   * question in the next step gets a fresh one, which is what makes a collision
   * test right, since it runs after everything has moved.
   */
  private stepMark = 0;

  /** Called by the {@link Scheduler} as each step begins. */
  beginStep(): void {
    this.stepMark += 1;
  }

  /**
   * Every actor whose middle is within `radius` of a place.
   *
   * The world's own spatial question, answered through a grid of buckets
   * (`core/spatialIndex`) rather than by measuring every actor. From a PLACE
   * rather than from an actor, which is the whole reason it is here and not a
   * list operation: a search asking whether a square is clear has no actor to
   * ask about, and neither has "what is near where I am going".
   *
   * REBUILT ONCE PER STEP THAT ASKS, and only for the steps that ask. A step is
   * the unit of "somebody may have moved things", so a question asked after a
   * step that moved everything gets a fresh answer, and four hundred questions
   * inside one step get one index — which is the difference between a search
   * being affordable and being a frozen frame.
   *
   * It costs a rebuild per querying step, which is an O(n) pass: measured at a
   * tenth of a millisecond for a thousand actors, against the O(n²) it exists
   * to replace. Two consumers asking in two different phases are not building
   * the same index twice — they are asking about two different moments, and one
   * shared answer would be wrong for one of them.
   *
   * BEFORE THE FIRST STEP there is no such moment, so the stamp falls back to
   * the clock and the population — a world being described is one where nothing
   * is running, and the questions asked there are about what has been placed.
   *
   * An empty list if nothing has a position: a world with no Spatial rule is a
   * world where "near" has no meaning, which is not an error to raise at a
   * learner mid-game.
   */
  actorsNear(
    at: {x: number; y: number},
    radius: number,
    only?: {type?: string; trait?: Trait},
    /**
     * Whose space `at` is a point in: this actor's, else the actor in hand's,
     * else the root. A point means nothing without one, and what is near it
     * in another space is not near it at all (specs/VIEWPORT_PLAN.md).
     */
    sameSpaceAs?: Actor,
  ): Actor[] {
    const found = this.positional();
    if (!found) {
      return [];
    }
    const {trait, position} = found;
    const positionOf = (actor: Actor) => actor.get(position);
    if (
      !this.index ||
      this.indexMark !== this.stepMark ||
      this.indexAt !== this.elapsed ||
      this.indexCount !== this.actorList.length
    ) {
      const index = new SpatialIndex();
      for (const actor of this.actorList) {
        if (actor.has(trait)) {
          index.add(actor, positionOf(actor));
        }
      }
      this.index = index;
      this.indexMark = this.stepMark;
      this.indexAt = this.elapsed;
      this.indexCount = this.actorList.length;
    }
    const space = this.spaceOf(sameSpaceAs ?? this.inHand.at(-1));
    const near = this.index
      .near(at?.x ?? 0, at?.y ?? 0, radius, positionOf)
      .filter(actor => actor.space === space);
    // NARROWED HERE rather than by the caller, so a kind with two of it in a
    // world of a thousand allocates one short list instead of two long ones —
    // and so the block that asks for `the ⟨any Coin⟩ within ⟨80⟩` is one call.
    if (only?.type !== undefined) {
      return near.filter(actor => actor.type === only.type);
    }
    if (only?.trait) {
      return near.filter(actor => actor.has(only.trait!));
    }
    return near;
  }

  /**
   * The positional trait and its `position`, resolved through the membership
   * the way `renderSnapshot` resolves them — core speaking the Spatial rule's
   * vocabulary without importing it (`core/spatialKeys`).
   */
  private positional(): {trait: Trait; position: Property<Vector>} | undefined {
    const spatial = this.membership.items().find(r => r.id === SPATIAL.rule);
    const trait: Trait | undefined = spatial?.traits[SPATIAL.trait];
    const position = trait?.properties[SPATIAL.position] as
      | Property<Vector>
      | undefined;
    return trait && position ? {trait, position} : undefined;
  }

  /**
   * How many actors are in the world.
   *
   * Asked by `WorldBuilder.requireNoActors` to tell "the world exists" from
   * "the world has been populated" — only the second makes a late declaration
   * (a rule, an animation, a layer) impossible to honour.
   */
  actorCount(): number {
    return this.actorList.length;
  }

  /**
   * Raise an event for `actor`; dispatched after the current tick's steps.
   *
   * AS MANY VALUES AS THE EVENT'S SIGNATURE NAMES, in its order. One is the
   * ordinary case and every rule in the library makes that call; a designed
   * event may carry several, and a handler reads each by the name its author
   * gave it (specs/EVENT_VALUES_PLAN.md).
   */
  emit(event: GameEvent, actor: Actor, ...values: readonly unknown[]): void {
    this.events.enqueue(event, actor, ...values);
  }

  /**
   * Raise an event that is about the WORLD — a key went down, a level was
   * cleared — with no actor it happened to.
   *
   * A separate method rather than an optional argument, because the two say
   * different things and `emit(event, value)` would read as an actor with the
   * value in its place. Which of the two a rule uses is decided by where it
   * declared the event: under a trait it is an actor's, on the rule it is the
   * world's.
   *
   * Dispatched with the actor ones, after this tick's steps.
   */
  emitToWorld(event: GameEvent, ...values: readonly unknown[]): void {
    this.events.enqueue(event, undefined, ...values);
  }

  /**
   * Register one of the world's own events under the name it reads by.
   *
   * WHY A REGISTRY AND NOT AN IMPORT. A map raises the world's events, and a
   * map's module cannot import the world's: the world LOADS the map, so that
   * is a cycle, and a `.map` is meant to be loadable by several worlds, so it
   * cannot name one anyway (specs/MAP_EVENTS_PLAN.md).
   *
   * So the world says what it holds and the map names one — the third time a
   * name arriving as DATA has needed this, beside `define` for actor kinds and
   * `defineTheme` for themes. The preamble emits one call per declared event.
   */
  defineEvent(name: string, event: GameEvent): void {
    this.namedEvents.set(name, event);
  }

  private readonly namedEvents = new Map<string, GameEvent>();

  /**
   * Raise one of the world's events, by name.
   *
   * BY NAME, because a map cannot import the world that loads it: the world
   * registers what it declares and the map says the word
   * (specs/MAP_EVENTS_PLAN.md).
   *
   * A name that names nothing raises nothing and says so, which is the
   * emptiest correct answer rather than a guard against anything reachable. A
   * project has one world, and a map's `emit` is a block type that exists only
   * because that world declared the event — so the name is always one the
   * preamble registered. Nothing calls this with a name of its own invention.
   */
  emitNamed(name: string, ...values: readonly unknown[]): boolean {
    const event = this.namedEvents.get(name);
    if (!event) {
      return false;
    }
    this.events.enqueue(event, undefined, ...values);
    return true;
  }

  /**
   * Handle a world event. The counterpart of `Actor.on`, and the reason a world
   * event needs no actor to be raised for: the world holds the handlers.
   */
  on(event: GameEvent, handler: WorldEventHandler): void {
    const list = this.worldHandlers.get(event);
    if (list) {
      list.push(handler);
    } else {
      this.worldHandlers.set(event, [handler]);
    }
  }

  /** Handlers registered for a world event; used by the EventQueue on flush. */
  handlersFor(event: GameEvent): readonly WorldEventHandler[] {
    return this.worldHandlers.get(event) ?? [];
  }

  /**
   * How big the world is, in world pixels — the largest map loaded into it.
   *
   * The LARGEST rather than the first or the last, because a world may load
   * several (a level and a HUD) and the honest answer to "how big is this
   * world" is as big as the biggest thing in it. A HUD the size of the viewport
   * must not shrink the level.
   *
   * The viewport's own size until a map says otherwise, so a world with no map
   * is one screen big rather than zero.
   *
   * Safe to hand out directly: a Vector is immutable.
   */
  mapBounds(actor?: Actor | Camera): Vector {
    return this.spaceOf(actor ?? this.inHand.at(-1)).bounds;
  }

  /**
   * Somewhere in the map, picked at random — uniform over the whole rectangle.
   *
   * Here rather than in the block that offers it, because "the map" is the
   * world's own idea and the block would otherwise have to ask for the bounds
   * and then do arithmetic on them in generated code. It also means the builder
   * can answer it (`WorldBuilder.randomPlace`), so scattering asteroids while
   * describing a world reads the same as spawning one mid-game.
   *
   * NOT seeded, so two runs differ. That is what a learner means by random, and
   * a repeatable game is a bigger idea than this block should smuggle in.
   */
  randomPlace(): Vector {
    const bounds = this.mapBounds();
    return new Vector(Math.random() * bounds.x, Math.random() * bounds.y);
  }

  /**
   * Seconds the world has been running.
   *
   * The sum of every `delta` it has been ticked by, NOT a reading of the wall
   * clock. Three things follow, and all three are the point:
   *
   * A world that is not RUNNING does not age. A world nobody ticks does not,
   * and neither does a paused one — `tick` leaves this alone while the game is
   * paused, though it still runs the `sense` steps so the menu that paused it
   * can be clicked. That is what a learner means by "two seconds later": two
   * seconds of game, not two seconds of sitting in a menu.
   *
   * It is why `the time now` is a separate block. Everything measured in this
   * — a cooldown, a lifetime, a delay — should wait while the game does, and
   * the wall clock should not (specs/CLOCK_PLAN.md).
   *
   * It agrees exactly with anything integrated from `delta`. A bullet that has
   * traveled `speed × 2` has an age of exactly 2, because the same numbers
   * added up both times. Sampling a clock here would let the two disagree by
   * however long the frame took to draw.
   *
   * And it is stamped ONCE per frame, before any step runs, so every step in a
   * frame reads the same value. That is what lets steps sharing a moment
   * commute: two steps that both ask the time get the same answer whichever
   * order the scheduler happens to run them in (core/phases).
   */
  time(): number {
    return this.elapsed;
  }

  /**
   * How big the window onto the world is, in world pixels.
   *
   * Fixed today (core/viewport). A method rather than the constant so a rule
   * reads it the way it reads everything else about the world, and so making it
   * settable later changes nothing that asks.
   */
  viewSize(actor?: Actor | Camera): Vector {
    const subject = actor ?? this.inHand.at(-1);
    // A camera a Viewport owns is seen through that Viewport's window, and for
    // a mirror that is not the window of the space it looks at
    // (`Camera.window`, specs/MIRRORING_PLAN.md).
    if (subject instanceof Camera && subject.window) {
      return this.viewSizeOf(subject.window);
    }
    const space = this.spaceOf(subject);
    return space.owner
      ? this.viewSizeOf(space.owner)
      : new Vector(this.view.x, this.view.y);
  }

  /** How big a Viewport is on screen: its drawn size. */
  private viewSizeOf(viewport: Actor): Vector {
    const size = this.intrinsicSizeProperty();
    const scale = this.scaleProperty();
    const intrinsic = size ? viewport.get(size) : new Vector(0, 0);
    const scaled = scale ? viewport.get(scale) : new Vector(1, 1);
    return new Vector(
      (intrinsic.x > 0 ? intrinsic.x : this.view.x) * Math.abs(scaled.x),
      (intrinsic.y > 0 ? intrinsic.y : this.view.y) * Math.abs(scaled.y),
    );
  }

  // ── Spaces (specs/VIEWPORT_PLAN.md) ──────────────────────────────────────

  /** The space `subject` is in: an actor's own; a camera's is the root. */
  spaceOf(subject: Actor | Camera | undefined): Space {
    return subject && 'space' in subject && subject.space
      ? subject.space
      : this.rootSpace;
  }

  /** The space a Viewport owns, or nothing for an actor that is not one. */
  viewportSpaceOf(actor: Actor): Space | undefined {
    return this.viewportSpaces.find(space => space.owner === actor);
  }

  /** Every space a Viewport owns, in the order the Viewports were placed. */
  get spaces(): readonly Space[] {
    return this.viewportSpaces;
  }

  /**
   * Take `subject` in hand for the length of `fn` — see the field. Nested,
   * so a loop inside a handler is at its own actor and the handler is back
   * at its subject after.
   */
  withActor<T>(subject: Actor | Camera, fn: () => T): T {
    this.inHand.push(subject);
    try {
      return fn();
    } finally {
      this.inHand.pop();
    }
  }

  /** The two halves of `withActor`, for a generated loop's body. */
  enter(subject: Actor | Camera): void {
    this.inHand.push(subject);
  }

  leave(): void {
    this.inHand.pop();
  }

  /** The actor in hand, if any — for what asks after it by name. */
  actorInHand(): Actor | Camera | undefined {
    return this.inHand.at(-1);
  }

  /**
   * Register a map under its module path, so it can be loaded by a path
   * held in a property — a Viewport's `map`. The world module registers
   * every map the project holds (specs/VIEWPORT_PLAN.md).
   */
  defineMap(path: string, map: WorldMap): void {
    this.maps.set(path, map);
  }

  /** A registered map, by path. */
  mapNamed(path: string): WorldMap | undefined {
    return this.maps.get(path);
  }

  /**
   * Replace what `viewport` holds with `map` — by value, or by the path a
   * property holds. What it held is unloaded first, so a Viewport shows one
   * map at a time; the space's bounds start over at the map's size, and its
   * camera at the middle of the window it is seen through.
   */
  loadMapInto(
    viewport: Actor,
    map: WorldMap | string,
    layer?: string,
  ): Actor[] {
    const space = this.viewportSpaceOf(viewport);
    if (!space) {
      throw new Error(
        `world-lab: “${viewport.id}” is not a Viewport, so nothing can be ` +
          `loaded into it`,
      );
    }
    // What it held goes first, whatever comes: a path nothing registered
    // leaves a Viewport showing nothing, which is what the path says. A mirror
    // stops being one for the same reason — it is about to show a map of its
    // own (specs/MIRRORING_PLAN.md).
    this.stopMirroring(space);
    this.unloadSpace(space);
    const held = typeof map === 'string' ? this.maps.get(map) : map;
    if (typeof map === 'string') {
      this.nowShows(viewport, space, map);
    }
    // The space's layers are the map's, made before anything is placed so
    // each placement's layer resolves against them.
    space.layers = layersOfMap(held?.layers);
    if (!held) {
      return [];
    }
    const view = this.viewSizeOf(viewport);
    space.bounds = new Vector(view.x, view.y);
    space.camera!.position = new Vector(view.x / 2, view.y / 2);
    const added = this.loadInto(space, held, layer);
    this.settleSpace(space);
    // …and the Viewport hears that its map has landed, with the path as the
    // value when there is one. AFTER the load and queued, so a handler that
    // aims the Viewport's camera finds the map's actors already there — which
    // an `on create` handler does not (`ViewportShowsMapEvent`).
    if (viewport.has(ViewportTrait)) {
      this.emit(
        ViewportShowsMapEvent,
        viewport,
        typeof map === 'string' ? map : (space.shown ?? ''),
      );
    }
    return added;
  }

  /** Take back everything loaded into `viewport`. */
  unloadViewport(viewport: Actor): void {
    const space = this.viewportSpaceOf(viewport);
    if (space) {
      this.stopMirroring(space);
      this.unloadSpace(space);
      this.nowShows(viewport, space, '');
    }
  }

  /**
   * Record the path a Viewport shows, in the space AND in the Viewport's
   * `map` property. Both, because `showHeldMap` loads whatever the property
   * names whenever that differs from what is shown: a load by path that left
   * the property naming the old map was undone on the next tick, by the
   * engine loading the old map back. With the property written, it is also
   * what a block reading it and the inspector are told, and setting it back
   * to an earlier path is a change again.
   */
  private nowShows(viewport: Actor, space: Space, path: string): void {
    space.shown = path;
    if (
      viewport.has(ViewportTrait) &&
      String(viewport.get(ViewportMapProperty) ?? '') !== path
    ) {
      viewport.set(ViewportMapProperty, path);
    }
  }

  private unloadSpace(space: Space): void {
    for (const load of space.loads.splice(0)) {
      load.unload();
    }
  }

  /**
   * Keep each Viewport's camera on what it follows and inside what it
   * shows — what the camera rules do for the world's camera, done here for
   * a camera no block can elect a trait on. Run at the end of every tick.
   */
  private settleSpaces(): void {
    for (const space of this.viewportSpaces) {
      this.showHeldMap(space);
      // A mirror's bounds are the root's, which a `load map` may have grown
      // since (`growSpaceToFit`).
      if (space.mirrors) {
        space.bounds = this.rootSpace.bounds;
      }
      this.showsThrough(space);
      this.settleSpace(space);
    }
  }

  /**
   * Keep the space's active camera in step with what its Viewport says.
   *
   * Beside `showHeldMap`, and for the same reason it is there: a Viewport's
   * properties are how a project talks to its space, and a change to one is
   * noticed once a tick rather than hooked on the write. So cutting to another
   * camera is an ordinary `set` — `set shows through of ⟨the Minimap⟩ to
   * ⟨"chase"⟩` — with nothing to invent and nothing to remember to call.
   *
   * Empty is the space's main camera, which is what a Viewport that has never
   * heard of cameras says (`ViewportShowsThroughProperty`).
   */
  private showsThrough(space: Space): void {
    const owner = space.owner;
    if (!owner?.has(ViewportTrait)) {
      return;
    }
    const named = String(owner.get(ViewportShowsThroughProperty) ?? '');
    space.activeCameraName = named || DEFAULT_CAMERA_ID;
  }

  /**
   * Load the map a Viewport's `map` property names, when it is not the one
   * shown: at the first tick after the Viewport is placed, and again
   * whenever the property changes (`rules/viewport`). A path nothing
   * registered shows nothing, as `loadMapInto` says.
   */
  private showHeldMap(space: Space): void {
    const owner = space.owner;
    if (!owner || !owner.has(ViewportTrait)) {
      return;
    }
    const path = String(owner.get(ViewportMapProperty) ?? '');
    if (path === (space.shown ?? '')) {
      return;
    }
    if (path === VIEWPORT.theWorld) {
      this.mirrorWorldIn(space);
      this.nowShows(owner, space, path);
      return;
    }
    space.shown = path;
    this.loadMapInto(owner, path);
  }

  /**
   * Bind a Viewport to the root's scene (specs/MIRRORING_PLAN.md).
   *
   * What it held goes, since a Viewport shows one thing at a time; its
   * cameras are pointed at the root, so a query with one in hand answers about
   * the one game there is; and its bounds become the root's, kept in step each
   * tick, so a camera confined to the map is confined to the world's.
   */
  private mirrorWorldIn(space: Space): void {
    this.unloadSpace(space);
    space.mirrors = true;
    space.bounds = this.rootSpace.bounds;
    for (const camera of space.cameras) {
      camera.space = this.rootSpace;
    }
  }

  /** The other way: a Viewport that mirrored is about to show a map of its own. */
  private stopMirroring(space: Space): void {
    if (!space.mirrors) {
      return;
    }
    space.mirrors = false;
    for (const camera of space.cameras) {
      camera.space = space;
    }
  }

  /**
   * Put a space's camera where the Viewport scrolled it, and say where it is.
   *
   * WHAT THIS NO LONGER DOES is follow an actor. The map's `camera.follows` is
   * gone, and with it the second implementation of following: where the view
   * looks is logic, a map is data, and a hundred level maps should no more each
   * configure a camera than each mint a `complete`
   * (specs/SPACE_CAMERAS_PLAN.md, specs/MAP_EVENTS_PLAN.md). A Viewport's
   * camera follows by electing `Follows`, as the world's always has.
   *
   * A CAMERA THAT ELECTS ANYTHING IS THE RULES' TO AIM, and this leaves it
   * alone — otherwise the camera steps would aim it during the frame and this
   * would overwrite them at the end of it, which is exactly what the branch
   * above did. A camera that elects NOTHING is still the Viewport's to scroll,
   * because a scroll view is the Viewport deciding about the scene it shows and
   * not a map deciding about itself (specs/SCROLLING_PLAN.md).
   *
   * Confinement goes the same way: the scroll path clamps, because `scroll`
   * promises a reading of where it actually stopped, and a camera with traits is
   * confined by `Confined to the Map` or by nothing at all — which is how the
   * world's cameras have always behaved.
   */
  private settleSpace(space: Space): void {
    const camera = space.camera;
    if (!camera || !space.owner) {
      return;
    }
    const owner = space.owner;
    const view = this.viewSizeOf(owner);
    if (!camera.traits().length && owner.has(ViewportTrait)) {
      // A scroll is measured from the top left of the content and a camera from
      // its middle, so the two differ by half a window.
      const scrolled = owner.get(ViewportScrollProperty) as VectorLike;
      const at = new Vector(scrolled.x + view.x / 2, scrolled.y + view.y / 2);
      // Inside the bounds, or at the middle of an axis the view is wider than.
      const clamp = (value: number, half: number, size: number) =>
        size <= half * 2
          ? size / 2
          : Math.min(Math.max(value, half), size - half);
      camera.position = new Vector(
        clamp(at.x, view.x / 2, space.bounds.x),
        clamp(at.y, view.y / 2, space.bounds.y),
      );
    }
    // …and where it ended up written back, whoever moved it, so what a project
    // reads is where it actually is rather than what it asked for. A scrollbar
    // drawn from an unclamped number runs off its track, and "am I at the
    // bottom" would never be true for anybody who dragged past it.
    if (owner.has(ViewportTrait)) {
      const settled = new Vector(
        camera.position.x - view.x / 2,
        camera.position.y - view.y / 2,
      );
      const was = owner.get(ViewportScrollProperty) as VectorLike;
      if (was.x !== settled.x || was.y !== settled.y) {
        owner.set(ViewportScrollProperty, settled);
      }
      const bounds = owner.get(ViewportContentProperty) as VectorLike;
      if (bounds.x !== space.bounds.x || bounds.y !== space.bounds.y) {
        owner.set(ViewportContentProperty, space.bounds);
      }
    }
  }

  /**
   * Every Viewport's space, for the driver: whose it is, where its camera
   * looks, how much of it is shown, and how big it is.
   */
  spaceSnapshot(): ReadonlyArray<{
    id: string;
    owner: string;
    mirrors: boolean;
    camera: {x: number; y: number};
    view: {x: number; y: number};
    bounds: {x: number; y: number};
    /** The space's own layers, back to front, as `layerSnapshot` gives the world's. */
    layers: ReadonlyArray<{
      id: string;
      parallax: {x: number; y: number};
      fit: boolean;
      background: BackdropState;
      foreground: BackdropState;
    }>;
  }> {
    return this.viewportSpaces.flatMap(space => {
      if (!space.owner || !space.camera) {
        return [];
      }
      const view = this.viewSizeOf(space.owner);
      return [
        {
          id: space.id,
          owner: space.owner.id,
          // Whether the box shows the root's scene rather than a scene of its
          // own — which the driver draws through the world's display list
          // (specs/MIRRORING_PLAN.md).
          mirrors: space.mirrors,
          camera: {x: space.camera.position.x, y: space.camera.position.y},
          view: {x: view.x, y: view.y},
          bounds: {x: space.bounds.x, y: space.bounds.y},
          layers: space.layers.map(layer => ({
            id: layer.id,
            parallax: {x: layer.parallax.x, y: layer.parallax.y},
            fit: layer.fit,
            background: layer.background,
            foreground: layer.foreground,
          })),
        },
      ];
    });
  }

  /**
   * Say how much of the world is on screen at once, in TILES.
   *
   * The view was a constant — ten tiles square, the size the first levels were
   * built at — and the constant is still the default, so a world that says
   * nothing looks exactly as it did. What it could not say was the other kind
   * of level: a room 26 by 16 that is meant to be taken in at a glance, where
   * a camera panning over it would be hiding the puzzle rather than following
   * the action.
   *
   * TILES, for the reason `setMapSize` gives: a level is authored in tiles and
   * read in pixels, so each end uses its own unit and the conversion happens
   * here.
   *
   * IT IS THE NATIVE RESOLUTION, not a zoom. The driver sizes its canvas to
   * this and the pane scales that up, so a bigger view is more of the world at
   * the same tile size rather than the same world drawn smaller.
   */
  setViewSize(columns: number, rows: number): void {
    const was = this.view;
    this.view = new Vector(
      Math.max(0, Math.round(columns)) * TILE_SIZE || VIEWPORT_WIDTH,
      Math.max(0, Math.round(rows)) * TILE_SIZE || VIEWPORT_HEIGHT,
    );
    // A camera resting in the middle of the OLD view would be looking a
    // quarter of a level away from where it was, so the ones that are still
    // where they were declared follow the view they rest in. One that has been
    // moved — by a block, or by Camera Follow — is left where it was put.
    const middle = new Vector(this.view.x / 2, this.view.y / 2);
    for (const camera of this.cameraList) {
      if (camera.position.x === was.x / 2 && camera.position.y === was.y / 2) {
        camera.position = middle;
      }
    }
    this.reanchor();
  }

  /**
   * Place every anchored placement again, against the window as it is now.
   *
   * ANCHORS WERE MEASURED ONCE, AT LOAD, and a world's main map is loaded
   * between its prologue and its rows so that a row can name what the map
   * placed (specs/MAP_BEFORE_ROWS_PLAN.md). So `set view size` in a world's
   * body runs AFTER the load: the placements had already been fitted to the
   * default window and were never fitted again. Notes met it — NEW NOTE is
   * anchored to the bottom of a 320x576 map, was placed against the default
   * 320x320 window at y=264, and stayed there when the body made the window
   * 576 tall, which is the middle of it.
   *
   * ONE THAT HAS BEEN MOVED IS LEFT WHERE IT WAS PUT, which is the rule the
   * cameras above already follow through a resize. A placement a program has
   * dragged somewhere is somewhere for a reason, and shifting it back would
   * undo the program.
   *
   * Only the placements in a space the WORLD's window sizes. A Viewport's
   * space is sized by the Viewport (`viewSizeOf`), and nothing here changed
   * that.
   */
  private reanchor(): void {
    const property = this.positionalProperty(SPATIAL.position);
    if (!property) {
      return;
    }
    const view = this.viewSize();
    for (const actor of this.actorList) {
      const hold = this.anchorHolds.get(actor);
      if (!hold || hold.space.owner || actor.parent()) {
        continue;
      }
      const at = actor.get(property) as Vector;
      if (at.x !== hold.put.x || at.y !== hold.put.y) {
        continue; // moved since; it is where it was put on purpose
      }
      const put = anchored(hold.at, hold.anchor, hold.drawn, view);
      actor.set(property, put);
      hold.put = put;
    }
  }

  /**
   * What it would take to place an anchored placement again.
   *
   * A WeakMap rather than a list to prune: a dialog loads and unloads over and
   * over, and a strong reference to every placement one ever made would be a
   * leak that grew with the session. What is iterated is the world's own actor
   * list, which is already the set of actors that exist.
   */
  private readonly anchorHolds = new WeakMap<
    Actor,
    {
      readonly space: Space;
      readonly anchor: Anchor;
      /** Where the MAP put it — what the offset is measured from. */
      readonly at: Vector;
      /** The map's drawn size, which the offset is measured against. */
      readonly drawn: Vector;
      /** Where this last put it; a position that differs was set elsewhere. */
      put: Vector;
    }
  >();

  /**
   * Say how big the world is, in TILES.
   *
   * The other way bounds are decided, and the only one a world without a
   * `.map` file has: `growToFit` learns the size from a document, and this is
   * a world stating it. A world that places its actors with `create in map`
   * arranges them in the block rather than in a document, so nothing would
   * otherwise ever tell it that the level is four screens wide — and every
   * rule that asks (`Camera Confined`, "Stays in the Map", `random place`)
   * would go on answering "one screen" without complaining.
   *
   * TILES, although `mapBounds` answers in pixels, and the asymmetry is the
   * right way round. A map is AUTHORED in tiles — it is what the map editor's
   * Width and Height are, and what a `.map` file's `size` holds — while
   * everything that reads a size is doing arithmetic against positions, which
   * are pixels. So the unit each end uses is the unit its own side works in,
   * and the conversion happens once, here.
   *
   * Against the engine's `TILE_SIZE`, since a world stating its own size has
   * no document to carry a tile size of its own.
   *
   * SET rather than grow, unlike `growToFit`. This is a world saying what it
   * is, so it wins over the default; a map loaded afterwards may still grow it
   * past this, which keeps "as big as the biggest thing in it" true.
   */
  setMapSize(columns: number, rows: number): void {
    this.bounds = new Vector(
      Math.max(0, Math.round(columns)) * TILE_SIZE || VIEWPORT_WIDTH,
      Math.max(0, Math.round(rows)) * TILE_SIZE || VIEWPORT_HEIGHT,
    );
  }

  /**
   * Take a map's size into account. Called by `loadMap`, which is the only
   * thing that knows a map was loaded.
   */
  growToFit(map: {
    size?: {width: number; height: number};
    tile?: {width: number; height: number};
  }): void {
    this.growSpaceToFit(this.rootSpace, map);
  }

  /**
   * Move each anchored placement to where it belongs in this window.
   *
   * WHAT IS MEASURED is how far the placement sits from its anchor's point in
   * the MAP; what is applied is that same distance from the anchor's point in
   * the VIEW. A learner drags a thing into the corner and says which corner;
   * nobody types an offset (specs/ANCHORS_PLAN.md).
   *
   * A map with no size anchors nothing: there is nothing to measure against,
   * and a synthesised map — one a `map` block builds out of blocks — has
   * none.
   *
   * A CHILD IS LEFT ALONE. A parented placement's position is its local one,
   * measured from its parent rather than from the map, so an anchor on one
   * would move it by the distance between two things it is not between. The
   * parent's anchor carries the child, which is what parenting is for.
   */
  private applyAnchors(
    space: Space,
    map: WorldMap,
    anchoring: ReadonlyArray<[Actor, Anchor]>,
  ): void {
    if (anchoring.length === 0 || !map.size || !map.tile) {
      return;
    }
    const property = this.positionalProperty(SPATIAL.position);
    if (!property) {
      return;
    }
    const drawn = new Vector(
      map.size.width * map.tile.width,
      map.size.height * map.tile.height,
    );
    const view = space.owner ? this.viewSize(space.owner) : this.viewSize();
    for (const [actor, anchor] of anchoring) {
      if (actor.parent()) {
        continue;
      }
      const at = actor.get(property) as Vector;
      const put = anchored(at, anchor, drawn, view);
      actor.set(property, put);
      // Kept, so that a window resized afterwards can measure again from the
      // MAP's position rather than from this one (`reanchor`).
      this.anchorHolds.set(actor, {space, anchor, at, drawn, put});
    }
  }

  private growSpaceToFit(
    space: Space,
    map: {
      size?: {width: number; height: number};
      tile?: {width: number; height: number};
    },
  ): void {
    if (!map.size || !map.tile) {
      return; // a synthesised map has no size; the space keeps the one it had
    }
    space.bounds = new Vector(
      Math.max(space.bounds.x, map.size.width * map.tile.width),
      Math.max(space.bounds.y, map.size.height * map.tile.height),
    );
  }

  /**
   * Place the actors a Map describes.
   *
   * A world may load several — a HUD, a menu over a game. Loading is additive,
   * so they stack in call order, and each load can be taken back by the
   * handle its script is given (`MapLoad.unload`). REPLACING a level is not
   * this: a level is what a Viewport holds, and `loadMapInto` replaces it.
   *
   * IT WORKS WHILE THE GAME RUNS, which is what lets a menu come up in a
   * handler. It lived on `WorldBuilder` alone until that was wanted.
   *
   * `layer` puts every actor the map describes into one layer, which is what
   * makes a HUD a HUD: the map is an ordinary map, and the layer it is loaded
   * into is the whole of what makes it an interface (specs/VIEWPORT.md).
   */
  loadMap(map: WorldMap, layer?: string): Actor[] {
    const added = this.loadInto(this.rootSpace, map, layer);
    // A Viewport this map placed holds its map FROM HERE, not from the end
    // of the next tick, which is when `settleSpaces` would get to it. A
    // world built from a main map with a Viewport on it has its level in it
    // when it is handed over, and a handler in the first frame — the key
    // that serves the ball — finds the ball. One level deep on purpose: a
    // Viewport inside the map just shown waits for the tick, so a map that
    // holds a Viewport onto itself grows a level a tick and not a stack.
    for (const actor of added) {
      const space = actor.has(ViewportTrait)
        ? this.viewportSpaceOf(actor)
        : undefined;
      if (space) {
        this.showHeldMap(space);
      }
    }
    return added;
  }

  /**
   * Load a map the project holds, BY PATH — `load the map named ⟨…⟩`.
   *
   * The counterpart of `loadMap`, which takes the map itself and so can only
   * name one a file imported. A path can be worked out: which screen to go
   * to, which level is next. Every map a project holds is registered here
   * whether or not anything imports it, for the reason a Viewport needs
   * (`defineMap`), so a path is enough.
   *
   * A path nothing registered loads nothing, which is what the path says.
   */
  loadMapNamed(path: string, layer?: string): Actor[] {
    const held = this.maps.get(path);
    return held ? this.loadMap(held, layer) : [];
  }

  /**
   * Close the newest map the world itself holds, and say whether there was
   * one — `unload the newest map`, and the whole of what "back" is.
   *
   * THE WORLD'S OWN SPACE, not a Viewport's: a Viewport shows one map and
   * swapping it is `load map ⟨…⟩ into ⟨…⟩`, which has its own block and its
   * own meaning. This is the stack a screen sits on
   * (specs/SCREENS_PLAN.md).
   *
   * The map a world was BUILT from is a load like any other, so a project
   * that goes back often enough closes its own first screen and is left with
   * nothing. That is what it asked for; a rule that keeps a floor under it is
   * the rule's business, and `Screens` keeps one.
   */
  unloadNewestMap(): boolean {
    const load = this.rootSpace.loads.at(-1);
    load?.unload();
    return load !== undefined;
  }

  /** Place a map's actors into `space` — `loadMap`'s body, for any space. */
  private loadInto(space: Space, map: WorldMap, layer?: string): Actor[] {
    this.growSpaceToFit(space, map);
    const lookup = this.propertyLookup();
    const added: Actor[] = [];
    /** The placements that hold on to an edge, and which edge. */
    const anchoring: Array<[Actor, Anchor]> = [];
    /**
     * Placements by the id the MAP gave them, and the actor-typed values
     * waiting on one.
     *
     * A map is JSON and JSON holds no actors, so a placement names another by
     * its entry id and this resolves it — in a SECOND PASS, once every entry
     * exists, which is what lets a reference point forwards or in a circle.
     *
     * Ordering the entries so references came first would have done for the
     * forward case and cost two things it should not: placement order is DRAW
     * order within a layer (`renderSnapshot` walks `actorList` as it was
     * filled), and a cycle has no order at all.
     *
     * By ENTRY id, not by the actor's. `resolveInstanceId` disambiguates a
     * taken id to `base#2`, and maps stack — a level and a HUD — so looking a
     * name up in the world could find an actor from another map or the wrong
     * one of two. What a placement means by "Player" is the Player in THIS
     * map.
     */
    const placed = new Map<string, Actor>();
    const deferred: Array<[Actor, Property, string | string[]]> = [];
    for (const entry of map.actors) {
      const builder = this.types.get(entry.type);
      if (!builder) {
        throw new Error(
          `World '${this.id}': map references unregistered actor type ` +
            `'${entry.type}' (register it with define())`,
        );
      }
      // Stamp the actor's kind with the map's registered type (the module), so
      // "actors of a type" lookups match it regardless of the template's id/name.
      const actor = builder.instantiate(
        this.resolveInstanceId(builder, entry.id),
        entry.type,
      );
      // The world's rules and traits, plus THIS actor's own — which belong to
      // no rule and so are in no world-wide lookup. A placement carrying one
      // used to be dropped here in silence: the inspector could not offer it
      // either, so nothing ever wrote one and nothing noticed.
      const own = new Map<string, Property>(
        actor
          .ownProperties()
          .map(property => [`${property.ownerId}.${property.id}`, property]),
      );
      if (entry.id) {
        placed.set(entry.id, actor);
      }
      for (const [ownerId, props] of Object.entries(entry.properties ?? {})) {
        for (const [propId, value] of Object.entries(props)) {
          const key = `${ownerId}.${propId}`;
          const property = own.get(key) ?? lookup.get(key);
          if (!property || !actor.hasProperty(property)) {
            continue;
          }
          // An actor-typed value is the id of another entry, and the actor it
          // names may not exist yet. Held over rather than resolved here.
          //
          // A SET of them is the same thing several times over — a list of
          // entry ids — and is held over for the same reason: any one of them
          // may be an entry this loop has not reached.
          if (property.type === 'actor' && typeof value === 'string') {
            deferred.push([actor, property, value]);
            continue;
          }
          if (property.type === 'actors' && Array.isArray(value)) {
            deferred.push([actor, property, value as string[]]);
            continue;
          }
          actor.set(property, value);
        }
      }
      // The kind's own per-frame steps (`World.useActorKind`). Here rather
      // than inside `addActor` because this path builds the actor itself, so
      // the World never sees the template it came from.
      this.useActorKind(entry.type, builder);
      this.place(actor, entry.layer ?? layer, space);
      if (isAnchor(entry.anchor)) {
        anchoring.push([actor, entry.anchor]);
      }
      added.push(actor);
    }
    // Every entry exists now, so the references can be followed.
    //
    // One that names nothing is LEFT UNSET, which is what a map already does
    // with a property it cannot resolve. A placement may point at one that has
    // since been deleted, and refusing to load the map over it would take a
    // whole level away for a bar pointed at a missing enemy.
    for (const [actor, property, id] of deferred) {
      if (Array.isArray(id)) {
        // The ones that still exist, in the order the map listed them. Names
        // that resolve to nothing are dropped rather than kept as holes: a
        // list with a gap in it is a list every reader has to check.
        const targets = id
          .map(one => placed.get(one))
          .filter((one): one is Actor => one !== undefined);
        actor.set(property, targets as never);
        continue;
      }
      const target = placed.get(id);
      if (!target) {
        continue;
      }
      // A placement's stored position is its LOCAL one when it has a parent
      // (specs/PARENTING.md, "The map"), and it was stored before the parent
      // could be known; so the parent is set WITHOUT converting, and the
      // events a parent raises are raised here, after every entry's
      // `is created`.
      if (parentingKeys()?.parent === property) {
        actor.setParent(target, {keepWorld: false});
        continue;
      }
      actor.set(property, target as never);
    }
    // …and the anchored ones moved to where they belong in THIS window,
    // after the references are followed so a parent is known, and before the
    // script runs so it sees final positions (specs/ANCHORS_PLAN.md).
    this.applyAnchors(space, map, anchoring);
    // What the map DOES, once everything it placed exists and every reference
    // is followed, so a hat about the Resume button registers on the button
    // and `the ⟨Door⟩` finds the door.
    const load = new MapLoad(
      this,
      added,
      space.loads,
      map.modal === true,
      typeof map.theme === 'string' ? map.theme : '',
    );
    space.loads.push(load);
    for (const actor of added) {
      this.loadOf.set(actor, load);
    }
    if (typeof map.script === 'function') {
      map.script(this, Object.fromEntries(placed), load);
    }
    return added;
  }

  /** Map `${ownerId}.${propId}` -> Property across the world's rules + traits. */
  private propertyLookup(): Map<string, Property> {
    const lookup = new Map<string, Property>();
    const add = (property: Property) =>
      lookup.set(`${property.ownerId}.${property.id}`, property);
    for (const rule of this.activeRules()) {
      for (const property of Object.values(rule.properties)) {
        add(property);
      }
      for (const trait of Object.values(rule.traits)) {
        for (const property of Object.values(trait.properties)) {
          add(property);
        }
      }
    }
    return lookup;
  }

  /**
   * Register an actor template under the name a Map refers to it by.
   *
   * A map is JSON: it names a kind by its module path and nothing more, so
   * something has to hold the templates those names mean. `WorldBuilder.define`
   * is the same call one level up, and hands its own over before it loads.
   */
  define(type: string, template: ActorTemplate): this {
    this.types.set(type, template);
    return this;
  }

  /** Replace the pressed-key set (driver calls this each frame before `tick`). */
  setInput(keys: Iterable<string>): void {
    this.held = new Set(keys);
    // Answered straight away as well as at the top of `tick`, so a caller that
    // sets the keys and asks `isKeyDown` without ticking gets what it said.
    this.keys = this.held;
  }

  /**
   * Add to what was typed this frame — the driver calls this per keystroke.
   *
   * APPENDED rather than replaced, unlike `setInput`: several characters may
   * arrive between two frames, and a call per character is what the DOM hands
   * over.
   */
  addTyped(characters: Iterable<string>): void {
    this.typed.push(...characters);
  }

  /**
   * Type as if the player had — `type ⟨"a"⟩`.
   *
   * READ NEXT FRAME, not this one, and the lag is honest rather than a
   * compromise: this is called from a handler, a handler runs after the step
   * that reads what was typed, and a click IS a frame late. See `pendingTyped`
   * and specs/KEYBOARD_PLAN.md.
   *
   * Nothing hears this as "the world typed" — it arrives exactly where the
   * keyboard's characters arrive, so a Text Input, a Text Area and a project's
   * own `types ⟨character⟩` handler all work with no change at all. That is the
   * whole reason an on-screen keyboard types instead of reaching into a field.
   */
  type(characters: Iterable<string>): void {
    this.pendingTyped.push(...characters);
  }

  /**
   * Press and release a key as if the player had — `press the ⟨backspace⟩ key`.
   *
   * The counterpart to `type` for the keys that make no character: backspace,
   * delete and enter are edits and commands, and a field handles them as
   * `presses ⟨key⟩` (`actors/textInput`). Down for one frame, up the next.
   */
  pressKey(key: string): void {
    this.pendingKeys.add(key);
  }

  /** What was typed since the last tick, in order. */
  typedCharacters(): readonly string[] {
    return this.typed;
  }

  /**
   * Ask the browser to leave `key` to the game — `capture the ⟨tab⟩ key`.
   *
   * Refused for `escape`, which is the way out of the game and is not the
   * game's to take (`core/keys`, RESERVED_KEYS). Refused silently rather than
   * thrown: a rule asking is asking, and a game that stopped dead because it
   * wanted one key too many would be worse than one that simply does not get
   * it.
   */
  captureKey(key: string): void {
    if (!RESERVED_KEYS.has(key)) {
      this.captured.add(key);
    }
  }

  /** Give `key` back to the browser — `release the ⟨tab⟩ key`. */
  releaseKey(key: string): void {
    this.captured.delete(key);
  }

  /** The keys the game has claimed; the driver suppresses their default. */
  capturedKeys(): ReadonlySet<string> {
    return this.captured;
  }

  /**
   * Say whether the game is using the wheel — the same bargain as a key.
   *
   * A CANVAS THAT SWALLOWED EVERY WHEEL would trap the page's own scroll under
   * a game that has nothing to scroll, and one that swallowed none would
   * scroll the page out from under a list somebody is reading. Neither is a
   * constant the driver could know, so the world says: the Mouse rule sets
   * this each frame from whether anything scrollable is under the pointer
   * (`rules/mouse`), and the driver reads it in its listener.
   *
   * A FRAME BEHIND, which is the whole of what it costs. The pointer has to
   * have arrived over the list before the first notch, and it has — moving
   * there is frames of pointer events. A wheel turned in the same instant the
   * pointer lands scrolls the page once.
   */
  useWheel(wanted: boolean): void {
    this.wheelWanted = wanted;
  }

  /** Whether anything under the pointer asked for the wheel. */
  wantsWheel(): boolean {
    return this.wheelWanted;
  }

  private wheelWanted = false;

  /** The game window took the keyboard (the driver calls this on focus). */
  gainedKeyboard(): void {
    this.keyboardArrived = true;
  }

  /** Whether it took the keyboard since the last tick. */
  keyboardJustArrived(): boolean {
    return this.keyboardArrived;
  }

  /**
   * Lend the world a way to measure text (the driver calls this once).
   *
   * Once, at set-up, and not per frame: a measurer is a canvas and a font, and
   * neither changes while a game runs.
   */
  useTextMetrics(measure: TextMeasure): void {
    this.measure = measure;
  }

  /**
   * Lend the world somewhere to remember things — see `save`, `recall` and
   * `forget` below (specs/SAVING_PLAN.md).
   *
   * LENT, NOT REACHED FOR, exactly as the measuring tape above is. The engine
   * knows nothing about browsers; a world with no storage behind it — the
   * headless check runner, every test that does not ask for one — remembers
   * nothing and loses nothing, which is what it should do rather than throw.
   */
  useStorage(storage: WorldStorage): void {
    this.storage = storage;
  }

  private storage: WorldStorage | undefined;

  /**
   * Which PROJECT this is, for filing what it remembers under.
   *
   * LENT, like the storage and the clock, and for the same reason: a project
   * is a thing the lab knows about and this half does not. The driver hands
   * over the channel the project lives at (`/projects/world/<channel>/edit`).
   *
   * A world lent none files under a slot shared with every other project on
   * the browser, which is what the whole lab did before this and is what
   * every headless test still does.
   */
  useChannel(channel: string): void {
    this.channel = channel;
  }

  private channel = '';

  /**
   * Lend the world the theme its interface is painted in.
   *
   * LENT, like the storage, the clock and the channel — and read the same way,
   * by whoever draws. A `.style` file is JSON the bundler loads, so this takes
   * the document and resolves it ONCE: `styleNamed` is then a map lookup,
   * which matters because a drawing asks for one per shape per actor per
   * frame (specs/STYLES_PLAN.md).
   *
   * A world lent none draws in whatever its routines set for themselves, which
   * is what every world did before this and what every headless test does.
   */
  /**
   * Register a theme by path, before anything names one.
   *
   * WHY THE WORLD IS HANDED THE LOT. Only one of the three ways a theme is
   * chosen is a path an import could follow: the world's own `use theme` row.
   * A map's is a string in its document, a placement's is a string in a
   * property, and a file's `extends` is a fourth — none of which a bundler
   * can see. So the preamble imports every `.style` the project holds and
   * says so here, exactly as it does for actor kinds and maps
   * (specs/STYLES_PLAN.md).
   */
  defineTheme(path: string, document: unknown): void {
    this.themeDocuments.set(path, document);
    this.themeCache.delete(path);
  }

  private readonly themeDocuments = new Map<string, unknown>();

  /**
   * Name the world's own theme — the base of the cascade.
   *
   * TAKES A PATH OR A DOCUMENT. The block passes the imported document, which
   * is what a bundler gives it; a test passes one in hand. Either way the
   * lookup below is what answers `extends`, a map's theme and a placement's.
   */
  useTheme(
    document: unknown,
    parentAt: (path: string) => unknown = path => this.themeDocuments.get(path),
  ): void {
    this.findTheme = parentAt;
    this.themeCache = new Map();
    this.baseTheme = resolveTheme(
      typeof document === 'string' ? parentAt(document) : document,
      parentAt,
    );
  }

  private baseTheme: ResolvedTheme = NO_THEME;
  /**
   * How to find a theme by path — the same function `useTheme` resolved the
   * base with, kept because the OTHER two levels are found at draw time: a
   * map names its theme in its own document, and a placement in a property,
   * and neither is known when the world is built.
   */
  private findTheme: ((path: string) => unknown) | undefined;
  /**
   * Resolved themes by path.
   *
   * A CACHE BECAUSE A DRAWING ASKS PER SHAPE PER ACTOR PER FRAME. Resolving a
   * theme walks its parent and every class in both, which is fine once and
   * absurd sixty times a second. Cleared whenever the base changes, which is
   * the only time a file can have been reloaded.
   */
  private themeCache = new Map<string, ResolvedTheme>();

  /** The world's own theme — the base of the cascade. */
  currentTheme(): ResolvedTheme {
    return this.baseTheme;
  }

  /** One theme by path, resolved once and kept. */
  private themeAt(path: string): ResolvedTheme | undefined {
    if (!path || !this.findTheme) {
      return undefined;
    }
    const known = this.themeCache.get(path);
    if (known) {
      return known;
    }
    const found = this.findTheme(path);
    if (found === undefined) {
      return undefined;
    }
    const resolved = resolveTheme(found, this.findTheme, [path]);
    this.themeCache.set(path, resolved);
    return resolved;
  }

  /**
   * The theme an ACTOR is painted out of: its own, else its map's, else the
   * world's.
   *
   * THREE LEVELS AND NO MORE. The actor's own is a property a placement sets
   * in the inspector; the map's is a field on the map document; the world's
   * is the `use theme` row. Each is a whole FILE rather than a class, which
   * is what keeps the drawings out of it — a drawing names a class and never
   * learns which file answered (specs/STYLES_PLAN.md).
   *
   * `loadOf` is what makes the middle one possible, and it was already there:
   * the world keeps which load placed each actor so `canReach` can ask
   * (specs/MODALITY_PLAN.md).
   */
  themeFor(actor: Actor): ResolvedTheme {
    // ASKED WHETHER IT HAS ONE, not assumed. `use style` is a pen block and
    // any drawing may write it, including one on an actor that never elected
    // `Has a Style` — a project's own Scoreboard, a learner's first drawing.
    // Reading a property an actor does not carry THROWS (`Traited.get`), and
    // it would throw inside a drawing routine, sixty times a second, on an
    // actor whose only mistake was not opting into a trait it does not need.
    // An actor with no theme of its own simply takes its map's.
    const property = this.styleThemeProperty();
    const own =
      property && actor.hasProperty(property) ? actor.get(property) : '';
    return (
      (typeof own === 'string' ? this.themeAt(own) : undefined) ??
      this.themeAt(this.loadOf.get(actor)?.theme ?? '') ??
      this.baseTheme
    );
  }

  /** One class, for this actor, or nothing — what `use style` generates. */
  styleFor(actor: Actor, name: string): ResolvedStyle | undefined {
    return this.themeFor(actor).styles.get(name);
  }

  /**
   * One style by name, or nothing.
   *
   * NOTHING RATHER THAN A DEFAULT. The pen leaves itself alone when handed
   * nothing (`CommandPen.useStyle`), so a drawing naming a style the theme
   * lacks paints in whatever came before rather than vanishing — and the name
   * is worth reporting, not worth guessing at.
   */
  styleNamed(name: string): ResolvedStyle | undefined {
    return this.baseTheme.styles.get(name);
  }

  /**
   * The key a name is stored under.
   *
   * THE PROJECT IS IN IT, and that is not a nicety. Storage belongs to an
   * ORIGIN, and every project in the lab runs on the same sandbox origin —
   * so a key of the name alone means every published app that keeps a
   * `score` reads and writes the same slot as every other. Tolerable while a
   * learner has one project; a bug the moment anybody shares one, which is
   * the point of saving at all (specs/RECORDS_PLAN.md).
   */
  private memoryKey(name: string): string {
    return this.channel
      ? `world-lab.memory.${this.channel}.${name}`
      : `world-lab.memory.${name}`;
  }

  /**
   * Write every property this world declared for itself, under `name`.
   *
   * THE WORLD'S OWN MEMORY and nothing else. What a saved GAME is — which
   * actors are alive and where — wants a vocabulary for identity across runs
   * that nothing here has; an app's data is not that, and this is an app's
   * data (specs/SAVING_PLAN.md).
   *
   * Answers whether it was written, which is false when nothing lent this
   * world a storage and false when the storage refused — a browser with its
   * site data blocked is a real thing and not a crash.
   */
  save(name: string): boolean {
    if (!this.storage) {
      return false;
    }
    const written: Record<string, unknown> = {};
    for (const property of this.ownProperties) {
      written[`${property.ownerId}.${property.id}`] = this.store.get(property);
    }
    try {
      this.storage.setItem(this.memoryKey(name), JSON.stringify(written));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read a memory back, and say whether there was one.
   *
   * A project asks the answer to tell a first run from a later one, which is
   * the whole of what an app's start screen needs.
   *
   * A PROPERTY THE DATA DOES NOT MENTION KEEPS WHAT IT HAS. A project that
   * adds a property after saving should not find its other values wiped, and
   * what an unmentioned property holds is already its default. A property the
   * world no longer DECLARES is ignored: saved data outlives edits, and a
   * value nothing can hold is not worth taking a project down for.
   */
  recall(name: string): boolean {
    if (!this.storage) {
      return false;
    }
    let raw: string | null = null;
    try {
      raw = this.storage.getItem(this.memoryKey(name));
    } catch {
      return false;
    }
    if (raw === null) {
      return false;
    }
    let read: unknown;
    try {
      read = JSON.parse(raw);
    } catch {
      // Somebody else's key, or a half-written one. Not a memory.
      return false;
    }
    if (!read || typeof read !== 'object') {
      return false;
    }
    const held = read as Record<string, unknown>;
    for (const property of this.ownProperties) {
      const key = `${property.ownerId}.${property.id}`;
      if (key in held) {
        this.set(property, held[key] as never);
      }
    }
    return true;
  }

  /**
   * Keep these actors — `remember ⟨…⟩ as ⟨"notes"⟩`.
   *
   * A RECORD IS AN ACTOR. It has named typed fields, an inspector that edits
   * them, blocks that read them and a picture; a second thing with named
   * fields beside it would be a second way to say what the lab already says
   * (specs/RECORDS_PLAN.md). So what was missing was never a way to describe
   * a record — only a way to keep one.
   *
   * IT TAKES THE ACTORS, not a kind. `any ⟨Note⟩` is the ordinary way to say
   * "all of them", and taking a value rather than a dropdown means a project
   * can keep a SUBSET with the block it already filters by:
   *
   *     remember ⟨the ⟨Note⟩s where ⟨done⟩ is false⟩ as ⟨"todo"⟩
   *
   * …and a mixed set, since each row carries the kind it came from.
   *
   * ITS OWN PROPERTIES AND NOTHING ELSE. A kind's `define property` rows are
   * what that kind says its state is; trait properties are a rule's business
   * — where it is, whether it holds the keyboard, how much health it has. A
   * project that wants something kept declares it on the kind, which is the
   * direction this lab already pushes.
   *
   * REFERENCES ARE REFUSED. A property holding an actor has nothing to point
   * at in another run: `loadMap` resolves one in a second pass because both
   * ends are in the same map, and two runs are not. Storing it would write
   * something that cannot come back.
   */
  rememberActors(actors: Iterable<Actor>, name: string): boolean {
    if (!this.storage) {
      return false;
    }
    const rows = [...actors].map(actor => {
      const fields: Record<string, unknown> = {};
      for (const property of actor.ownProperties()) {
        if (property.type === 'actor' || property.type === 'actors') {
          continue;
        }
        fields[property.id] = actor.get(property);
      }
      return {kind: actor.type, fields};
    });
    try {
      this.storage.setItem(this.memoryKey(name), JSON.stringify({rows}));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Make them again — `bring back what was remembered as ⟨"notes"⟩`.
   *
   * ANSWERS THE ACTORS, not a count and not a boolean, which is the whole
   * shape of it. A record has nowhere to be and does not care; anything DRAWN
   * has to be PUT somewhere, and only the project knows where. Handing the
   * set back is what lets it say:
   *
   *     let row be each actor in ⟨bring back what was remembered as ⟨…⟩⟩
   *       do set position of row to …
   *
   * Nothing is lost by not answering a number. `how many actors in ⟨…⟩` and
   * `any actors in ⟨…⟩` are blocks the lab already has, so "how many" and
   * "was there anything saved" are each one block away and neither had to be
   * built into this.
   *
   * NO KIND IS NAMED, because each row carries its own — which is what lets
   * a mixed set come back as a mixed set. The kinds are found by path in what
   * the world was TOLD about (`define`), since a path stored in a browser is
   * one no import could have followed.
   *
   * THEY ARE IN THE WORLD when they come back. An actor outside one has no
   * age and is found by nothing, so a set of unplaced actors would be a value
   * that leaks the moment a project dropped it. They are added and then
   * handed over, and a handler that moves them does so before the frame is
   * drawn.
   */
  recallActors(name: string, layer?: string): Actor[] {
    if (!this.storage) {
      return [];
    }
    let raw: string | null = null;
    try {
      raw = this.storage.getItem(this.memoryKey(name));
    } catch {
      return [];
    }
    if (raw === null) {
      return [];
    }
    let read: unknown;
    try {
      read = JSON.parse(raw);
    } catch {
      return []; // somebody else's key, or a half-written one
    }
    const held = read as {rows?: unknown};
    if (!Array.isArray(held.rows)) {
      return [];
    }
    const made: Actor[] = [];
    for (const row of held.rows as Array<{
      kind?: unknown;
      fields?: Record<string, unknown>;
    }>) {
      const kind = typeof row?.kind === 'string' ? row.kind : '';
      const template = this.types.get(kind);
      // A kind this world no longer holds is a row it cannot make. Skipped
      // rather than thrown: saved data outlives edits, and the rest of the
      // set is still worth having.
      if (!template) {
        continue;
      }
      const actor = this.addActor(template, undefined, kind, layer);
      const fields = row.fields ?? {};
      for (const property of actor.ownProperties()) {
        if (property.id in fields) {
          actor.set(property, fields[property.id] as never);
        }
      }
      made.push(actor);
    }
    return made;
  }

  /** Throw a memory away, so an app that can save can also reset. */
  forget(name: string): boolean {
    if (!this.storage) {
      return false;
    }
    try {
      this.storage.removeItem(this.memoryKey(name));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * How wide `value` would be drawn at `size` pixels, in pixels.
   *
   * ZERO WHEN NOTHING CAN MEASURE, which is the honest answer and not a
   * failure: a world with no canvas behind it — the headless check runner is
   * one — puts a caret at the left margin, and that is visibly nothing rather
   * than invisibly wrong.
   *
   * The value is said as words the way everything else is (`core/textValue`),
   * so a list measures as the sentence it draws as rather than as its
   * brackets. A size that is not a positive number measures nothing: there is
   * no text at zero pixels, and a negative one is a typo.
   */
  textWidth(value: unknown, size: number, style?: ResolvedStyle): number {
    if (!this.measure) {
      return 0;
    }
    const words = text(value);
    const at = Number(size);
    if (!words || !Number.isFinite(at) || at <= 0) {
      return 0;
    }
    // IN THE STYLE IT WILL BE DRAWN IN. A caret asks how wide a prefix is in
    // a handler, where there is no pen — the pen is ambient and exists only
    // while painting — so the style cannot be read off the pen and has to be
    // handed in. Which is the same style the drawing names a line later, and
    // resolved through the same cascade (`styleFor`).
    return (
      this.measure(words, at, style?.weight === 'bold' ? 'bold' : undefined) ||
      0
    );
  }

  /**
   * Lend the world a clock — the driver calls this once, at set-up.
   *
   * `now` reports SECONDS since the epoch, because everything else in the lab
   * is in seconds and a learner subtracting two moments should get an answer
   * in the unit a tween and a cooldown already use.
   *
   * `offsetMinutes` is minutes to ADD to UTC to reach the zone being shown —
   * so New York in winter is -300. That is the sign a person writes, and the
   * opposite of `Date.getTimezoneOffset`; the driver flips it on the way in.
   */
  useClock(now: () => number, offsetMinutes = 0): this {
    this.clock = now;
    this.zoneOffset = offsetMinutes;
    // Sampled straight away as well as per tick, so a world asked before it
    // has ticked answers the time it was lent rather than the fixed default.
    this.moment = now();
    return this;
  }

  /**
   * What time it is — `the time now`, in seconds since the epoch.
   *
   * ONE VALUE FOR THE WHOLE FRAME (see `moment`). A world nobody lent a clock
   * answers the same fixed moment every time, which is a visible wrong answer
   * rather than an invisible one.
   */
  now(): number {
    return this.moment;
  }

  /** The zone the clock is being read in, in minutes from UTC. */
  timeZoneOffset(): number {
    return this.zoneOffset;
  }

  /** One part of a moment — `⟨the hour⟩ of ⟨…⟩` (`core/clock`). */
  timePart(seconds: unknown, part: unknown): number {
    const at = Number(seconds);
    return isTimePart(part) && Number.isFinite(at)
      ? partOf(at, part, this.zoneOffset)
      : 0;
  }

  /** A moment as words — `⟨…⟩ as ⟨a date⟩` (`core/clock`). */
  timeText(seconds: unknown, style: unknown): string {
    const at = Number(seconds);
    if (!Number.isFinite(at)) {
      return '';
    }
    const how = (TIME_STYLES as readonly string[]).includes(String(style))
      ? (String(style) as TimeStyle)
      : 'date';
    return clockText(at, how, this.zoneOffset);
  }

  /** Whether `key` (a name from `core/keys`) is currently pressed. */
  isKeyDown(key: string): boolean {
    return this.keys.has(key);
  }

  /** Keys pressed this tick that were not pressed last tick (rising edges). */
  newlyPressedKeys(): string[] {
    return [...this.keys].filter(key => !this.previousKeys.has(key));
  }

  /** Keys released this tick that were pressed last tick (falling edges). */
  newlyReleasedKeys(): string[] {
    return [...this.previousKeys].filter(key => !this.keys.has(key));
  }

  /**
   * Keys that should fire AGAIN this tick because they are being held.
   *
   * The third edge, and the one a keyboard has that a set of held keys does
   * not describe: hold an arrow and it moves once, pauses, then moves over and
   * over. A list walked with the arrows and a field emptied with backspace
   * both want it, and neither could ask for it — `is held` is every frame,
   * which is forty repeats a second, and `presses` is one.
   *
   * NOT the rising edge. A key's first fire is its press, which the Input rule
   * already raises; this is only the repeats after it, so a rule that wants
   * both listens to both and one that wants a single shot — a jump — is
   * untouched.
   *
   * THE TIMING IS THE ENGINE'S because the frame clock is. Expressing "0.4
   * seconds, then every 0.06" in the rule language would need a timer per key
   * held, and the world already knows when each one went down.
   */
  repeatingKeys(): string[] {
    return [...this.repeatingThisTick];
  }

  /**
   * How many repeats a key held for `since` seconds has earned by now.
   *
   * Counted from the elapsed time rather than accumulated per frame, so a
   * frame that ran long fires once rather than dropping the repeat, and a
   * world ticked in big steps does not spray them.
   */
  private repeatsDue(since: number): number {
    const held = this.elapsed - since;
    if (held < KEY_REPEAT_DELAY) {
      return 0;
    }
    return Math.floor((held - KEY_REPEAT_DELAY) / KEY_REPEAT_INTERVAL) + 1;
  }

  /** When each held key went down, in world seconds. Cleared on release. */
  private readonly keyHeldSince = new Map<string, number>();

  /** Repeats already fired for each held key, so none fires twice. */
  private readonly keyRepeatsFired = new Map<string, number>();

  /** The keys `repeatingKeys` answers with, worked out once per tick. */
  private repeatingThisTick: ReadonlySet<string> = new Set();

  /**
   * Work out which held keys repeat this tick.
   *
   * ONCE PER TICK, before the steps run, so that `repeatingKeys` is a pure
   * read: a step may ask twice in a frame, and two different answers would be
   * a key that repeated for one reader and not the other.
   *
   * A key that went down starts its clock; one that went up forgets it, so
   * releasing and pressing again waits out the delay afresh rather than
   * carrying on at speed.
   */
  private advanceKeyRepeats(): void {
    const repeating = new Set<string>();
    for (const key of this.keys) {
      let since = this.keyHeldSince.get(key);
      if (since === undefined) {
        since = this.elapsed;
        this.keyHeldSince.set(key, since);
        this.keyRepeatsFired.set(key, 0);
      }
      const due = this.repeatsDue(since);
      if (due > (this.keyRepeatsFired.get(key) ?? 0)) {
        this.keyRepeatsFired.set(key, due);
        repeating.add(key);
      }
    }
    for (const key of [...this.keyHeldSince.keys()]) {
      if (!this.keys.has(key)) {
        this.keyHeldSince.delete(key);
        this.keyRepeatsFired.delete(key);
      }
    }
    this.repeatingThisTick = repeating;
  }

  /**
   * Replace the mouse's state — where it is, and which buttons are held.
   *
   * One call rather than two because they arrive together and are read
   * together: a click is a button and a place, and a frame that learned the
   * button before the position would put the first click of a game wherever
   * the pointer last was.
   *
   * `at` is in VIEWPORT pixels (see the field), and the driver calls this each
   * frame before `tick`, as it does `setInput`.
   */
  setPointer(at: VectorLike, buttons: Iterable<string>): void {
    this.pointer = new Vector(at.x, at.y);
    this.buttons = new Set(buttons);
  }

  /**
   * How far the wheel was turned since the last tick, in PIXELS.
   *
   * ACCUMULATED, NOT REPLACED, because a wheel is a sequence and not a state:
   * the driver may see three notches between two frames, and a frame that read
   * only the last of them would scroll a third as far as the hand moved. The
   * keys are a set and the pointer is a place — both answer "how is it now" —
   * and this is the third kind, like what was typed.
   *
   * PIXELS, and the driver's job to make them so. A browser reports its wheel
   * in pixels, lines or pages depending on the machine, the browser and
   * whether it is a trackpad; none of that reaches here (`PhaserBinding`).
   *
   * Positive is DOWN, which is the direction the content moves under a scroll
   * down, and is what every scrollable thing in the lab adds to its offset.
   */
  scrollWheel(by: number): void {
    this.pendingWheel += by;
  }

  /** What the wheel turned during THIS tick, in pixels. Zero on a still one. */
  wheelTurned(): number {
    return this.wheel;
  }

  /**
   * The wheel turned since the last tick, waiting to be read by the next.
   *
   * Two fields for the reason the typed queue has two: the driver adds between
   * frames, and the step that reads it runs inside one. The pending total
   * becomes the frame's at the top of `tick` and is zeroed there, so a frame
   * sees exactly what the hand did to it and a still frame sees nothing.
   */
  private pendingWheel = 0;
  private wheel = 0;

  /** Whether `button` (a name from `core/pointer`) is currently held. */
  isButtonDown(button: string): boolean {
    return this.buttons.has(button);
  }

  /** Buttons pressed this tick that were not pressed last tick. */
  newlyPressedButtons(): string[] {
    return [...this.buttons].filter(
      button => !this.previousButtons.has(button),
    );
  }

  /** Buttons released this tick that were pressed last tick. */
  newlyReleasedButtons(): string[] {
    return [...this.previousButtons].filter(
      button => !this.buttons.has(button),
    );
  }

  /**
   * Where the mouse is IN THE WORLD — the point it is over.
   *
   * Not where it is on the screen, which is what the driver reported and what
   * this converts: a camera two screens along means the pointer at the middle
   * of the window is over a place two screens along, and "is the mouse over
   * this actor" is a question about that place. A camera's position is the
   * point it shows at the MIDDLE of the view (core/Camera), so the window's
   * top-left corner is half a view up and to the left of it.
   *
   * Measured against the ACTIVE camera, which is the view the learner is
   * looking at. A layer with parallax of its own draws somewhere else and this
   * does not know about it — the same thing `map size` and every other world
   * coordinate already assume, and the answer a game wants for the layer its
   * actors are on.
   */
  mousePosition(actor?: Actor | Camera): Vector {
    const subject = actor ?? this.inHand.at(-1);
    // A CAMERA A VIEWPORT OWNS is asked through that Viewport's window and
    // itself, whichever space it looks at. For a box holding a level that is
    // what the branch below would do anyway; for a mirror it is the only
    // reading that makes sense, since the mirror's camera looks at the root
    // and the root's own branch would answer through the world's camera
    // (specs/MIRRORING_PLAN.md).
    if (subject instanceof Camera && subject.window) {
      return this.throughWindow(subject.window, subject);
    }
    const space = this.spaceOf(subject);
    if (!space.owner || !space.camera) {
      // THE ROOT, which two cameras may now be looking at: the world's, over
      // the whole view, and any mirror's, over its own rectangle. A pointer
      // inside a mirror's rectangle is a pointer on the world THROUGH that
      // mirror, so a root actor under it — which is what hit-testing asks,
      // one candidate at a time in hand — is found by the mirror's camera and
      // not by the world's. The topmost mirror wins where two overlap, which is
      // the last placed, as the driver draws them.
      const mirror = this.mirrorUnderPointer();
      if (mirror) {
        return this.throughWindow(mirror.owner!, mirror.camera!);
      }
      return this.rootPointer();
    }
    // Through the Viewport: where the pointer is in the Viewport's own
    // space, less the Viewport's top-left corner, is where it is inside the
    // window; the space's camera says which point of the space is there.
    return this.throughWindow(space.owner, space.camera);
  }

  /**
   * Where the pointer is in the scene `camera` looks at, seen through the
   * rectangle of `viewport`.
   *
   * The Viewport branch of `mousePosition`, named, since a mirror and a box
   * holding a level both want it and differ only in which camera.
   */
  private throughWindow(viewport: Actor, camera: Camera): Vector {
    const position = this.positionalProperty(SPATIAL.position);
    const at = position ? viewport.get(position) : new Vector(0, 0);
    const view = this.viewSizeOf(viewport);
    // WHERE THE POINTER IS IN THE VIEWPORT'S OWN SPACE — and for a Viewport
    // placed in the root, that is through the world's camera and never through
    // a mirror, or a mirror under the pointer would be asked for its own
    // corner through itself, without end. A Viewport inside another's space is
    // asked the ordinary way.
    const outer = this.spaceOf(viewport).owner
      ? this.mousePosition(viewport)
      : this.rootPointer();
    const inside = new Vector(
      outer.x - (at.x - view.x / 2),
      outer.y - (at.y - view.y / 2),
    );
    return new Vector(
      camera.position.x - view.x / 2 + inside.x,
      camera.position.y - view.y / 2 + inside.y,
    );
  }

  /**
   * The topmost mirror whose rectangle the pointer is inside, if any.
   *
   * Measured in the root, through the world's own camera — a mirror is a
   * placement in the root like any other. Only a MIRROR: a box holding a
   * level of its own has actors of its own, and a root actor is never under
   * it in the sense that matters here.
   */
  /** Where the pointer is in the root, through the world's own camera. */
  private rootPointer(): Vector {
    const camera = this.activeCamera();
    const view = this.viewSize(camera);
    return new Vector(
      camera.position.x - view.x / 2 + this.pointer.x,
      camera.position.y - view.y / 2 + this.pointer.y,
    );
  }

  private mirrorUnderPointer(): Space | undefined {
    const position = this.positionalProperty(SPATIAL.position);
    if (!position) {
      return undefined;
    }
    const pointer = this.rootPointer();
    for (let index = this.viewportSpaces.length - 1; index >= 0; index -= 1) {
      const space = this.viewportSpaces[index];
      if (!space.mirrors || !space.owner || !space.camera) {
        continue;
      }
      const at = space.owner.get(position) as Vector;
      const box = this.viewSizeOf(space.owner);
      if (
        Math.abs(pointer.x - at.x) <= box.x / 2 &&
        Math.abs(pointer.y - at.y) <= box.y / 2
      ) {
        return space;
      }
    }
    return undefined;
  }

  /**
   * How much an animation's frames are shrunk, by its largest cell.
   *
   * THE LARGEST, not each frame's own: fitted one by one, a two-pixel frame
   * would draw as big as a hundred-pixel one and the actor would pulse. It is
   * the same quantity `publishIntrinsicSize` measures the box from, which is
   * what keeps the drawn size and the box the same number
   * (specs/ACTOR_SIZE.md).
   */
  private publishAnimationSize(actor: Actor, def: AnimationDef): number {
    let width = 0;
    let height = 0;
    for (const frame of def.frames) {
      if (frame.position) {
        width = Math.max(width, frame.position.width);
        height = Math.max(height, frame.position.height);
      }
    }
    if (width <= 0 || height <= 0) {
      return 1;
    }
    const fit = fitToTile(width, height);
    this.publishSize(actor, width * fit, height * fit);
    return fit;
  }

  /**
   * Say how big an actor is, if it has changed.
   *
   * WRITTEN FROM THE SNAPSHOT, which the drawing branch below has always done
   * and which the sprite branches do now. The Animation rule publishes the
   * same number on every tick, and that is the path the game runs on; this is
   * for the reader that never ticks — the sandbox's introspection pass builds
   * a world, reads it once and throws it away, and a map editor told nothing
   * draws every kind at one nominal tile (`sandbox/worldPreviewWorkerManager`).
   *
   * Only when it moved, so an ordinary actor's is set once and never again.
   */
  private publishSize(actor: Actor, width: number, height: number): void {
    const property = this.intrinsicSizeProperty();
    if (!property) {
      return;
    }
    const known = actor.get(property);
    if (known?.x !== width || known?.y !== height) {
      actor.set(property, new Vector(width, height));
    }
  }

  /**
   * How big this actor is in world units, BEFORE its scale, if anything has
   * said.
   *
   * The one question "how big is it" has one answer, and it is this property:
   * a drawing's declared canvas and a sprite's picture fitted to a tile both
   * land in it, so a caller asks the size rather than asking what kind of
   * actor it is looking at (specs/ACTOR_SIZE.md).
   *
   * UNSCALED ON PURPOSE, and it was briefly not: a reader draws this box
   * through the actor's own transform, and that transform already carries the
   * scale. Folding the scale in here doubled it the moment a placement
   * overrode `scale` — the editor drawing kind × placement where the game
   * draws placement alone. The scale is a separate question with a separate
   * answer ({@link scaleOf}).
   *
   * Undefined for an actor nobody has measured — no appearance, or a picture
   * the project never stated a size for. A caller that must draw something
   * anyway falls back to a tile, which is what it always did.
   */
  sizeOf(actor: Actor): {width: number; height: number} | undefined {
    const property = this.intrinsicSizeProperty();
    const size = property ? actor.get(property) : undefined;
    if (!size || size.x <= 0 || size.y <= 0) {
      return undefined;
    }
    return {width: size.x, height: size.y};
  }

  /**
   * What this actor's kind was told to scale itself by.
   *
   * THE OTHER HALF OF HOW BIG IT IS, and the half an editor could not read. A
   * `set scale of this to x 1 y 2` row runs when the actor is defined, so it
   * is true of a world that was never played — but nothing outside the engine
   * asked, and the map editor filled in a scale of one for every kind. A
   * two-tile actor was drawn as a square there: right in the game, square in
   * the editor, with nothing on screen to say which was lying.
   *
   * Left signed, unlike `rules/spatial.halfExtent`: a scale of -1 is a facing
   * and a reader drawing through a transform wants the flip, where one
   * measuring an extent wants the magnitude.
   */
  scaleOf(actor: Actor): {x: number; y: number} | undefined {
    const property = this.scaleProperty();
    const scale = property ? actor.get(property) : undefined;
    return scale ? {x: scale.x, y: scale.y} : undefined;
  }

  /** The definition of a known animation, or undefined. */
  /** How big an image is, if the project measured it. */
  imageSize(name: string): {width: number; height: number} | undefined {
    return this.imageSizes.get(name);
  }

  /** Record what the project's images measure — see {@link imageSize}. */
  useImageSizes(sizes: Record<string, {width: number; height: number}>): void {
    for (const [name, size] of Object.entries(sizes)) {
      this.imageSizes.set(name, size);
    }
  }

  animation(id: string): AnimationDef | undefined {
    return this.animationDefs.get(id);
  }

  /**
   * Whether input reaches this actor — `⟨…⟩ can be reached`.
   *
   * FALSE WHILE SOMETHING MODAL COVERS IT. A screen loaded over another is a
   * dialog: the one in front takes the clicks, the tabbing and the typing,
   * and what is behind waits. Every interface anybody has used works this
   * way, and nothing here said so until an on-screen keyboard's keys started
   * pressing the button on the screen behind them (specs/MODALITY_PLAN.md).
   *
   * MEASURED FROM THE TOPMOST MODAL LOAD, not from the top of the stack, and
   * that is the whole of the design. A keyboard sits ABOVE the form it fills
   * and must not lock it out; a dialog sits above a list and must. So a map
   * says which it is (`WorldMap.modal`), and everything placed by the topmost
   * modal load OR BY ANYTHING ABOVE IT can be reached.
   *
   * AN ACTOR NO MAP PLACED IS BEHIND EVERYTHING. `add actor` in a world's
   * body, a bullet a handler made: they belong to no load, which puts them
   * under the bottom one, so a dialog covers them too. That is what a dialog
   * over a game has to mean.
   *
   * THE ROOT SPACE DECIDES FOR EVERYBODY. Screens are the root's stack, and a
   * level playing inside a Viewport is behind whatever is over the window —
   * so a modal in the root covers the other spaces whole. A modal loaded
   * INSIDE a Viewport is not a case anybody has needed and is not answered.
   */
  canReach(actor: Actor): boolean {
    const loads = this.rootSpace.loads;
    let topModal = -1;
    for (let at = loads.length - 1; at >= 0; at -= 1) {
      if (loads[at].modal) {
        topModal = at;
        break;
      }
    }
    if (topModal < 0) {
      return true;
    }
    const load = this.loadOf.get(actor);
    return load ? loads.indexOf(load) >= topModal : false;
  }

  /** The ids of every registered animation (active rules' stock + world extras). */
  animationIds(): string[] {
    return [...this.animationDefs.keys()];
  }

  /** Advance the simulation by `delta` seconds. */
  tick(delta: number): void {
    this.inTick = true;
    // Before the steps, so every step in this frame reads one value, and that
    // value is the time the positions they compute belong to (see `time`).
    //
    // AND NOT WHILE PAUSED, which is what `time` has always said it did and
    // did not do. A paused world still TICKS — the driver keeps calling this
    // so `sense` runs and a menu's buttons still work — so "a world that is
    // not ticking does not age" was true of a world nobody ticked and false of
    // a paused one. The cost was quiet: a cooldown started before a pause
    // expired during it, so a menu was somewhere to go and wait for your
    // weapon to reload.
    if (!this.paused) {
      this.elapsed += delta;
    }
    // …and the same for what time it is out there, for the same reason: two
    // blocks a line apart must not land on opposite sides of a second.
    if (this.clock) {
      this.moment = this.clock();
    }
    // …and so is anything the world typed or pressed last frame, which is the
    // frame this one is (specs/KEYBOARD_PLAN.md). In front of what the driver
    // added, since the button was clicked before those keystrokes arrived.
    if (this.pendingTyped.length > 0) {
      this.typed = [...this.pendingTyped, ...this.typed];
      this.pendingTyped = [];
    }
    if (this.pendingKeys.size > 0) {
      this.keys = new Set([...this.held, ...this.pendingKeys]);
      this.pendingKeys = new Set();
    } else {
      this.keys = this.held;
    }
    // …and which of the held keys have earned a REPEAT by now, worked out
    // before the steps so every reader of it agrees (`repeatingKeys`).
    this.advanceKeyRepeats();
    // …and what the wheel did between the frames becomes what it did in this
    // one, for the same reason the typed queue is folded in above.
    this.wheel = this.pendingWheel;
    this.pendingWheel = 0;
    try {
      this.scheduler.run(this, delta, this.paused ? whilePaused : undefined);
      // Handlers run here, and a handler is where "remove that coin" comes
      // from — so the sweep below is after them, not before.
      this.events.flush(this);
    } finally {
      this.inTick = false;
      for (const actor of this.leaving) {
        this.detach(actor);
      }
      this.leaving.clear();
    }
    this.settleSpaces();
    // The keys this tick become "previous" for the next, so edge detection
    // (newlyPressed/Released) compares against exactly one frame back. The
    // mouse's buttons are the same mechanism and advance in the same breath.
    this.previousKeys = this.keys;
    this.previousButtons = this.buttons;
    // …and what was typed is DRAINED rather than remembered. A key's edge is
    // worked out by comparing two frames; a character has no state to compare,
    // it simply happened — so a frame that did not read it is a frame it was
    // meant for and missed, and carrying it forward would type it twice.
    this.typed = [];
    // …and so is the arrival, for the same reason: taking the keyboard is a
    // moment, not a state. A rule that missed the frame it happened in has
    // missed it, which is better than acting on it twice.
    this.keyboardArrived = false;
  }

  /** The resolved step order — for inspection and tests. */
  stepOrder(): readonly Step[] {
    return this.scheduler.order();
  }

  /** Whether a rule is active (directly or by dependency). */
  hasRule(rule: Rule): boolean {
    return this.membership.has(rule);
  }

  /** The active rules, directly-used and implied. */
  activeRules(): readonly Rule[] {
    return this.membership.items();
  }

  /**
   * A per-actor render view for the driver: every actor carrying the Spatial
   * "positional" trait, with its transform. Read in-instance — the Property
   * objects come from this world's own Spatial rule, so their identities match
   * the actors' stores — so the driver needs no engine internals, only these
   * numbers. Empty when the Spatial rule is not in play.
   */
  /**
   * Effects played across the whole viewport, in application order.
   *
   * Read by the driver each frame and applied to the camera, the way an actor's
   * are applied to its Game Object.
   */
  effects(): readonly AppliedEffectSpec[] {
    return this.appliedEffects;
  }

  /**
   * Start a viewport-wide effect now, or retune one already playing.
   *
   * One entry per path and never stacked, exactly as on an actor — and for the
   * same reason, adding one already present replaces its values rather than
   * doing nothing. See {@link Actor.addEffect}.
   */
  addEffect(
    path: string,
    document: AppliedEffectSpec['document'],
    values?: AppliedEffectSpec['values'],
  ): this {
    const spec = values ? {path, document, values} : {path, document};
    const index = this.appliedEffects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      this.appliedEffects[index] = spec;
      return this;
    }
    this.appliedEffects.push(spec);
    return this;
  }

  /**
   * The backdrop layers, back to front, as the driver draws them.
   *
   * Read every frame beside `renderSnapshot`, so a backdrop changed mid-game —
   * by an event handler, or by the hot-reload patch — shows up on the next one.
   */
  backdropSnapshot(): readonly BackdropState[] {
    return this.layerList.map(layer => layer.background);
  }

  /**
   * The same for the foregrounds — what each layer draws IN FRONT of its
   * actors, in stack order.
   *
   * A second list rather than a second field on the first: the driver draws the
   * two at different depths and holds a separate image cache for each, so it
   * wants them apart, and there is nothing either needs to know about the other.
   */
  foregroundSnapshot(): readonly BackdropState[] {
    return this.layerList.map(layer => layer.foreground);
  }

  /** The one color behind everything, as the driver clears to it. */
  backdropColor(): Rgba {
    return this.clearColor;
  }

  /**
   * The background slot of a layer, or of the default layer.
   *
   * An unknown id is the default rather than an error, for the reason
   * `addActor` gives: the id comes from generated code naming a `define layer`
   * block, and deleting that block while a `set background` still names it
   * should paint somewhere visible instead of taking the world down.
   */
  private slotAt(layer: string, which: SlotName): LayerSlot {
    return (this.layer(layer) ??
      this.layerList[this.depthOf(DEFAULT_LAYER_ID)])[which];
  }

  private backdropAt(layer: string): LayerSlot {
    return this.slotAt(layer, 'background');
  }

  /**
   * Draw `sprite` behind everything — an image file name, as a frame names one.
   *
   * `undefined` clears it, leaving the backdrop color. The image is stretched
   * to the viewport by the driver (BACKGROUNDS.md §4); nothing here knows how
   * big it is, and a backdrop is never a spritesheet, so this takes a file name
   * and never a cell reference.
   */
  setBackground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    this.backdropAt(layer).sprite = sprite;
    return this;
  }

  // ── Sound (specs/SOUND.md) ──────────────────────────────────────────────
  //
  // Two things with opposite mechanisms, which is why they are two methods and
  // not one. A one-shot is a MOMENT: it goes on a queue the driver drains after
  // each tick, and it is NOT in the snapshot, because a moment that survived
  // into the hot-reload baseline would be compared, found different, and
  // replayed. Music is STATE: it is in the snapshot and patches in place, the
  // way the sky does.

  /**
   * Play a sound once — `play sound ⟨pop⟩`.
   *
   * Queued rather than played, because the engine has no speakers and is not
   * going to grow any: it says what happened, and the driver decides what that
   * sounds like. The same division `renderSnapshot` makes about pictures.
   *
   * Repeats are KEPT. Two coins collected in one tick are two pops, and a queue
   * that deduplicated would make a busy frame quieter than a calm one.
   */
  playSound(sound: string): this {
    this.queuedSounds.push(sound);
    return this;
  }

  /**
   * Stop everything making a noise — `stop all sounds`.
   *
   * IN THE QUEUE, not beside it, because a tick is ordered: `stop all sounds`
   * and then `play sound ⟨pop⟩` is a pop, and a flag read after the queue was
   * drained would make it silence. So this is a cue like any other and the
   * driver reads them in order (`runtime/driver/sound`).
   *
   * The track is state and not a moment, so it is cleared HERE as well: a
   * world that went on reporting music nobody can hear would start it again
   * the moment anything else changed.
   */
  stopSounds(): this {
    this.queuedSounds.push(STOP_ALL_SOUNDS);
    this.track = undefined;
    return this;
  }

  /**
   * Take the sounds raised since the last call, emptying the queue.
   *
   * The driver calls this after `tick`. A world nobody drains — one built to be
   * compared against, or to draw a thumbnail with — accumulates and is thrown
   * away with its queue, which is what "building a world drops its sounds"
   * comes to in practice.
   */
  drainSounds(): readonly SoundCue[] {
    return this.queuedSounds.splice(0, this.queuedSounds.length);
  }

  /**
   * Play a track, replacing whatever was playing — `set music to ⟨theme⟩`.
   *
   * `undefined` is silence and is how it stops, so there is one method and not
   * two here. The PALETTE has two — `set music to` and `stop music` — because
   * a menu row reading "(none)" is not where anybody looks for a way to stop
   * something (`domainBlocks`).
   */
  setMusic(track: string | undefined): this {
    this.track = track;
    return this;
  }

  /** The track playing, or undefined for silence. */
  music(): string | undefined {
    return this.track;
  }

  /**
   * Slide a layer's background, in world pixels.
   *
   * Motion the author owns, independent of any camera — which is what makes
   * drifting clouds expressible before cameras exist at all (core/Layer). Pair
   * it with `setBackgroundRepeat` unless the image is meant to leave a gap.
   */
  setBackgroundOffset(offset: Vector, layer = DEFAULT_LAYER_ID): this {
    // Copied, never adopted. `Vector.from` hands back the same instance when it
    // is already a Vector, and a step writing this every tick would then share
    // one object with the world — mutating it in place would move the sky with
    // no call at all.
    this.slotAt(layer, 'background').offset = new Vector(offset.x, offset.y);
    return this;
  }

  /** The same for a layer's foreground. */
  setForegroundOffset(offset: Vector, layer = DEFAULT_LAYER_ID): this {
    this.slotAt(layer, 'foreground').offset = new Vector(offset.x, offset.y);
    return this;
  }

  /** Tile a layer's background rather than stretching it to the surface. */
  setBackgroundRepeat(repeat: boolean, layer = DEFAULT_LAYER_ID): this {
    this.slotAt(layer, 'background').repeat = repeat;
    return this;
  }

  /** The same for a layer's foreground. */
  setForegroundRepeat(repeat: boolean, layer = DEFAULT_LAYER_ID): this {
    this.slotAt(layer, 'foreground').repeat = repeat;
    return this;
  }

  /**
   * Draw `sprite` in FRONT of this layer's actors — fog, snow, a vignette.
   *
   * The background's twin in every respect but depth. `undefined` clears it,
   * leaving nothing drawn: unlike the background there is no color behind a
   * foreground, because a color in front of everything would be a wall.
   */
  setForeground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    this.slotAt(layer, 'foreground').sprite = sprite;
    return this;
  }

  /**
   * Set the color behind the backdrop image, and behind everything without one.
   *
   * Takes whatever a color block produced — hex from a picker, floats from
   * `r g b a` — because `rgba` accepts both and every color block can then
   * feed this one (see color.ts).
   *
   * One sky, not one per layer: a color on any layer but the bottom would be
   * hidden by the layer under it.
   */
  setBackgroundColor(color: ColorValue): this {
    this.clearColor = rgba(color);
    return this;
  }

  /**
   * Play an effect on the backdrop's own pixels.
   *
   * Not the same as `addEffect`, and the difference is the whole reason a
   * backdrop carries effects at all: a world effect filters the camera, so it
   * covers the actors too. This filters the sky and leaves the swimmer alone.
   *
   * One entry per path and never stacked, exactly as on the world and on an
   * actor — adding one already present retunes it.
   */
  addBackgroundEffect(
    path: string,
    document: AppliedEffectSpec['document'],
    values?: AppliedEffectSpec['values'],
    layer = DEFAULT_LAYER_ID,
  ): this {
    const spec = values ? {path, document, values} : {path, document};
    const effects = this.backdropAt(layer).effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects[index] = spec;
      return this;
    }
    effects.push(spec);
    return this;
  }

  /**
   * Play an effect on a LAYER — its actors and both its images together.
   *
   * The scope between a slot's and the world's: a slot effect filters one
   * image, a world effect filters the whole screen after everything is
   * composited, and this filters one layer's worth of it. Blurring the game
   * while the score stays sharp is the case it exists for, and neither of the
   * other two can say it.
   */
  addLayerEffect(
    path: string,
    document: AppliedEffectSpec['document'],
    values?: AppliedEffectSpec['values'],
    layer = DEFAULT_LAYER_ID,
  ): this {
    const spec = values ? {path, document, values} : {path, document};
    const effects = (this.layer(layer) ?? this.layerList[0]).effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects[index] = spec;
      return this;
    }
    effects.push(spec);
    return this;
  }

  /** Stop an effect on a layer. Removing one not playing is a no-op. */
  removeLayerEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    const effects = (this.layer(layer) ?? this.layerList[0]).effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects.splice(index, 1);
    }
    return this;
  }

  /**
   * Each layer's id and its own effects, in stack order.
   *
   * What the driver needs to build one filterable container per layer; the
   * slots' images and the actors are read separately, as they always were.
   */
  layerSnapshot(): ReadonlyArray<{
    id: string;
    effects: readonly AppliedEffectSpec[];
    /** How much of the camera's motion this layer takes, per axis. */
    parallax: {x: number; y: number};
    /** Whether it ignores the camera entirely — an interface layer. */
    fit: boolean;
  }> {
    return this.layerList.map(layer => ({
      id: layer.id,
      effects: layer.effects,
      parallax: {x: layer.parallax.x, y: layer.parallax.y},
      fit: layer.fit,
    }));
  }

  /**
   * Where each camera is looking from, in declaration order.
   *
   * Read every frame beside `renderSnapshot`, so a camera moved by a handler or
   * a step shows up on the next one.
   */
  cameraSnapshot(): ReadonlyArray<{
    id: string;
    position: {x: number; y: number};
    /** Whether the view is taken through this one. Exactly one is. */
    active: boolean;
  }> {
    return this.cameraList.map(camera => ({
      id: camera.id,
      position: {x: camera.position.x, y: camera.position.y},
      active: camera.id === this.activeCameraId,
    }));
  }

  /** Play an effect on a layer's FOREGROUND. See {@link addBackgroundEffect}. */
  addForegroundEffect(
    path: string,
    document: AppliedEffectSpec['document'],
    values?: AppliedEffectSpec['values'],
    layer = DEFAULT_LAYER_ID,
  ): this {
    const spec = values ? {path, document, values} : {path, document};
    const effects = this.slotAt(layer, 'foreground').effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects[index] = spec;
      return this;
    }
    effects.push(spec);
    return this;
  }

  /** Stop an effect on a layer's foreground. Removing one not playing is a no-op. */
  removeForegroundEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    const effects = this.slotAt(layer, 'foreground').effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects.splice(index, 1);
    }
    return this;
  }

  /** Stop an effect on the backdrop. Removing one not playing is a no-op. */
  removeBackgroundEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    const effects = this.backdropAt(layer).effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects.splice(index, 1);
    }
    return this;
  }

  /**
   * Every effect in play, the world's own, every backdrop's, and every actor's.
   *
   * Public because the hot-reload reconciler reads it off a freshly built world
   * to find the new graph for an effect the learner just edited — which may sit
   * on an actor, so `effects()` (the world's own) is not enough.
   */
  allEffects(): AppliedEffectSpec[] {
    return [
      ...this.appliedEffects,
      ...this.layerList.flatMap(layer => [
        ...layer.effects,
        ...layer.background.effects,
        ...layer.foreground.effects,
      ]),
      ...this.actorList.flatMap(actor => [...actor.effects()]),
    ];
  }

  /**
   * Every applied effect with what carries it: `world`, `backdrop:<layer id>`,
   * or the actor's id. The vocabulary the snapshot and the value patch share.
   *
   * Keyed by the layer's ID rather than its index: an effect must stay attached
   * to the same background when a layer is declared above it, and an index
   * would silently renumber every one below.
   */
  private effectSlots(): Array<[string, AppliedEffectSpec]> {
    return [
      ...this.appliedEffects.map(
        effect => ['world', effect] as [string, AppliedEffectSpec],
      ),
      ...this.layerList.flatMap(layer => [
        ...layer.effects.map(
          effect =>
            [`layer:${layer.id}`, effect] as [string, AppliedEffectSpec],
        ),
        ...layer.background.effects.map(
          effect =>
            [`backdrop:${layer.id}`, effect] as [string, AppliedEffectSpec],
        ),
        ...layer.foreground.effects.map(
          effect =>
            [`foreground:${layer.id}`, effect] as [string, AppliedEffectSpec],
        ),
      ]),
      ...this.actorList.flatMap(actor =>
        actor
          .effects()
          .map(effect => [actor.id, effect] as [string, AppliedEffectSpec]),
      ),
    ];
  }

  /**
   * Retune one applied effect, in place.
   *
   * The live half of turning a knob on an `add effect` block: the driver
   * re-reads these specs every frame and pushes new values onto the filter that
   * is already running (effects.ts), so nothing has to restart. Addressed by
   * slot, not by path — the same effect on two actors has two sets of knobs and
   * patching one must not touch the other.
   *
   * @returns whether that slot exists
   */
  setEffectValues(
    owner: string,
    path: string,
    values: AppliedEffectSpec['values'],
  ): boolean {
    const retune = (effects: AppliedEffectSpec[]): boolean => {
      const index = effects.findIndex(effect => effect.path === path);
      if (index < 0) {
        return false;
      }
      effects[index] = values
        ? {...effects[index], values}
        : // No values at all is a different spec from empty ones: the driver
          // fills each parameter's declared default for anything absent.
          {path: effects[index].path, document: effects[index].document};
      return true;
    };
    if (owner === 'world') {
      return retune(this.appliedEffects);
    }
    const slot = /^(backdrop|foreground):(.+)$/.exec(owner);
    if (slot) {
      const layer = this.layer(slot[2]);
      const which: SlotName =
        slot[1] === 'backdrop' ? 'background' : 'foreground';
      return layer ? retune(layer[which].effects) : false;
    }
    const actor = this.actorList.find(candidate => candidate.id === owner);
    return actor ? actor.setEffectValues(path, values) : false;
  }

  /**
   * Give every effect with this path a new graph, in place.
   *
   * The live half of editing a `.effect`: the reconciler calls this on the
   * RUNNING world so the driver, which re-reads these specs each frame, notices
   * the graph changed and swaps the shader. Values are untouched — they are
   * identity, and a change to them restarts instead.
   *
   * @returns whether anything carried that path
   */
  setEffectDocument(
    path: string,
    document: AppliedEffectSpec['document'],
  ): boolean {
    let replaced = false;
    const patch = (effects: AppliedEffectSpec[]) => {
      effects.forEach((effect, index) => {
        if (effect.path === path) {
          effects[index] = {...effect, document};
          replaced = true;
        }
      });
    };
    patch(this.appliedEffects);
    for (const layer of this.layerList) {
      patch(layer.effects);
      patch(layer.background.effects);
      patch(layer.foreground.effects);
    }
    for (const actor of this.actorList) {
      actor.setEffectDocument(path, document);
      replaced ||= actor.effects().some(effect => effect.path === path);
    }
    return replaced;
  }

  /** Stop a viewport-wide effect. Removing one not in play is a no-op. */
  removeEffect(path: string): this {
    const index = this.appliedEffects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      this.appliedEffects.splice(index, 1);
    }
    return this;
  }

  renderSnapshot(): RenderState[] {
    const spatial = this.membership.items().find(r => r.id === SPATIAL.rule);
    const positional: Trait | undefined = spatial?.traits[SPATIAL.trait];
    if (!positional) {
      return [];
    }
    const positionProp = positional.properties[SPATIAL.position] as
      | Property<Vector>
      | undefined;
    const scaleProp = positional.properties[SPATIAL.scale] as
      | Property<Vector>
      | undefined;
    const rotationProp = positional.properties[SPATIAL.rotation] as
      | Property<number>
      | undefined;
    // Skew is optional: a world built before the property existed still renders,
    // just without shear.
    const skewProp = positional.properties[SPATIAL.skew] as
      | Property<number>
      | undefined;
    if (!positionProp || !scaleProp || !rotationProp) {
      return [];
    }
    // Appearance is a separate, optional trait; resolve its properties once.
    const appearance = this.membership
      .items()
      .find(r => r.id === APPEARANCE.rule);
    const appearanceTrait: Trait | undefined =
      appearance?.traits[APPEARANCE.trait];
    const spriteProp = appearanceTrait?.properties[APPEARANCE.sprite] as
      | Property<string>
      | undefined;
    // Optional like the rest of them: an actor may be positional and never
    // drawn, and a world built before this property existed still renders.
    const opacityProp = appearanceTrait?.properties[APPEARANCE.opacity] as
      | Property<number>
      | undefined;
    const cellOriginProp = appearanceTrait?.properties[
      APPEARANCE.spriteCellOrigin
    ] as Property<Vector> | undefined;
    const cellSizeProp = appearanceTrait?.properties[
      APPEARANCE.spriteCellSize
    ] as Property<Vector> | undefined;
    const animationProp = appearanceTrait?.properties[APPEARANCE.animation] as
      | Property<string>
      | undefined;
    const frameProp = appearanceTrait?.properties[APPEARANCE.frame] as
      | Property<number>
      | undefined;
    // Resolve one actor's current appearance frame: a playing animation's frame
    // wins, then a static sprite, then nothing (a plain rectangle).
    const frameFor = (actor: Actor): FrameState | undefined => {
      if (!appearanceTrait || !actor.has(appearanceTrait)) {
        return undefined;
      }
      const animId = animationProp ? actor.get(animationProp) : '';
      if (animId) {
        const def = this.animationDefs.get(animId);
        if (def && def.frames.length > 0) {
          const index = frameProp ? actor.get(frameProp) : 0;
          const f = def.frames[Math.min(index, def.frames.length - 1)];
          return {
            sprite: f.sprite,
            cell: f.position,
            offset: f.offset ?? {x: 0, y: 0},
            // FITTED, by the same factor the size was published with: the
            // largest cell across the whole animation, so a smaller frame
            // draws smaller instead of every frame swelling to a tile
            // (`rules/animation.publishIntrinsicSize`, specs/ACTOR_SIZE.md).
            scale: (f.scale ?? 1) * this.publishAnimationSize(actor, def),
          };
        }
      }
      const sprite = spriteProp ? actor.get(spriteProp) : '';
      if (sprite) {
        // A static sprite may draw one cell of a spritesheet: the rectangle is
        // on the actor (set by `set sprite`), since the engine knows nothing of
        // grids. A size of (0, 0) means the whole image.
        const size = cellSizeProp ? actor.get(cellSizeProp) : undefined;
        const origin = cellOriginProp ? actor.get(cellOriginProp) : undefined;
        const cell =
          size && size.x > 0 && size.y > 0
            ? {
                x: origin?.x ?? 0,
                y: origin?.y ?? 0,
                width: size.x,
                height: size.y,
              }
            : undefined;
        // The cell's own size when it draws one, the whole picture's
        // otherwise — the two sources `publishPictureSize` measures, so the
        // drawn size and the collision box are the same number twice.
        const measured = cell
          ? {width: cell.width, height: cell.height}
          : this.imageSize(sprite);
        if (!measured) {
          return {sprite, cell, offset: {x: 0, y: 0}, scale: 1};
        }
        const fit = fitToTile(measured.width, measured.height);
        this.publishSize(actor, measured.width * fit, measured.height * fit);
        return {sprite, cell, offset: {x: 0, y: 0}, scale: fit};
      }
      return undefined;
    };

    /**
     * Run one actor's kind's drawing routine, if it has one.
     *
     * EVERY FRAME, on purpose: running it is a few array pushes, and what it
     * costs to make a TEXTURE is paid by the driver only when the key changes
     * (specs/DRAWING.md). Nothing here caches, because a cache keyed on
     * anything but the commands themselves is a cache that has to be told when
     * it is wrong.
     */
    const drawingFor = (actor: Actor): DrawingState | undefined => {
      const drawing = this.kindDrawings.get(actor.type);
      if (!drawing) {
        return undefined;
      }
      const pen = new CommandPen();
      drawing.run(actor, pen, this);
      // ASKED HERE TOO, and this is where a size that changes is honoured: an
      // actor made wider draws wider on the next frame, because the canvas is
      // read with the commands rather than remembered from when it was placed.
      const {width, height} = drawing.size(actor, this);
      // …AND `intrinsic size` FOLLOWS IT. The two must not drift: a Button
      // drawn wider whose click box stayed narrow is a button that misses, and
      // everything that asks how big an actor is reads the property rather
      // than the picture (`place`, above). Written only when it has actually
      // moved, so an ordinary actor's is set once and never again.
      const sizeProperty = this.intrinsicSizeProperty();
      if (sizeProperty) {
        const known = actor.get(sizeProperty);
        if (known?.x !== width || known?.y !== height) {
          actor.set(sizeProperty, new Vector(width, height));
        }
      }
      return {
        key: drawingKey(width, height, pen.commands),
        width,
        height,
        commands: pen.commands,
      };
    };

    const states: RenderState[] = [];
    for (const actor of this.actorList) {
      if (!actor.has(positional)) {
        continue;
      }
      const position = actor.get(positionProp);
      const scale = actor.get(scaleProp);
      const parent = actor.parent();
      const stored = parent
        ? {
            position: actor.local(positionProp),
            scale: actor.local(scaleProp),
          }
        : undefined;
      states.push({
        actor,
        ...(parent && stored
          ? {
              parent,
              local: {
                x: stored.position.x,
                y: stored.position.y,
                scaleX: stored.scale.x,
                scaleY: stored.scale.y,
                rotation: actor.local(rotationProp),
              },
            }
          : {}),
        x: position.x,
        y: position.y,
        scaleX: scale.x,
        scaleY: scale.y,
        rotation: actor.get(rotationProp),
        skew: skewProp ? actor.get(skewProp) : 0,
        opacity:
          opacityProp && appearanceTrait && actor.has(appearanceTrait)
            ? actor.get(opacityProp)
            : 1,
        frame: frameFor(actor),
        drawing: drawingFor(actor),
        effects: actor.effects(),
        layer: this.depthOf(actor.layer ?? DEFAULT_LAYER_ID, actor.space),
        ...(actor.space && actor.space !== this.rootSpace
          ? {space: actor.space.id}
          : {}),
      });
    }
    return states;
  }

  /** Set a world-scoped property by its `${ruleId}.${propId}` path. */
  setWorldProperty(path: string, value: unknown): boolean {
    for (const rule of this.membership.items()) {
      for (const property of Object.values(rule.properties)) {
        if (`${property.ownerId}.${property.id}` === path) {
          this.set(property, value as never);
          return true;
        }
      }
    }
    // The world's own, which the patcher reaches by the same path.
    for (const property of this.ownProperties) {
      if (`${property.ownerId}.${property.id}` === path) {
        this.set(property, value as never);
        return true;
      }
    }
    return false;
  }

  /**
   * Set one placed actor's property, by the path a snapshot names it with.
   *
   * The actor half of `setWorldProperty`, and the reason a learner can nudge a
   * value on a `.actor` file — a start position, a move speed — and see it in
   * the game they are watching rather than in the game that restarts around
   * them (specs/QUALITY_OF_LIFE.md §1).
   *
   * One property, addressed exactly: the reconciler patches only what the
   * learner actually changed. Writing back a whole snapshot would put every
   * actor back where it was authored, which for anything that moves is the
   * reset this exists to avoid.
   *
   * @returns whether that actor has that property
   */
  setActorProperty(actorId: string, path: string, value: unknown): boolean {
    const actor = this.actorList.find(candidate => candidate.id === actorId);
    if (!actor) {
      return false;
    }
    for (const trait of actor.traits()) {
      for (const property of Object.values(trait.properties)) {
        if (`${property.ownerId}.${property.id}` === path) {
          actor.set(property, value as never);
          return true;
        }
      }
    }
    return false;
  }

  /** A pristine, comparable snapshot of this world's structure and values. */
  snapshot(): WorldSnapshot {
    const rules = this.membership.items();
    const world: Record<string, unknown> = {};
    for (const rule of rules) {
      for (const property of Object.values(rule.properties)) {
        if (property.type === 'actors' || property.type === 'actor') {
          continue; // never snapshotted — see PropertyType
        }
        world[`${property.ownerId}.${property.id}`] = this.get(property);
      }
    }
    // …and the world's own, which belong to no rule. In the snapshot for the
    // reason it exists: the driver patches a running world when only `world`
    // values changed (PLAN §9), and a score left out of this would be a score
    // reset by every edit to the file it lives in.
    for (const property of this.ownProperties) {
      if (property.type === 'actors' || property.type === 'actor') {
        continue;
      }
      world[`${property.ownerId}.${property.id}`] = this.get(property);
    }
    const actors: Record<string, Record<string, unknown>> = {};
    const actorTraits: Record<string, string[]> = {};
    for (const actor of this.actorList) {
      const values: Record<string, unknown> = {};
      for (const trait of actor.traits()) {
        for (const property of Object.values(trait.properties)) {
          if (property.type === 'actors' || property.type === 'actor') {
            // An actor holds the world and the world holds its actors, so a
            // baseline containing one could not be stringified — and a set of
            // actors worked out this tick is scratch, not state a rebuild
            // should carry (specs/COLLISION.md).
            continue;
          }
          values[`${property.ownerId}.${property.id}`] = actor.get(property);
        }
      }
      actors[actor.id] = values;
      actorTraits[actor.id] = actor.traits().map(trait => trait.id);
    }
    return {
      ruleIds: rules.map(rule => rule.id).sort(),
      ruleCode: Object.fromEntries(
        rules.map(rule => [rule.id, ruleContentHash(rule)]),
      ),
      actorIds: this.actorList.map(actor => actor.id).sort(),
      cameras: this.cameraList.map(camera => camera.id),
      activeCamera: this.activeCameraId,
      cameraPositions: Object.fromEntries(
        this.cameraList.map(camera => [
          camera.id,
          {x: camera.position.x, y: camera.position.y},
        ]),
      ),
      layers: this.layerList.map(layer => layer.id),
      layerMotion: Object.fromEntries(
        this.layerList.map(layer => [
          layer.id,
          {
            parallax: {x: layer.parallax.x, y: layer.parallax.y},
            fit: layer.fit,
          },
        ]),
      ),
      // By actor id so the list is stable, but NOT sorted within an actor:
      // handlers for one event run in registration order, so a reorder is a
      // real change and should read as one.
      actorTraits,
      handlerIds: [...this.actorList]
        .sort((left, right) => (left.id < right.id ? -1 : 1))
        .flatMap(actor => actor.handlerIds().map(id => `${actor.id}:${id}`)),
      // Sorted, like the id lists: the snapshot is compared by stringifying it,
      // so a stable order is what keeps an unchanged world comparing equal.
      // World effects sit in the same list as the actors'. They are keyed by
      // path and hashed by content just the same, and nothing downstream needs
      // to tell a viewport effect from an actor's — the reconciler only asks
      // whether the set changed.
      effectIds: this.effectSlots()
        .map(([owner, effect]) => effectSlotId(owner, effect))
        .sort(),
      effectValues: Object.fromEntries(
        this.effectSlots().map(([owner, effect]) => [
          effectSlotId(owner, effect),
          effect.values,
        ]),
      ),
      // By path, so the same effect on ten actors is hashed once — and so a
      // patch can find every spec that needs the new document.
      effectDocs: Object.fromEntries(
        this.allEffects().map(effect => [
          effect.path,
          effectContentHash(effect),
        ]),
      ),
      // Per layer, in stack order, plus the world's one color. Values, not
      // structure: changing the sky patches the running game.
      backdrops: this.layerList.map(layer =>
        slotValues(layer.id, layer.background),
      ),
      foregrounds: this.layerList.map(layer =>
        slotValues(layer.id, layer.foreground),
      ),
      clearColor: [...this.clearColor] as Rgba,
      // The track, and not the one-shots: what is playing is state a patch can
      // set, what already played is a moment (specs/SOUND.md).
      ...(this.track === undefined ? {} : {music: this.track}),
      world,
      actors,
    };
  }
}
