// A World is the encapsulation of the laws (Rules) in play (GLOSSARY.md). The
// instance holds the reference-counted rule set, the world-scoped property
// store, the actors living under those laws, and the per-tick Scheduler and
// EventQueue. `tick(delta)` advances the simulation: run every Step in order,
// then flush the events those steps raised.

import type {Actor} from './Actor';
import type {AnimationDef, FrameState} from './animationTypes';
import {rgba, type ColorValue, type Rgba} from './color';
import {effectContentHash, effectSlotId} from './effectIds';
import {EventQueue} from './EventQueue';
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
  WorldQuery,
} from './types';
import {Vector} from './Vector';

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
   * What each backdrop layer draws, back to front.
   *
   * Values, not structure, and patched live like world properties: changing the
   * sky is the kind of edit a learner makes while watching the game, and it
   * would be a poor trade to restart for it. The layers' EFFECTS are not here —
   * they are in `effectIds` with everyone else's, so gaining or losing one is
   * structural exactly as it is on an actor.
   */
  backdrops: Array<{sprite?: string; color: Rgba}>;
  /** World-scoped property values, by `${ruleId}.${propId}`. */
  world: Record<string, unknown>;
  /** Per-actor property values, by actor id then `${traitId}.${propId}`. */
  actors: Record<string, Record<string, unknown>>;
}

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
}

/**
 * One backdrop layer, as the driver draws it.
 *
 * The appearance half of an actor with none of the body: something to draw,
 * effects to draw it through, and nothing the simulation can reach — no
 * position, no traits, no place in the rules (BACKGROUNDS.md §1). A world has
 * at least one, and it is drawn behind everything.
 */
export interface BackdropState {
  /** An image file name, as a frame names one; absent means colour only. */
  sprite?: string;
  /** Behind the image, and all there is when there is none. */
  color: Rgba;
  /** Effects filtering this layer's own pixels — not the whole camera. */
  effects: readonly AppliedEffectSpec[];
}

/** The same, while the world still owns it and can change it. */
interface BackdropSlot {
  sprite?: string;
  color: Rgba;
  effects: AppliedEffectSpec[];
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
  /** Initial world-property values overriding rule defaults. */
  overrides: Array<[Property, unknown]>;
  /** Animations to register beyond the active rules' stock, by id. */
  animations?: Array<[string, AnimationDef]>;
  /** Effects played across the whole viewport. */
  effects?: AppliedEffectSpec[];
  /** Backdrop layers, back to front; layer 0 is what the blocks address. */
  backdrops?: BackdropState[];
}

// `vector` and `point` are both stored as a `Vector` (see Actor's coerce).
const coerce = <T>(property: Property<T>, value: unknown): T =>
  property.type === 'vector' || property.type === 'point'
    ? (Vector.from(value as Vector) as unknown as T)
    : (value as T);

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
  private readonly scheduler: Scheduler;
  private readonly events = new EventQueue();
  // Animations known to this world, by id — seeded from the active rules' stock
  // animations. The Animation rule's step and renderSnapshot resolve ids here.
  private readonly animationDefs = new Map<string, AnimationDef>();
  // Effects played across the whole viewport, not on any one actor. Mutable for
  // the same reason an actor's list is: the driver re-reads it every frame.
  private readonly appliedEffects: AppliedEffectSpec[];
  // Backdrop layers, back to front. Never empty: layer 0 is what every
  // background block addresses, and a world that was told nothing about its
  // background still has one, in the default colour.
  private readonly backdropList: BackdropSlot[];
  // The set of currently-pressed input keys, refreshed by the driver each frame
  // before `tick` (the engine is DOM-free, so input arrives as plain data).
  // Rule steps read it through `isKeyDown`; keys carry OUR names — 'left arrow',
  // 'a', 'space' — which the driver translates the DOM's into (core/keys).
  private keys: ReadonlySet<string> = new Set();
  // The previous tick's pressed set, so a rule step can detect rising/falling
  // edges (a key *just* pressed or released) rather than only the held state.
  // Advanced at the end of each `tick`.
  private previousKeys: ReadonlySet<string> = new Set();

  constructor(init: WorldInit) {
    this.id = init.id;
    this.name = init.name;
    this.actors = new ActorCollection(this.actorList);

    for (const rule of init.rules) {
      this.membership.add(rule);
    }
    const rules = this.membership.items();

    // Seed world-scoped properties from every present rule's defaults, then
    // apply overrides.
    for (const rule of rules) {
      for (const property of Object.values(rule.properties)) {
        this.store.set(property, coerce(property, property.default));
      }
    }
    for (const [property, value] of init.overrides) {
      this.store.set(property, coerce(property, value));
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

    this.appliedEffects = init.effects ? [...init.effects] : [];

    // Copied, not adopted: the builder may instantiate more than one world from
    // the same description (`instantiate`), and two worlds sharing a backdrop
    // would share every later change to it.
    this.backdropList = (init.backdrops ?? []).map(backdrop => ({
      ...backdrop,
      color: [...backdrop.color] as Rgba,
      effects: [...backdrop.effects],
    }));
    if (this.backdropList.length === 0) {
      this.backdropList.push({
        color: rgba(DEFAULT_BACKDROP_COLOR),
        effects: [],
      });
    }

    // The per-tick order is fixed by the active rules' steps.
    const steps: Step[] = [];
    for (const rule of rules) {
      steps.push(...Object.values(rule.steps));
    }
    this.scheduler = new Scheduler(steps);
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

  addActor(actor: Actor): void {
    // The back-reference an actor-scoped action or query reads to reach the
    // world (see `Actor.world`). Set here because placement is what makes it
    // true, and cleared by `clearActors` for the same reason.
    actor.world = this;
    this.actorList.push(actor);
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
    // The back-reference `addActor` set; an actor that is nowhere should not
    // be able to reach the world it used to be in.
    actor.world = undefined;
  }

  /** Whether an actor with `id` is already in this world. */
  hasActor(id: string): boolean {
    return this.actorList.some(actor => actor.id === id);
  }

  /** Raise an event for `actor`; dispatched after the current tick's steps. */
  emit(event: GameEvent, actor: Actor, detail?: unknown): void {
    this.events.enqueue(event, actor, detail);
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

  /** The definition of a known animation, or undefined. */
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
    // (newlyPressed/Released) compares against exactly one frame back.
    this.previousKeys = this.keys;
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
    return this.backdropList;
  }

  /**
   * The layer `n`, creating the layers up to it if they do not exist yet.
   *
   * Growing rather than throwing is what makes the optional `layer` argument on
   * the methods below a real promise: parallax adds blocks that name a layer,
   * and nothing about the engine has to change when they arrive. A new layer
   * starts transparent, so adding layer 2 does not black out layer 0.
   */
  private backdropAt(layer: number): BackdropSlot {
    const index = Math.max(0, Math.floor(layer));
    while (this.backdropList.length <= index) {
      this.backdropList.push({color: [0, 0, 0, 0], effects: []});
    }
    return this.backdropList[index];
  }

  /**
   * Draw `sprite` behind everything — an image file name, as a frame names one.
   *
   * `undefined` clears it, leaving the backdrop colour. The image is stretched
   * to the viewport by the driver (BACKGROUNDS.md §4); nothing here knows how
   * big it is, and a backdrop is never a spritesheet, so this takes a file name
   * and never a cell reference.
   */
  setBackground(sprite: string | undefined, layer = 0): this {
    this.backdropAt(layer).sprite = sprite;
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
    this.backdropAt(0).color = rgba(color);
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
    layer = 0,
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

  /** Stop an effect on the backdrop. Removing one not playing is a no-op. */
  removeBackgroundEffect(path: string, layer = 0): this {
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
      ...this.backdropList.flatMap(backdrop => [...backdrop.effects]),
      ...this.actorList.flatMap(actor => [...actor.effects()]),
    ];
  }

  /**
   * Every applied effect with what carries it: `world`, `backdrop:<n>`, or the
   * actor's id. The vocabulary the snapshot and the value patch share.
   */
  private effectSlots(): Array<[string, AppliedEffectSpec]> {
    return [
      ...this.appliedEffects.map(
        effect => ['world', effect] as [string, AppliedEffectSpec],
      ),
      ...this.backdropList.flatMap((backdrop, index) =>
        backdrop.effects.map(
          effect =>
            [`backdrop:${index}`, effect] as [string, AppliedEffectSpec],
        ),
      ),
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
    const backdrop = /^backdrop:(\d+)$/.exec(owner);
    if (backdrop) {
      const layer = this.backdropList[Number(backdrop[1])];
      return layer ? retune(layer.effects) : false;
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
    for (const backdrop of this.backdropList) {
      patch(backdrop.effects);
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
        effects: actor.effects(),
      });
    }
    return states;
  }

  /** Remove every actor (used by `WorldBuilder.clear`). */
  clearActors(): void {
    for (const actor of this.actorList) {
      actor.world = undefined;
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
        if (property.type === 'actors') {
          continue; // never snapshotted — see PropertyType
        }
        world[`${property.ownerId}.${property.id}`] = this.get(property);
      }
    }
    const actors: Record<string, Record<string, unknown>> = {};
    for (const actor of this.actorList) {
      const values: Record<string, unknown> = {};
      for (const trait of actor.traits()) {
        for (const property of Object.values(trait.properties)) {
          if (property.type === 'actors') {
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
    }
    return {
      ruleIds: rules.map(rule => rule.id).sort(),
      ruleCode: Object.fromEntries(
        rules.map(rule => [rule.id, ruleContentHash(rule)]),
      ),
      actorIds: this.actorList.map(actor => actor.id).sort(),
      // By actor id so the list is stable, but NOT sorted within an actor:
      // handlers for one event run in registration order, so a reorder is a
      // real change and should read as one.
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
      backdrops: this.backdropList.map(backdrop => ({
        ...(backdrop.sprite === undefined ? {} : {sprite: backdrop.sprite}),
        color: [...backdrop.color] as Rgba,
      })),
      world,
      actors,
    };
  }
}
