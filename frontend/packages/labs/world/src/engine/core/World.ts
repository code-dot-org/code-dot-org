// A World is the encapsulation of the laws (Rules) in play (GLOSSARY.md). The
// instance holds the reference-counted rule set, the world-scoped property
// store, the actors living under those laws, and the per-tick Scheduler and
// EventQueue. `tick(delta)` advances the simulation: run every Step in order,
// then flush the events those steps raised.

import type {Actor} from './Actor';
import type {AnimationDef, FrameState} from './animationTypes';
import {
  DEFAULT_CAMERA_ID,
  makeCamera,
  type Camera,
  type CameraInit,
} from './Camera';
import {rgba, type ColorValue, type Rgba} from './color';
import {
  CommandPen,
  drawingKey,
  type ActorDrawing,
  type DrawCommand,
} from './drawing';
import {effectContentHash, effectSlotId} from './effectIds';
import {EventQueue} from './EventQueue';
import {
  DEFAULT_LAYER_ID,
  makeLayer,
  type Layer,
  type LayerInit,
  type LayerSlot,
  type SlotName,
} from './Layer';
import {ruleContentHash} from './ruleIds';
import {Scheduler} from './Scheduler';
import {APPEARANCE, SPATIAL} from './spatialKeys';
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
} from './types';
import {Vector, type VectorLike} from './Vector';
import {TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from './viewport';

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
  /** The one colour behind everything — a value, patched like the sky above. */
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
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  /** Degrees. */
  rotation: number;
  /** Vertical skew in degrees — a shear the driver applies about the actor's
   * center (0 = none). */
  skew: number;
  /** Effects to play on this actor's image; empty for most actors. */
  effects: readonly AppliedEffectSpec[];
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
 * layer, drawn behind that layer's actors; the COLOUR is the world's, since a
 * colour on any layer but the bottom can never be seen.
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
 * The colour the preview has always cleared to, moved here so the driver reads
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

// `vector` and `point` are both stored as a `Vector` (see Actor's coerce).
const coerce = <T>(property: Property<T>, value: unknown): T =>
  property.type === 'vector' || property.type === 'point'
    ? (Vector.from(value as Vector) as unknown as T)
    : (value as T);

/**
 * `world.cameras` — iterable, with the same trait filter the actors have.
 *
 * A rule's step walks the cameras that elected its trait, exactly as gravity's
 * step walks the actors that elected `Affected by Gravity`. That symmetry is
 * the whole point of a camera holding traits.
 */
class CameraCollection {
  private readonly list: Camera[];

  constructor(list: Camera[]) {
    this.list = list;
  }

  /** Every camera with a trait — a copy, so a body may add one while walking. */
  with(trait: Parameters<Camera['has']>[0]): Camera[] {
    return this.list.filter(camera => camera.has(trait));
  }

  [Symbol.iterator](): Iterator<Camera> {
    return this.list[Symbol.iterator]();
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
   * (`actors/coin`), or a world-local template's id.
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

  [Symbol.iterator](): Iterator<Actor> {
    return this.list[Symbol.iterator]();
  }
}

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
  private bounds = new Vector(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
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
  // The one colour behind everything. World-scoped, not per layer: a colour on
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
  // The set of currently-pressed input keys, refreshed by the driver each frame
  // before `tick` (the engine is DOM-free, so input arrives as plain data).
  // Rule steps read it through `isKeyDown`; keys carry OUR names — 'left arrow',
  // 'a', 'space' — which the driver translates the DOM's into (core/keys).
  private keys: ReadonlySet<string> = new Set();
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
    this.cameraCollection = new CameraCollection(this.cameraList);
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
  private ticking = false;

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
    let ordinal = 2;
    while (this.hasActor(`${base}#${ordinal}`)) {
      ordinal += 1;
    }
    return `${base}#${ordinal}`;
  }

  /**
   * Let an actor KIND contribute its own per-frame steps.
   *
   * The `each frame` an `.actor` file may declare (blockly/actorMeta), and the
   * counterpart to `defineProperty`: state a kind carries without a rule, and
   * now behaviour a kind runs without one. A rule is still what you write when
   * the behaviour is shared, elected or answerable — this is for the case where
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
            step.run(actor, world, delta);
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
    const spatial = this.membership.items().find(r => r.id === SPATIAL.rule);
    const positional: Trait | undefined = spatial?.traits[SPATIAL.trait];
    return positional?.properties[SPATIAL.intrinsicSize] as
      | Property<Vector>
      | undefined;
  }

  private place(actor: Actor, layer: string = DEFAULT_LAYER_ID): Actor {
    // The back-reference an actor-scoped action or query reads to reach the
    // world (see `Actor.world`). Set here because placement is what makes it
    // true, and cleared by `clearActors` for the same reason.
    actor.world = this;
    // The zero its age counts from. Placement is what starts the clock, so a
    // template instantiated and placed twice gives two actors of different ages.
    actor.bornAt = this.elapsed;
    actor.layer = this.layerIndex.has(layer) ? layer : DEFAULT_LAYER_ID;
    // A drawn actor's size is DECLARED, so it is known the moment the actor
    // exists and never measured. Everything that asks how big an actor is
    // reads `intrinsic size` — the click box (rules/mouse), the collision box,
    // "Stays in the Map" — so a Button is the size of the picture it draws
    // without anything looking at pixels (specs/DRAWING.md).
    const drawing = this.kindDrawings.get(actor.type);
    if (drawing) {
      const property = this.intrinsicSizeProperty();
      if (property) {
        actor.set(property, new Vector(drawing.width, drawing.height));
      }
    }
    this.actorList.push(actor);
    return actor;
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
    if (!this.cameraList.some(camera => camera.id === init.id)) {
      const camera = makeCamera(init);
      // The back-reference a camera-scoped body reads (see `Camera.world`).
      camera.world = this;
      this.cameraList.push(camera);
    }
    return this;
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
    return (
      this.cameraList.find(camera => camera.id === id) ??
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
  depthOf(layer: string): number {
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
    if (this.ticking) {
      this.leaving.add(target);
      return true;
    }
    this.detach(target);
    return true;
  }

  /** Actually take it out: off the list, and no longer pointing at this world. */
  private detach(actor: Actor): void {
    const index = this.actorList.indexOf(actor);
    if (index >= 0) {
      this.actorList.splice(index, 1);
    }
    // The back-references `addActor` set; an actor that is nowhere should not
    // be able to reach the world it used to be in, nor claim a layer in it.
    actor.world = undefined;
    actor.layer = undefined;
  }

  /** Whether an actor with `id` is already in this world. */
  hasActor(id: string): boolean {
    return this.actorList.some(actor => actor.id === id);
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

  /** Raise an event for `actor`; dispatched after the current tick's steps. */
  emit(event: GameEvent, actor: Actor, detail?: unknown): void {
    this.events.enqueue(event, actor, detail);
  }

  /**
   * Whether `event` is already queued for `actor` — see `EventQueue.isPending`.
   *
   * For a raiser that must not raise twice in one tick, and would otherwise
   * have to keep a per-actor flag and clear it at some moment of its own.
   */
  hasPendingEvent(event: GameEvent, actor: Actor): boolean {
    return this.events.isPending(event, actor);
  }

  /**
   * Raise an event that is about the WORLD — a key went down, a level was
   * cleared — with no actor it happened to.
   *
   * A separate method rather than an optional argument, because the two say
   * different things and `emit(event, detail)` would read as an actor with the
   * detail in its place. Which of the two a rule uses is decided by where it
   * declared the event: under a trait it is an actor's, on the rule it is the
   * world's.
   *
   * Dispatched with the actor ones, after this tick's steps.
   */
  emitToWorld(event: GameEvent, detail?: unknown): void {
    this.events.enqueue(event, undefined, detail);
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
  mapBounds(): Vector {
    return this.bounds;
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
   * A world that is not ticking does not age. Pause the game and time stops
   * with it, which is what a learner means by "two seconds later" — two seconds
   * of game, not two seconds of sitting in a paused tab.
   *
   * It agrees exactly with anything integrated from `delta`. A bullet that has
   * travelled `speed × 2` has an age of exactly 2, because the same numbers
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
  viewSize(): Vector {
    return new Vector(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  }

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
    if (!map.size || !map.tile) {
      return; // a synthesised map has no size; the world keeps the one it had
    }
    this.bounds = new Vector(
      Math.max(this.bounds.x, map.size.width * map.tile.width),
      Math.max(this.bounds.y, map.size.height * map.tile.height),
    );
  }

  /** Replace the pressed-key set (driver calls this each frame before `tick`). */
  setInput(keys: Iterable<string>): void {
    this.keys = new Set(keys);
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
  mousePosition(): Vector {
    const view = this.viewSize();
    const camera = this.activeCamera();
    return new Vector(
      camera.position.x - view.x / 2 + this.pointer.x,
      camera.position.y - view.y / 2 + this.pointer.y,
    );
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

  /** The ids of every registered animation (active rules' stock + world extras). */
  animationIds(): string[] {
    return [...this.animationDefs.keys()];
  }

  /** Advance the simulation by `delta` seconds. */
  tick(delta: number): void {
    this.ticking = true;
    // Before the steps, so every step in this frame reads one value, and that
    // value is the time the positions they compute belong to (see `time`).
    this.elapsed += delta;
    try {
      this.scheduler.run(this, delta);
      // Handlers run here, and a handler is where "remove that coin" comes
      // from — so the sweep below is after them, not before.
      this.events.flush(this);
    } finally {
      this.ticking = false;
      for (const actor of this.leaving) {
        this.detach(actor);
      }
      this.leaving.clear();
    }
    // The keys this tick become "previous" for the next, so edge detection
    // (newlyPressed/Released) compares against exactly one frame back. The
    // mouse's buttons are the same mechanism and advance in the same breath.
    this.previousKeys = this.keys;
    this.previousButtons = this.buttons;
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

  /** The one colour behind everything, as the driver clears to it. */
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
   * `undefined` clears it, leaving the backdrop colour. The image is stretched
   * to the viewport by the driver (BACKGROUNDS.md §4); nothing here knows how
   * big it is, and a backdrop is never a spritesheet, so this takes a file name
   * and never a cell reference.
   */
  setBackground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    this.backdropAt(layer).sprite = sprite;
    return this;
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
   * leaving nothing drawn: unlike the background there is no colour behind a
   * foreground, because a colour in front of everything would be a wall.
   */
  setForeground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    this.slotAt(layer, 'foreground').sprite = sprite;
    return this;
  }

  /**
   * Set the colour behind the backdrop image, and behind everything without one.
   *
   * Takes whatever a colour block produced — hex from a picker, floats from
   * `r g b a` — because `rgba` accepts both and every colour block can then
   * feed this one (see color.ts).
   *
   * One sky, not one per layer: a colour on any layer but the bottom would be
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
            scale: f.scale ?? 1,
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
        return {sprite, cell, offset: {x: 0, y: 0}, scale: 1};
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
      drawing.run(actor, pen);
      return {
        key: drawingKey(drawing.width, drawing.height, pen.commands),
        width: drawing.width,
        height: drawing.height,
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
      states.push({
        actor,
        x: position.x,
        y: position.y,
        scaleX: scale.x,
        scaleY: scale.y,
        rotation: actor.get(rotationProp),
        skew: skewProp ? actor.get(skewProp) : 0,
        frame: frameFor(actor),
        drawing: drawingFor(actor),
        effects: actor.effects(),
        layer: this.depthOf(actor.layer ?? DEFAULT_LAYER_ID),
      });
    }
    return states;
  }

  /**
   * Remove every actor (used by `WorldBuilder.clear` and the `clear world` block).
   *
   * DEFERRED while a tick is running, exactly as {@link removeActor} is and for
   * the same reason: clearing the world is something a handler does — "the
   * player reached the exit, take it all away" — and a handler runs inside the
   * walk of the very list this empties. Emptying it underneath that walk skips
   * whatever came next. `WorldBuilder.clear` calls this at setup, where nothing
   * is ticking and it takes effect at once.
   */
  clearActors(): void {
    if (this.ticking) {
      for (const actor of this.actorList) {
        this.leaving.add(actor);
      }
      return;
    }
    for (const actor of this.actorList) {
      actor.world = undefined;
      actor.layer = undefined;
    }
    this.actorList.length = 0;
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
      // Per layer, in stack order, plus the world's one colour. Values, not
      // structure: changing the sky patches the running game.
      backdrops: this.layerList.map(layer =>
        slotValues(layer.id, layer.background),
      ),
      foregrounds: this.layerList.map(layer =>
        slotValues(layer.id, layer.foreground),
      ),
      clearColor: [...this.clearColor] as Rgba,
      world,
      actors,
    };
  }
}
