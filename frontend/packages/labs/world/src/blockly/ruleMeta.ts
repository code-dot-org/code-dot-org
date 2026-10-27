// A plain-data description of a Rule for the Blockly authoring surface — the one
// shape the editor reads to know a project's traits, properties, actions,
// queries and events, and how to reference each in generated code. Built-in
// rules derive it from their live `Rule` objects ({@link builtinRuleMeta});
// project `.rule` files parse it from their workspace JSON (a later step, the
// same way `.actor`/`.world` files are read). So the block generator and the
// trait dropdown can be driven by BOTH sources without importing the engine's
// rule objects directly — the seam that lets rules live in the project.

import type {ActorMember} from '../actors/actorData';
import type {
  ActorAction,
  GameEvent,
  Property,
  PropertyType,
  Query,
  Rule,
  Step,
  Trait,
  WorldAction,
  WorldQuery,
} from '../engine';
import {
  foldRule,
  isRuleData,
  type RuleData,
  type RuleProperty,
  type RuleStep,
} from '../rules/ruleData';

import type {ParamType} from './enums';
import type {SocketState} from './extensions/blockDesigner';
import {
  memberLocalName,
  refFromValue,
  refModule,
  ruleLocation,
} from './ruleRegistry';

export type RuleSource = 'builtin' | 'project';

/**
 * How generated code names a rule member: `WorldLab.<exportName>` for a built-in,
 * or `import {<exportName>} from '<modulePath>'` for a project rule. Centralizing
 * this on every member lets one generator emit code for either source.
 */
export interface MemberRef {
  readonly source: RuleSource;
  readonly exportName: string;
  /**
   * The NAME of the rule this member belongs to — "Gravity".
   *
   * How a reference identifies it: a value stored in a dropdown, a block type,
   * a step anchor. Where the rule lives is looked up from this at generation
   * time (ruleRegistry), so nothing saved depends on a file's path.
   */
  readonly ruleName?: string;
  /**
   * The project module a `project` member is imported from.
   *
   * A fact about the project as it stands, not part of the reference: present
   * on refs built by the parser (which read the file) and absent on refs
   * decoded from a stored value, which name the rule and nothing more.
   */
  readonly modulePath?: string;
  /**
   * This member is a FILE's own — an actor's or a world's `define property` —
   * rather than a rule's (blockly/ownProperties).
   *
   * `ruleName` still carries a name, because the block type is keyed from it,
   * but it names the declaring actor or world. So the question `refResolves`
   * asks — "is the rule this belongs to still in the project?" — has no answer
   * for one of these, and answering it by looking for a rule of that name gets
   * a NO. That is what this flag is for, and its absence was a real bug: an
   * actor's own `set max health` silently generated nothing, and its `get`
   * generated the type's dead value.
   */
  readonly own?: true;
}

/**
 * Whose member this is — and so what its body's first argument is called.
 *
 * A rule's own members are world-scoped. A trait's belong to whatever elects
 * that trait, which is an actor or a CAMERA (specs/VIEWPORT.md): "follows the
 * player" is a trait a camera takes, and its body needs to say `camera` where
 * an actor trait's says `actor`.
 *
 * The engine's `Trait` knows nothing of this. A trait is a trait; the subject
 * only decides what the generated body binds and which dropdown offers it.
 */
export type MemberScope = 'world' | 'actor' | 'camera';

export interface TraitMeta {
  readonly id: string;
  readonly name: string;
  readonly ref: MemberRef;
  /**
   * Traits this trait requires (an actor taking it takes them too), as `use
   * trait` references — a built-in export name or `<module>#<export>` for a
   * project trait. Built-in traits carry `[]` (their requires live in the engine
   * and are not surfaced for authoring).
   */
  readonly requires: readonly string[];
  /**
   * What elects this trait — an actor, or a camera.
   *
   * Absent on a trait saved before the field existed, which reads as `actor`:
   * the behavior those files already had.
   */
  readonly subject: 'actor' | 'camera';
  /**
   * The author's one-line explanation, from `define trait`'s description —
   * the tooltip wherever the trait is chosen. Absent when it says nothing.
   */
  readonly description?: string;
}

export interface PropertyMeta {
  readonly id: string;
  readonly name: string;
  readonly type: PropertyType;
  readonly default: unknown;
  readonly readonly: boolean;
  readonly scope: MemberScope;
  /** The trait that owns an actor-scoped property (absent for world-scoped). */
  readonly ownerTraitId?: string;
  readonly ref: MemberRef;
}

/**
 * A designed signature: fixed wording and the values it takes, in order.
 *
 * Every authored member has one — `define block` is the only way to declare a
 * member — while the rules the engine ships describe themselves by name and
 * parameter list. A call site renders from this when it is there, so the block a
 * learner uses reads exactly like the preview they designed.
 */
export type MemberPart =
  | {readonly kind: 'label'; readonly text: string}
  | {readonly kind: 'row'}
  | {
      readonly kind: 'param';
      readonly name: string;
      readonly type: ParamType;
      /** What a call site starts with — seeded into the socket's shadow. */
      readonly default?: unknown;
      /** …or the whole block it starts with, when the author built one. */
      readonly shadow?: SocketState;
    };

/**
 * An action or query parameter as the EDITOR sees it.
 *
 * The engine's `ActionParam` with one widening: a parameter may be typed by an
 * ENUM (`blockly/enums`), which the engine has no notion of and never needs
 * one — an enum parameter is a string parameter by the time any code runs, and
 * what the extra type buys is the dropdown the editor puts on its socket.
 */
export interface EditorParam {
  readonly name: string;
  readonly type: ParamType;
  readonly default?: unknown;
  /**
   * The block a call site starts with, when the author built one.
   *
   * The general form of `default`: a whole shadow tree rather than a value a
   * field could hold, which is what a `let` in an arguments row can carry
   * (`blockDesigner.letShadow`). Passed through to `typedValueInputs` and
   * otherwise nobody's business.
   */
  readonly shadow?: SocketState;
}

export interface ActionMeta {
  readonly id: string;
  readonly name: string;
  readonly params: readonly EditorParam[];
  /** The designed signature, when `define block` made this. */
  readonly parts?: readonly MemberPart[];
  /** The author's one-line explanation — the call-site block's tooltip. */
  readonly description?: string;
  /**
   * Whether files OTHER than the declaring one are offered this block.
   *
   * The eye on `define block`, and absent means shared — which is every block
   * written before the eye existed, and the answer a reader expects of one
   * that says nothing (`extensions/blockVisibility`). A shut eye is an
   * actor's own work: `keep the caret in view` means nothing outside the file
   * that knows what a caret is.
   */
  readonly shared?: boolean;
  readonly scope: MemberScope;
  readonly ownerTraitId?: string;
  readonly ref: MemberRef;
}

export interface QueryMeta {
  readonly id: string;
  readonly name: string;
  readonly returns?: PropertyType;
  readonly params: readonly EditorParam[];
  /** The designed signature, when `define block` made this. */
  readonly parts?: readonly MemberPart[];
  /** The author's one-line explanation — the call-site block's tooltip. */
  readonly description?: string;
  readonly scope: MemberScope;
  readonly ownerTraitId?: string;
  readonly ref: MemberRef;
}

export interface EventMeta {
  readonly id: string;
  readonly name: string;
  readonly ref: MemberRef;
  /**
   * The designed phrasing of the hat this event makes, when one was designed.
   *
   * Labels are its wording; a parameter is what a handler FILTERS on — the hat
   * carries a dropdown of that enum's choices, and the handler it generates
   * runs only when what was emitted matches (specs/ENUMS.md). Absent means the
   * plain `when ⟨actor⟩ <name>` hat, which is every event written before this.
   */
  readonly parts?: readonly MemberPart[];
  /**
   * What the event is ABOUT — and so what a handler is handed.
   *
   * Declared under a trait it is an actor's ("this actor started falling"), and
   * a handler gets `(world, actor, eventValue)`. Declared on the rule it is the
   * world's ("a key went down"), and there is no actor to hand over: the
   * handler gets `(world, eventValue)` and registers on the world.
   *
   * From the declaration site, like every other member's scope — the rule's own
   * chain or a trait's. `rules/input` declares its key events on the rule and
   * used to raise them once per actor per frame purely to have a subject.
   */
  readonly scope: MemberScope;
  /** The trait that owns an actor-scoped event (absent for world-scoped). */
  readonly ownerTraitId?: string;
}

/** A reference to another Step, for ordering — its owning rule and its id, so
 * generated code can name it `<Rule>.steps.<stepId>`. */
export interface StepAnchor {
  readonly ownerRef: MemberRef;
  readonly stepId: string;
}

/** Where a step sits in the per-tick order (the authorable subset of the
 * engine's `StepOrder`): unordered, or before/after another step. */
export interface StepOrderMeta {
  readonly kind: 'free' | 'before' | 'after' | 'phase';
  readonly anchor?: StepAnchor;
  /**
   * The named moment of the frame this runs in — `phase` only (core/phases).
   *
   * What a rule says instead of naming a neighbor. Held as a plain id rather
   * than a `PhaseId` so a `.rule` written against a phase list that has since
   * changed still parses; the Scheduler leaves an unknown one unordered.
   */
  readonly phase?: string;
}

/**
 * A per-tick Step — a rule's autonomous behavior, run every frame with the
 * `world` and the frame `delta`. Unlike actions/queries it is not called from
 * elsewhere, so it contributes no palette block; the editor needs it only as an
 * ordering ANCHOR (another step may run before/after it) and the generator needs
 * its body + order. `ownerRef` is the rule it belongs to (for `<Rule>.steps.<id>`).
 */
export interface StepMeta {
  readonly id: string;
  readonly name: string;
  readonly ownerRef: MemberRef;
  readonly order: StepOrderMeta;
  /**
   * What the body runs for, and how often.
   *
   * `world` is the step as it always was: one run per tick, `(world, delta)`.
   * An actor- or camera-scoped step is declared UNDER A TRAIT and runs once per
   * subject that has it, with that subject bound: the `for each … where has
   * trait ⟨my own trait⟩` a rule-level step would have to write out.
   */
  readonly scope: MemberScope;
  /** The trait that owns a subject-scoped step (absent for world-scoped). */
  readonly ownerTraitId?: string;
}

/**
 * Everything the editor needs about one rule. `properties`/`actions`/`queries`
 * are flattened across scopes: a world-scoped member (the rule's own) has
 * `scope: 'world'`; an actor-scoped member (a trait's) has `scope: 'actor'` and
 * an `ownerTraitId` — matching how the generators iterate a rule's own members
 * then each of its traits'.
 */
export interface RuleMeta {
  readonly id: string;
  /** What the rule is — its toolbox category, and how it is referred to. */
  readonly name: string;
  /** What using it gives a world — the label `use rule` shows. */
  readonly ability: string;
  readonly source: RuleSource;
  /** The project module this rule is defined in (absent for built-ins). */
  readonly modulePath?: string;
  readonly ref: MemberRef;
  /**
   * Rules this one requires, as `use rule` references — a built-in export name
   * (`GravityRule`) or a project module path (`rules/wind`) — resolved by the
   * same seam a world's `use rule` is.
   */
  readonly requires: readonly string[];
  readonly traits: readonly TraitMeta[];
  readonly properties: readonly PropertyMeta[];
  readonly actions: readonly ActionMeta[];
  readonly queries: readonly QueryMeta[];
  readonly events: readonly EventMeta[];
  readonly steps: readonly StepMeta[];
}

/**
 * Derive {@link RuleMeta} for built-in rules from their live `Rule` objects.
 * `namespace` is the `world-lab` export namespace; each member's export name is
 * found by reference (a member object and its `export const` are the same
 * object), matching what the generators emit as `WorldLab.<name>`.
 */
export function builtinRuleMeta(
  rules: readonly Rule[],
  namespace: Record<string, unknown>,
): RuleMeta[] {
  const nameByRef = new Map<unknown, string>();
  for (const [name, value] of Object.entries(namespace)) {
    // First export name wins — a member is exported under exactly one name.
    if (value !== undefined && value !== null && !nameByRef.has(value)) {
      nameByRef.set(value, name);
    }
  }
  // Filled in per rule below: a member's ref names the rule it belongs to.
  let owningRuleName = '';
  const ref = (obj: unknown): MemberRef => ({
    source: 'builtin',
    exportName: nameByRef.get(obj) ?? '',
    ruleName: owningRuleName,
  });
  const prop = (p: Property, ownerTraitId?: string): PropertyMeta => ({
    id: p.id,
    name: p.name ?? p.id,
    type: p.type,
    default: p.default,
    readonly: p.readonly,
    scope: p.scope,
    ownerTraitId,
    ref: ref(p),
  });
  const action = (
    a: WorldAction | ActorAction,
    scope: MemberScope,
    ownerTraitId?: string,
  ): ActionMeta => ({
    id: a.id,
    name: a.name ?? a.id,
    params: a.params ?? [],
    scope,
    ownerTraitId,
    ref: ref(a),
  });
  const query = (
    q: WorldQuery | Query,
    scope: MemberScope,
    ownerTraitId?: string,
  ): QueryMeta => ({
    id: q.id,
    name: q.name ?? q.id,
    returns: q.returns,
    params: (q as WorldQuery).params ?? [],
    scope,
    ownerTraitId,
    ref: ref(q),
  });

  return rules.map(rule => {
    owningRuleName = rule.name;
    const properties: PropertyMeta[] = Object.values(rule.properties).map(p =>
      prop(p),
    );
    const actions: ActionMeta[] = Object.values(rule.actions).map(a =>
      action(a, 'world'),
    );
    const queries: QueryMeta[] = Object.values(rule.queries).map(q =>
      query(q, 'world'),
    );
    const traits: TraitMeta[] = [];
    for (const trait of Object.values(rule.traits) as Trait[]) {
      // Built-in trait requires live in the engine; not surfaced for authoring.
      traits.push({
        id: trait.id,
        name: trait.name,
        ref: ref(trait),
        requires: [],
        // Every built-in trait is an actor's; nothing in the engine declares a
        // camera trait, and a rule that wants one authors it.
        subject: 'actor',
        ...(trait.description ? {description: trait.description} : {}),
      });
      for (const p of Object.values(trait.properties)) {
        properties.push(prop(p, trait.id));
      }
      for (const a of Object.values(trait.actions)) {
        actions.push(action(a, 'actor', trait.id));
      }
      for (const q of Object.values(trait.queries)) {
        queries.push(query(q, 'actor', trait.id));
      }
    }
    // A built-in rule's events are an actor's: the engine's `GameEvent` carries
    // no scope, and every one it ships is raised for an actor. An authored rule
    // says which it is by where it declares it (`EventMeta.scope`).
    const events: EventMeta[] = Object.values(rule.events).map(
      (e: GameEvent) => ({
        id: e.id,
        name: e.name ?? e.id,
        ref: ref(e),
        scope: 'actor' as const,
      }),
    );
    // Steps are surfaced only as ordering anchors — a project step may run
    // before/after a built-in one (gravity before Motion's reposition). Their own
    // order isn't re-emitted (they live in the engine), so it's a placeholder.
    const ownerRef = ref(rule);
    const steps: StepMeta[] = Object.values(rule.steps).map((s: Step) => ({
      id: s.id,
      name: s.id,
      ownerRef,
      scope: 'world' as const,
      order: {kind: 'free' as const},
    }));
    return {
      id: rule.id,
      name: rule.name,
      ability: rule.ability,
      source: 'builtin' as const,
      ref: ownerRef,
      // A rule's dependencies as the NAMES a `use rule` stores, so built-in and
      // project requires resolve through the same registry.
      requires: rule.requires.map(r => r.name).filter(name => name),
      traits,
      properties,
      actions,
      queries,
      events,
      steps,
    };
  });
}

// ── Declarative `.rule` files ────────────────────────────────────────────────
// A `.rule` file is the rule as data (`rules/ruleData`). It is read
// STATICALLY, never executed, to learn the traits, properties, events, blocks
// and steps it declares (its metadata). A project
// rule's members are named in generated code by a fixed convention (PascalCase
// id + kind) that the rule's own module codegen mirrors, so `import`s line up.

/**
 * The wording a designed signature reads as — its labels, joined.
 *
 * A `define block` has no NAME field: its name IS the fixed wording of the
 * block it draws. Both readers derive it the same way, or the metadata and the
 * generated body would be filed under different ids.
 */
export const designedName = (
  parts: ReadonlyArray<{kind?: string; text?: string}> | undefined,
): string =>
  (parts ?? [])
    .filter(part => part.kind !== 'param' && part.text)
    .map(part => (part.text ?? '').trim())
    .filter(Boolean)
    .join(' ');

/** An identifier from an authored name/id: non-alphanumerics become `_`. */
export const slug = (text: string): string =>
  text.replaceAll(/[^A-Za-z0-9_]/g, '_');

/** PascalCase an id for a generated export name (`gravity scale` → `GravityScale`). */
/** `actor to follow` → `ActorToFollow`; how a member's export name is built. */
export const pascal = (id: string): string =>
  id
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

export const PROPERTY_TYPES: ReadonlySet<string> = new Set([
  'number',
  // A number said as a direction. Everything downstream treats it as a number
  // — the default, the getter's output, the arithmetic — and the one thing it
  // changes is the literal a call site starts with (`typedValueInputs`).
  'angle',
  'boolean',
  'string',
  // Held as a string (`#rrggbb`) and asked about as its own kind: a color
  // socket takes a swatch, and the map editor's inspector shows a picker
  // (engine/core/types).
  'color',
  // One of the project's pictures, held as its file name: what a drawn
  // actor draws (`draw image`), chosen from the project's pictures.
  'picture',
  'vector',
  'point',
  // Lists of plain values, which unlike the actor list below are carried
  // across a hot reload and authorable as data (specs/LISTS.md).
  'numbers',
  'words',
  'vectors',
  // What a rule works out about who is where (specs/COLLISION.md). Not offered
  // as a query's return type below: a query reports a single value, and this is
  // one or many.
  'actors',
  // The same value, said to be ONE — a camera's actor to follow, not a contact
  // set. What it changes is the blocks generated around it (domainBlocks).
  'actor',
]);

// The types an authored query may return (its `TYPE` dropdown → the reporter's
// output socket). A query reports a single value; `point` isn't offered (a whole
// vector covers 2D, and a point is two scalars, not one report).
const QUERY_RETURN_TYPES: ReadonlySet<string> = new Set([
  'number',
  'boolean',
  'string',
  'vector',
]);

/** Parse an authored default (a text field) into a value of the property's type. */
/** A number, or zero — what a field that should hold one actually held. */
const numberOf = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * A property's declared default, read off the fields that hold it.
 *
 * Most types keep it in one field, `DEFAULT`, as text. The two-number types do
 * not, and used to: a vector was the string `"0,1"` and a point was the string
 * `"110,160"`, split on the comma here. `define property` puts the real editor
 * in that slot now — the arrow grid for a vector, an x and a y for a point,
 * which is what their setters take — so a vector arrives as `{x, y}` (the same
 * shape `world_vector`'s own field saves) and a point arrives as two numbers in
 * `DEFAULT` and `DEFAULT_Y`.
 */
/**
 * The property types that start EMPTY whatever is written down.
 *
 * An actor property and every list property: `propertyDefault` below answers
 * `[]` for them however the file is spelled, so there is nothing a default
 * could say. The block does not offer a default field for these
 * (`DEFAULT_SHAPES`), and a file that writes one anyway is writing a field the
 * block does not have — which Blockly reports as "Ignoring non-existant field
 * DEFAULT" and then discards.
 */
export const STARTS_EMPTY: ReadonlySet<string> = new Set([
  'actor',
  'actors',
  'numbers',
  'words',
  'vectors',
]);

export const propertyDefault = (
  type: PropertyType,
  value: unknown,
  y?: unknown,
): unknown => {
  switch (type) {
    // No actors. There is no other sensible starting value for a set a rule
    // works out each tick, and no text a learner could type that would be one.
    case 'actors':
      return [];
    // An empty list, for the same reason and one more: a list's default is the
    // one value every holder of it would otherwise share, so the emptiest
    // possible one is the only safe thing to write down (`core/lists`).
    case 'numbers':
    case 'words':
    case 'vectors':
      return [];
    // No actor — an empty list, because that is how one is stored too.
    case 'actor':
      return [];
    case 'boolean':
      return (
        String(value ?? '')
          .trim()
          .toLowerCase() === 'true'
      );
    case 'string':
    case 'color':
    case 'picture':
      return String(value ?? '');
    // One field holding both axes, because one field edits both.
    case 'vector': {
      const held = (value ?? {}) as {x?: unknown; y?: unknown};
      return {x: numberOf(held.x), y: numberOf(held.y)};
    }
    // Two fields, because a point is two numbers a learner types.
    case 'point':
      return {x: numberOf(value), y: numberOf(y)};
    default:
      return numberOf(value);
  }
};

/**
 * A `.rule` file as {@link RuleMeta}, or `undefined` for one that is not a
 * rule or not valid JSON yet. `modulePath` is the extension-less path the
 * generated code imports the rule and its members from (`rules/wind`); the
 * declared members become `project` refs into that module.
 *
 * Read from the rule's data. A file written as a `define rule` workspace is
 * folded first, and one the data cannot say whole is not a rule.
 */
export function parseRuleMeta(
  modulePath: string,
  contents: string,
): RuleMeta | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return undefined;
  }
  const data = isRuleData(parsed) ? parsed : foldRule(parsed);
  return data && ruleMetaOf(modulePath, data);
}

/** {@link parseRuleMeta}, of the data itself. */
export function ruleMetaOf(modulePath: string, data: RuleData): RuleMeta {
  // A parameter's name lives in the variable map: a part's `var` is a
  // variable's id.
  const variableNames = new Map<string, string>();
  for (const variable of (data.variables ?? []) as ReadonlyArray<{
    id?: string;
    name?: string;
  }>) {
    if (variable?.id) {
      variableNames.set(variable.id, variable.name ?? variable.id);
    }
  }

  const ruleName = data.name || 'Rule';
  const ability = data.ability || ruleName;
  const ref = (exportName: string): MemberRef => ({
    source: 'project',
    exportName,
    ruleName,
    modulePath,
  });
  // This rule's own ref — the owner of steps it declares.
  const selfRef: MemberRef = ref(`${pascal(ruleName)}Rule`);

  const traits: TraitMeta[] = [];
  const properties: PropertyMeta[] = [];
  const actions: ActionMeta[] = [];
  const queries: QueryMeta[] = [];
  const events: EventMeta[] = [];
  const steps: StepMeta[] = [];

  /** World-scoped on the rule; owned by `ownerTraitId` on a trait. */
  const addProperty = (
    property: RuleProperty,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void => {
    const name = property.name;
    if (!name) {
      return;
    }
    const type = (
      PROPERTY_TYPES.has(property.type) ? property.type : 'number'
    ) as PropertyType;
    properties.push({
      id: slug(name),
      name,
      type,
      default: propertyDefault(type, property.value, property.valueY),
      readonly: property.access === 'readonly',
      scope: ownerTraitId ? ownerSubject : 'world',
      ownerTraitId,
      ref: ref(`${pascal(name)}Property`),
    });
  };

  /**
   * A member's parts as its block is built from them. A parameter whose
   * variable is missing is called `value`.
   */
  const partsOf = (member: ActorMember, paramType: string): MemberPart[] =>
    member.parts.flatMap((part): MemberPart[] => {
      if (part.kind === 'param') {
        return [
          {
            kind: 'param',
            name: (part.var && variableNames.get(part.var)) || 'value',
            type: (part.type ?? paramType) as ParamType,
            ...(part.default === undefined ? {} : {default: part.default}),
            ...(part.shadow === undefined
              ? {}
              : {shadow: part.shadow as SocketState}),
          },
        ];
      }
      if (part.kind === 'row') {
        return [{kind: 'row'}];
      }
      return part.text ? [{kind: 'label', text: part.text}] : [];
    });

  /** An event, named by its labels joined: "%1 is pressed" is `is pressed`. */
  const addEvent = (
    member: ActorMember,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void => {
    const parts = partsOf(member, 'string');
    const name = designedName(member.parts);
    if (!name) {
      return;
    }
    events.push({
      id: slug(name),
      name,
      ref: ref(`${pascal(name)}Event`),
      scope: ownerTraitId ? ownerSubject : 'world',
      ...(ownerTraitId ? {ownerTraitId} : {}),
      ...(parts.length > 0 ? {parts} : {}),
    });
  };

  /**
   * A block: a query when it reports something, an action when it does not.
   * The parts are kept, so its call site is built in the arrangement that was
   * designed rather than name-then-arguments.
   */
  const addDesignedBlock = (
    member: ActorMember,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void => {
    const parts = partsOf(member, 'number');
    const name = designedName(member.parts);
    if (!name) {
      return;
    }
    const params = parts.flatMap(part =>
      part.kind === 'param'
        ? [
            {
              name: part.name,
              type: part.type,
              ...(part.default === undefined ? {} : {default: part.default}),
              ...(part.shadow === undefined ? {} : {shadow: part.shadow}),
            },
          ]
        : [],
    );
    const returns = member.returns;
    const common = {
      id: slug(name),
      name,
      params,
      parts,
      description: member.description || undefined,
      scope: (ownerTraitId ? ownerSubject : 'world') as MemberScope,
      ownerTraitId,
    };
    if (returns && returns !== 'none' && QUERY_RETURN_TYPES.has(returns)) {
      queries.push({
        ...common,
        returns: returns as PropertyType,
        ref: ref(`${pascal(name)}Query`),
      });
    } else {
      actions.push({...common, ref: ref(`${pascal(name)}Action`)});
    }
  };

  const addMember = (
    member: ActorMember,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void =>
    member.kind === 'event'
      ? addEvent(member, ownerTraitId, ownerSubject)
      : addDesignedBlock(member, ownerTraitId, ownerSubject);

  /**
   * A step: the rule's runs once for the world, a trait's once for each
   * subject that has it. With no phase it is unordered.
   */
  const addStep = (
    step: RuleStep,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void => {
    if (!step.name) {
      return;
    }
    steps.push({
      id: slug(step.name),
      name: step.name,
      ownerRef: selfRef,
      scope: ownerTraitId ? ownerSubject : 'world',
      ...(ownerTraitId ? {ownerTraitId} : {}),
      order: step.phase ? {kind: 'phase', phase: step.phase} : {kind: 'free'},
    });
  };

  for (const property of data.properties ?? []) {
    addProperty(property);
  }
  // Declared on the rule, so an event here is the WORLD's: the keyboard
  // rule's key events are about the world, not about a kind of actor.
  for (const member of data.members ?? []) {
    addMember(member);
  }
  for (const step of data.steps ?? []) {
    addStep(step);
  }

  for (const trait of data.traits ?? []) {
    if (!trait.name) {
      continue;
    }
    const traitId = slug(trait.name);
    const subject = trait.subject === 'camera' ? 'camera' : 'actor';
    for (const property of trait.properties ?? []) {
      addProperty(property, traitId, subject);
    }
    for (const member of trait.members ?? []) {
      addMember(member, traitId, subject);
    }
    for (const step of trait.steps ?? []) {
      addStep(step, traitId, subject);
    }
    traits.push({
      id: traitId,
      name: trait.name,
      ref: ref(`${pascal(trait.name)}Trait`),
      requires: (trait.uses ?? []).filter(Boolean),
      subject,
      ...(trait.description ? {description: trait.description} : {}),
    });
  }

  return {
    id: slug(ruleName),
    name: ruleName,
    ability,
    source: 'project',
    modulePath,
    ref: selfRef,
    // Never itself. A `use rule` naming this rule generates a module that
    // imports its own default export — a cycle the compiler resolves to
    // `undefined`, and the project dies reading `.id` of it.
    requires: (data.uses ?? []).filter(dep => dep && dep !== ruleName),
    traits,
    properties,
    actions,
    queries,
    events,
    steps,
  };
}

// ── Action / query bodies ────────────────────────────────────────────────────
// The metadata above is static (no execution), but an action's `do` and a
// query's `do` (ending in a `return`) are IMPERATIVE — real code, generated from
// the body blocks the same way an event handler's body is. That needs a live
// Blockly generator, which `parseRuleMeta` deliberately avoids, so the headless
// generator compiles the bodies alone (`rules/ruleBodies`). Each body is keyed by the member it belongs to ({@link ruleBodyKey})
// so `ruleMetaToModule` can splice it into that member's `addAction`/`addQuery`.

/** A member's body key: the scope, owning trait (if any), kind, and id. */
export const ruleBodyKey = (
  kind: 'action' | 'query' | 'step',
  scope: MemberScope,
  ownerTraitId: string | undefined,
  id: string,
): string => `${kind}:${scope}:${ownerTraitId ?? ''}:${id}`;

/** The generated closure of one action/query: its parameter identifiers (in
 * order, after the `world`/`actor` subject) and its statement body. */
export interface RuleBody {
  readonly params: readonly string[];
  readonly body: string;
}

// ── `.rule` → RuleBuilder module ─────────────────────────────────────────────
// The runtime side of a declarative rule: the same `RuleMeta` the editor reads
// is emitted as a `world-lab` module that DECLARES the rule — its traits,
// properties and events, via `RuleBuilder`. It has no Steps yet (imperative
// behavior is the deferred hard part), so the rule is inert at runtime, but its
// members exist: an actor can carry its traits, and get/set its properties. The
// export names match the parser's convention, so a world's `import Rule from
// 'rules/x'` and an actor's `import {XTrait} from 'rules/x'` resolve.

/** A JS literal for a property's default, by type. */
const defaultLiteral = (property: PropertyMeta): string => {
  const value = property.default;
  switch (property.type) {
    // No actors — and a fresh array per declaration, not one shared by every
    // actor that has the property.
    case 'actors':
      return '[]';
    // No actor, held the same way no actors is.
    case 'actor':
      return '[]';
    case 'boolean':
      return value ? 'true' : 'false';
    case 'string':
    case 'color':
    case 'picture':
      return JSON.stringify(String(value ?? ''));
    case 'vector':
    case 'point': {
      const v = (value ?? {x: 0, y: 0}) as {x: number; y: number};
      return `new Vector(${Number(v.x)}, ${Number(v.y)})`;
    }
    default:
      return String(Number(value ?? 0));
  }
};

/**
 * Generate the `world-lab` RuleBuilder module for a project rule's metadata.
 * `bodies` supplies the generated JS for each action/query (keyed by {@link
 * ruleBodyKey}); with none (a declarative-only rule), those members get empty
 * bodies. The action/query bodies reference `WorldLab.*` (built-in members) and
 * the rule's own `export const`s, so a namespace import is added when any exist.
 */
/**
 * A loop body with its loop variable taken in hand for its length
 * (`World.enter`/`leave`), the two halves of `withActor` written out so
 * the body stays a real loop body — a `return` still leaves the rule, and a
 * `continue` still continues.
 */
export const inHand = (variable: string, body: string): string =>
  `world.enter(${variable});\ntry {\n${body}} finally {\nworld.leave();\n}\n`;

export function ruleMetaToModule(
  meta: RuleMeta,
  bodies: ReadonlyMap<string, RuleBody> = new Map(),
  /**
   * Import keys the BODIES already emitted (`generator.definitions_`).
   *
   * A rule's module is written by two hands: the declarations here, and the
   * bodies the Blockly generator produced, whose own imports it prepends. Both
   * key an import the same way (`named:<module>:<Export>`) and neither could
   * see the other, so a member used in a declaration AND in a body was imported
   * twice — which is not a redundancy but a build failure:
   *
   *   The symbol "CanCollideTrait" has already been declared
   *
   * Passing what the bodies emitted is what makes the two hands agree.
   */
  alreadyImported: ReadonlySet<string> = new Set(),
): string {
  const q = (value: string): string => JSON.stringify(value);
  const hasBehavior =
    meta.actions.length > 0 || meta.queries.length > 0 || meta.steps.length > 0;

  // Imports are collected as dependency references are resolved.
  const worldLabNames: string[] = ['RuleBuilder'];
  const addWorldLab = (name: string): void => {
    if (!worldLabNames.includes(name)) {
      worldLabNames.push(name);
    }
  };
  if (meta.properties.some(p => p.type === 'vector' || p.type === 'point')) {
    addWorldLab('Vector');
  }
  // Dedupe key → import line, seeded with what the bodies already imported so
  // the same member is not imported by both.
  const projectImports = new Map<string, string>();
  const addProjectImport = (key: string, line: string): void => {
    if (!alreadyImported.has(key)) {
      projectImports.set(key, line);
    }
  };

  // A default-import identifier for a project rule module (`rules/wind` → `Wind`).
  const moduleVar = (path: string): string =>
    pascal(path.split('/').pop() ?? path) || 'Rule';

  // A rule dependency (`use rule` value — a rule's NAME) → its code reference: a
  // built-in export named from `world-lab`, or a project rule default-imported
  // from whichever module currently declares that name. A name the registry
  // doesn't know is a module path, which is how a `.js` rule (declaring no name
  // to be found by) is referred to.
  const ruleDepRef = (dep: string): string => {
    const located = ruleLocation(dep);
    const modulePath =
      located?.source === 'project' ? located.modulePath : located ? '' : dep;
    if (modulePath) {
      const varName = moduleVar(modulePath);
      addProjectImport(
        `default:${modulePath}`,
        `import ${varName} from ${q(modulePath)};`,
      );
      return varName;
    }
    const exportName = located?.source === 'builtin' ? located.exportName : dep;
    addWorldLab(exportName);
    return exportName;
  };

  // A trait dependency (`use trait` value, `<RuleName>#<export>`) → its code
  // reference: a built-in trait named from `world-lab`, or a project trait
  // imported from the module the named rule lives in.
  const traitDepRef = (dep: string): string => {
    const ref = refFromValue(dep);
    // A trait in THIS rule is an `export const` a few lines up, not something
    // to import — a rule whose Solid requires its own Can Collide would
    // otherwise import itself, and the bundle fails to build outright:
    //
    //   The symbol "CanCollideTrait" has already been declared
    //
    // Which is a question about the RULE, not about files: the name it names is
    // the name this file declares. Same self-reference the body generator avoids
    // via `__ruleModule`, and steps via `isSelfAnchor`.
    if (ref.ruleName === meta.name) {
      return ref.exportName;
    }
    const modulePath = refModule(ref);
    if (modulePath) {
      // UNDER THE NAME THE BODIES USE. Both hands key this import identically
      // and dedupe against each other, so they have to agree about what it is
      // called — and an export name alone does not: two rules may each declare
      // a `won` (`memberLocalName`).
      const local = memberLocalName(ref);
      addProjectImport(
        `named:${modulePath}:${ref.exportName}`,
        `import {${ref.exportName} as ${local}} from ${q(modulePath)};`,
      );
      return local;
    } else if (ref.source === 'builtin') {
      addWorldLab(ref.exportName);
    }
    // A name that resolves to neither is left bare — nothing here knows where
    // to import it from, and an undefined identifier says so at build time.
    return ref.exportName;
  };

  // The `export const` a step is captured in (`<PascalName>Step`). Derivable from
  // either its name or its id — `pascal` collapses the slug's `_` the same way.
  const stepExport = (nameOrId: string): string => `${pascal(nameOrId)}Step`;

  // Resolve dependency refs first, so the imports above are populated.
  const ruleRequires = meta.requires.map(ruleDepRef);
  const traitRequires = meta.traits.map(trait =>
    trait.requires.map(traitDepRef),
  );

  const body: string[] = [
    `const rule = new RuleBuilder({id: ${q(meta.id)}, name: ${q(meta.name)}});`,
  ];
  if (ruleRequires.length > 0) {
    body.push(`rule.requires([${ruleRequires.join(', ')}]);`);
  }

  // Traits first, so an actor-scoped property can attach to its trait below.
  const traitExportById = new Map<string, string>();
  meta.traits.forEach((trait, i) => {
    traitExportById.set(trait.id, trait.ref.exportName);
    body.push(
      `export const ${trait.ref.exportName} = rule.addTrait({id: ${q(trait.id)}, name: ${q(trait.name)}${trait.description ? `, description: ${q(trait.description)}` : ''}});`,
    );
    if (traitRequires[i].length > 0) {
      body.push(
        `${trait.ref.exportName}.requires([${traitRequires[i].join(', ')}]);`,
      );
    }
  });

  for (const property of meta.properties) {
    const owner =
      property.scope !== 'world' && property.ownerTraitId
        ? traitExportById.get(property.ownerTraitId)
        : undefined;
    const target = owner ?? 'rule';
    // `readonly` reaches the engine, which is what actually refuses a write —
    // the missing `set` block only keeps a learner from trying.
    const options = property.readonly
      ? `{name: ${q(property.name)}, readonly: true}`
      : `{name: ${q(property.name)}}`;
    body.push(
      `export const ${property.ref.exportName} = ${target}.addProperty(${q(property.id)}, ${q(property.type)}, ${defaultLiteral(property)}, ${options});`,
    );
  }

  // Actions and queries carry an imperative body (from `bodies`, else empty). An
  // actor-scoped member is added to its owning trait and its closure takes the
  // `actor`; a world-scoped one is added to the rule and takes the `world`. The
  // body is a real function body — its `return` (queries) works as written. Any
  // parameters follow the subject in the signature — the body extractor resolved
  // them to the same identifiers the body's getters read.
  const memberTarget = (member: {
    scope: MemberScope;
    ownerTraitId?: string;
  }): string =>
    (member.scope !== 'world' && member.ownerTraitId
      ? traitExportById.get(member.ownerTraitId)
      : undefined) ?? 'rule';
  const subject = (member: {scope: MemberScope}): string =>
    member.scope === 'world' ? 'world' : member.scope;
  /**
   * The line that opens an actor-scoped body.
   *
   * The engine invokes an actor action/query as `(actor, …args)` — there is no
   * world in the signature — but a body may well ask a question about the world
   * ("is this actor standing on any ground?"). Binding it from the actor's own
   * back-reference means every block that names `world` works in one, with no
   * generator anywhere needing to know which kind of body it is in.
   */
  const preamble = (member: {scope: MemberScope}): string =>
    member.scope === 'world' ? '' : `  const world = ${member.scope}.world;\n`;
  // The closure's argument list: the subject, then each parameter identifier.
  const signature = (member: {scope: MemberScope}, code?: RuleBody) =>
    [subject(member), ...(code?.params ?? [])].join(', ');

  for (const action of meta.actions) {
    const code = bodies.get(
      ruleBodyKey('action', action.scope, action.ownerTraitId, action.id),
    );
    body.push(
      `export const ${action.ref.exportName} = ${memberTarget(action)}.addAction(${q(action.id)}, (${signature(action, code)}) => {\n${preamble(action)}${code?.body ?? ''}}, {name: ${q(action.name)}});`,
    );
  }

  for (const query of meta.queries) {
    const code = bodies.get(
      ruleBodyKey('query', query.scope, query.ownerTraitId, query.id),
    );
    body.push(
      `export const ${query.ref.exportName} = ${memberTarget(query)}.addQuery(${q(query.id)}, (${signature(query, code)}) => {\n${preamble(query)}${code?.body ?? ''}}, {name: ${q(query.name)}, returns: ${q(query.returns ?? 'boolean')}});`,
    );
  }

  for (const event of meta.events) {
    body.push(
      `export const ${event.ref.exportName} = rule.addEvent(${q(event.id)}, {name: ${q(event.name)}});`,
    );
  }

  // Steps — the rule's per-tick behavior. Each runs with `(world, delta)` bound;
  // ordering picks the builder method (free / in a phase / before / after an
  // anchor step).
  // Emitted in self-anchor dependency order so a local anchor const exists first.
  for (const step of meta.steps) {
    const code = bodies.get(
      ruleBodyKey('step', step.scope, step.ownerTraitId, step.id),
    );
    // A subject-scoped step runs once per thing that has the trait, with that
    // thing bound — the `for each … where has trait ⟨mine⟩` a rule-level step
    // would have to write out, supplied here instead. No `const world`
    // preamble: unlike an action's, a step's closure already has one.
    const traitExport = step.ownerTraitId
      ? traitExportById.get(step.ownerTraitId)
      : undefined;
    const scoped = step.scope !== 'world' && traitExport;
    const inner = code?.body ?? '';
    // …and IN HAND while its body runs (`World.withActor`), so what the body
    // asks about the map, the mouse or what is near is asked for the
    // subject's space (specs/VIEWPORT_PLAN.md).
    const run = scoped
      ? `for (const ${step.scope} of world.${
          step.scope === 'camera' ? 'cameras' : 'actors'
        }.with(${traitExport})) {\n${inHand(step.scope, inner)}}\n`
      : inner;
    const closure = `(world, delta) => {\n${run}}`;
    const {kind, phase} = step.order;
    const call =
      kind === 'phase' && phase
        ? `rule.addStepIn(${q(step.id)}, ${q(phase)}, ${closure})`
        : `rule.addStep(${q(step.id)}, ${closure})`;
    body.push(`export const ${stepExport(step.name)} = ${call};`);
  }

  return [
    `import {${worldLabNames.join(', ')}} from 'world-lab';`,
    // Action/query bodies reference members as `WorldLab.<X>` (the same code the
    // domain block generators emit everywhere else), so a namespace import backs
    // them; a purely declarative rule needs only the named imports above.
    ...(hasBehavior ? [`import * as WorldLab from 'world-lab';`] : []),
    ...projectImports.values(),
    '',
    ...body,
    '',
    'export default rule.build();',
    '',
  ].join('\n');
}
