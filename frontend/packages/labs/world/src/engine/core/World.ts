// A World is the encapsulation of the laws (Rules) in play (GLOSSARY.md). The
// instance holds the reference-counted rule set, the world-scoped property
// store, the actors living under those laws, and the per-tick Scheduler and
// EventQueue. `tick(delta)` advances the simulation: run every Step in order,
// then flush the events those steps raised.

import type {Actor} from './Actor';
import type {AnimationDef, FrameState} from './animationTypes';
import {effectContentHash, effectSnapshotId} from './effectIds';
import {EventQueue} from './EventQueue';
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
  actorIds: string[];
  /**
   * `<path>@<hash of values>` per applied effect, across the world and every
   * actor (see `effectIds.ts`).
   *
   * Structural: the reconciler compares it alongside rule and actor ids, so
   * gaining, losing, or retuning an effect restarts the game.
   */
  effectIds: string[];
  /**
   * The graph behind each effect in play, hashed, by module path.
   *
   * Deliberately NOT part of the structure. A shader can be swapped underneath
   * a filter that is already running, so editing a `.effect` patches the live
   * game instead of restarting it — which is the difference between authoring a
   * shader and rebooting a game on every keystroke.
   */
  effectDocs: Record<string, string>;
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
  // The set of currently-pressed input keys, refreshed by the driver each frame
  // before `tick` (the engine is DOM-free, so input arrives as plain data).
  // Rule steps read it through `isKeyDown`; keys use DOM `KeyboardEvent.key`
  // names ('ArrowLeft', 'a', ' ').
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

  addActor(actor: Actor): void {
    // The back-reference an actor-scoped action or query reads to reach the
    // world (see `Actor.world`). Set here because placement is what makes it
    // true, and cleared by `clearActors` for the same reason.
    actor.world = this;
    this.actorList.push(actor);
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

  /** Whether `key` (a DOM `KeyboardEvent.key` name) is currently pressed. */
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
    this.scheduler.run(this, delta);
    this.events.flush(this);
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
   * Every effect in play, the world's own and every actor's.
   *
   * Public because the hot-reload reconciler reads it off a freshly built world
   * to find the new graph for an effect the learner just edited — which may sit
   * on an actor, so `effects()` (the world's own) is not enough.
   */
  allEffects(): AppliedEffectSpec[] {
    return [
      ...this.appliedEffects,
      ...this.actorList.flatMap(actor => [...actor.effects()]),
    ];
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

  /** A pristine, comparable snapshot of this world's structure and values. */
  snapshot(): WorldSnapshot {
    const rules = this.membership.items();
    const world: Record<string, unknown> = {};
    for (const rule of rules) {
      for (const property of Object.values(rule.properties)) {
        world[`${property.ownerId}.${property.id}`] = this.get(property);
      }
    }
    const actors: Record<string, Record<string, unknown>> = {};
    for (const actor of this.actorList) {
      const values: Record<string, unknown> = {};
      for (const trait of actor.traits()) {
        for (const property of Object.values(trait.properties)) {
          values[`${property.ownerId}.${property.id}`] = actor.get(property);
        }
      }
      actors[actor.id] = values;
    }
    return {
      ruleIds: rules.map(rule => rule.id).sort(),
      actorIds: this.actorList.map(actor => actor.id).sort(),
      // Sorted, like the id lists: the snapshot is compared by stringifying it,
      // so a stable order is what keeps an unchanged world comparing equal.
      // World effects sit in the same list as the actors'. They are keyed by
      // path and hashed by content just the same, and nothing downstream needs
      // to tell a viewport effect from an actor's — the reconciler only asks
      // whether the set changed.
      effectIds: [
        ...this.appliedEffects.map(effectSnapshotId),
        ...this.actorList.flatMap(actor =>
          actor.effects().map(effectSnapshotId),
        ),
      ].sort(),
      // By path, so the same effect on ten actors is hashed once — and so a
      // patch can find every spec that needs the new document.
      effectDocs: Object.fromEntries(
        this.allEffects().map(effect => [
          effect.path,
          effectContentHash(effect),
        ]),
      ),
      world,
      actors,
    };
  }
}
