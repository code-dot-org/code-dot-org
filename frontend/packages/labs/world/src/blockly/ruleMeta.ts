// A plain-data description of a Rule for the Blockly authoring surface — the one
// shape the editor reads to know a project's traits, properties, actions,
// queries and events, and how to reference each in generated code. Built-in
// rules derive it from their live `Rule` objects ({@link builtinRuleMeta});
// project `.rule` files parse it from their workspace JSON (a later step, the
// same way `.actor`/`.world` files are read). So the block generator and the
// trait dropdown can be driven by BOTH sources without importing the engine's
// rule objects directly — the seam that lets rules live in the project.

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

import type {ParamType, EnumMeta} from './enums';
import {
  refFromValue,
  refModule,
  ruleByName,
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
   * the behaviour those files already had.
   */
  readonly subject: 'actor' | 'camera';
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
  | {readonly kind: 'param'; readonly name: string; readonly type: ParamType};

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
}

export interface ActionMeta {
  readonly id: string;
  readonly name: string;
  readonly params: readonly EditorParam[];
  /** The designed signature, when `define block` made this. */
  readonly parts?: readonly MemberPart[];
  /** The author's one-line explanation — the call-site block's tooltip. */
  readonly description?: string;
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
   * What a rule says instead of naming a neighbour. Held as a plain id rather
   * than a `PhaseId` so a `.rule` written against a phase list that has since
   * changed still parses; the Scheduler leaves an unknown one unordered.
   */
  readonly phase?: string;
  /** Inside that moment, or in the gap on either side. Absent reads as `during`. */
  readonly when?: 'before' | 'during' | 'after';
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
   * subject that has it, with that subject bound — which is what four of the
   * seven stock steps open by doing for themselves, in a `for each … where has
   * trait ⟨my own trait⟩` that says nothing the declaration site does not.
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
  /**
   * Named sets of choices this rule declares (`define choices`).
   *
   * Not members: nothing generated names one, and the engine never hears about
   * them (specs/ENUMS.md). They are here because a `.rule` is where one is
   * written, and the editor reads a project's rules to learn what it has.
   */
  readonly enums: readonly EnumMeta[];
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
    const events: EventMeta[] = Object.values(rule.events).map(
      (e: GameEvent) => ({id: e.id, name: e.name ?? e.id, ref: ref(e)}),
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
      // The engine's own enums are not a rule's (`Engine#Key` belongs to the
      // World, which owns the keyboard); they are declared in `blockly/enums`.
      enums: [],
    };
  });
}

// ── Declarative `.rule` files ────────────────────────────────────────────────
// A `.rule` file is a Blockly workspace (JSON): a `world_rule` root naming the
// rule, chaining member-declaration blocks. We read it STATICALLY — the same way
// `.actor`/`.world` files are read for their names — never executing it, to
// learn the traits/properties/events it declares (its metadata). A project
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
const slug = (text: string): string => text.replaceAll(/[^A-Za-z0-9_]/g, '_');

/** PascalCase an id for a generated export name (`gravity scale` → `GravityScale`). */
/** `actor to follow` → `ActorToFollow`; how a member's export name is built. */
export const pascal = (id: string): string =>
  id
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const PROPERTY_TYPES: ReadonlySet<string> = new Set([
  'number',
  'boolean',
  'string',
  'vector',
  'point',
  // What a rule works out about who is where (specs/COLLISION.md). Not offered
  // as a query's return type below: a query reports a single value, and this is
  // one or many.
  'actors',
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
const parseDefault = (text: string, type: PropertyType): unknown => {
  switch (type) {
    // No actors. There is no other sensible starting value for a set a rule
    // works out each tick, and no text a learner could type that would be one.
    case 'actors':
      return [];
    case 'boolean':
      return text.trim().toLowerCase() === 'true';
    case 'string':
      return text;
    case 'vector':
    case 'point': {
      const [x, y] = text.split(',').map(part => Number(part.trim()));
      return {x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0};
    }
    default: {
      const n = Number(text);
      return Number.isFinite(n) ? n : 0;
    }
  }
};

// One block in a `.rule` workspace: a `world_rule` chain, or a `define trait`'s
// `do` body (its `inputs.DO`). An action/query block also carries the params
// mutator's `extraState` (its parameter list).
interface RuleBlock {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: RuleBlock}>;
  extraState?: {
    params?: ReadonlyArray<{type?: string; var?: string}>;
    /** `world_rule_block`'s designed signature (blockDesigner). */
    parts?: ReadonlyArray<{
      kind?: string;
      text?: string;
      type?: string;
      var?: string;
    }>;
  };
  next?: {block?: RuleBlock};
}

/**
 * Parse a `.rule` workspace JSON into {@link RuleMeta} (or `undefined` if it is
 * not a `world_rule` workspace / not valid JSON yet). `modulePath` is the
 * extension-less path the generated code imports the rule and its members from
 * (`rules/wind`). The declared members become `project` refs into that module.
 */
export function parseRuleMeta(
  modulePath: string,
  contents: string,
): RuleMeta | undefined {
  let root: RuleBlock | undefined;
  let traitRoots: RuleBlock[] = [];
  let stepRoots: RuleBlock[] = [];
  let enumRoots: RuleBlock[] = [];
  // A `.rule`'s parameter names live in the workspace variable map (a param
  // block's VAR field is a variable id); resolve id → name to label params.
  const variableNames = new Map<string, string>();
  try {
    const parsed = JSON.parse(contents) as {
      blocks?: {blocks?: RuleBlock[]};
      variables?: ReadonlyArray<{id?: string; name?: string}>;
    };
    for (const variable of parsed.variables ?? []) {
      if (variable.id) {
        variableNames.set(variable.id, variable.name ?? variable.id);
      }
    }
    const tops = parsed.blocks?.blocks ?? [];
    root = tops.find(b => b?.type === 'world_rule');
    // Traits are top blocks beside the rule, not chained inside it — one `.rule`
    // declares one rule, so every trait in the file belongs to it.
    traitRoots = tops.filter(b => b?.type === 'world_rule_trait');
    stepRoots = tops.filter(b => b?.type?.startsWith('world_rule_step'));
    enumRoots = tops.filter(b => b?.type === 'world_rule_enum');
  } catch {
    return undefined; // mid-edit / not JSON
  }
  if (!root) {
    return undefined;
  }

  const field = (block: RuleBlock, name: string): string =>
    typeof block.fields?.[name] === 'string'
      ? (block.fields[name] as string)
      : '';

  const ruleName = field(root, 'NAME') || 'Rule';
  // What using it gives a world. Absent on a rule authored before the field
  // existed, and on one whose two readings are the same word.
  const ability = field(root, 'ABILITY') || ruleName;
  const ref = (exportName: string): MemberRef => ({
    source: 'project',
    exportName,
    ruleName,
    modulePath,
  });
  // This rule's own ref — the owner of steps it declares (an anchor target).
  const selfRef: MemberRef = ref(`${pascal(ruleName)}Rule`);

  const traits: TraitMeta[] = [];
  const properties: PropertyMeta[] = [];
  const actions: ActionMeta[] = [];
  const queries: QueryMeta[] = [];
  const events: EventMeta[] = [];
  const steps: StepMeta[] = [];
  // Dependencies: `use rule` blocks in the rule body name the rules this one
  // requires — a built-in export name or a project module path, exactly as a
  // world's `use rule` names them (resolved by the same seam).
  const requires: string[] = [];

  // A `define property` block → a PropertyMeta. World-scoped at the rule level;
  // actor-scoped (owned by `ownerTraitId`) inside a `define trait`'s `do`.
  const addProperty = (
    block: RuleBlock,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void => {
    const name = field(block, 'NAME');
    if (!name) {
      return;
    }
    const declared = field(block, 'TYPE');
    const type = (
      PROPERTY_TYPES.has(declared) ? declared : 'number'
    ) as PropertyType;
    properties.push({
      id: slug(name),
      name,
      type,
      default: parseDefault(field(block, 'DEFAULT'), type),
      // Absent on a workspace saved before the field existed, which reads as
      // writable — the behaviour those files already had.
      readonly: field(block, 'ACCESS') === 'readonly',
      scope: ownerTraitId ? ownerSubject : 'world',
      ownerTraitId,
      ref: ref(`${pascal(name)}Property`),
    });
  };

  // A `define event` block → an EventMeta. Declared at rule level or under a
  // trait; both produce a rule-level event.
  /**
   * A `define event` → the event, and the phrasing of the hat it makes.
   *
   * Designed like a block (`extraState.parts`), and named by its labels joined,
   * so "%1 is pressed" is the event `is pressed` with one choice to filter on.
   */
  const addEvent = (block: RuleBlock): void => {
    const raw = block.extraState?.parts ?? [];
    const parts: MemberPart[] = raw.flatMap((part): MemberPart[] => {
      if (part.kind === 'param') {
        return [
          {
            kind: 'param',
            name: (part.var && variableNames.get(part.var)) || 'choice',
            type: (part.type ?? 'string') as ParamType,
          },
        ];
      }
      return part.text ? [{kind: 'label', text: part.text}] : [];
    });
    const name = designedName(raw);
    if (!name) {
      return;
    }
    events.push({
      id: slug(name),
      name,
      ref: ref(`${pascal(name)}Event`),
      ...(parts.length > 0 ? {parts} : {}),
    });
  };

  /**
   * A `define block` → an action or a query, decided by its RETURNS field.
   *
   * Its name is the wording of its labels joined; its params are the parameter
   * parts, in order. The parts are kept as well, so the call-site block can be
   * built in the arrangement that was designed rather than name-then-arguments.
   */
  const addDesignedBlock = (
    block: RuleBlock,
    ownerTraitId?: string,
    ownerSubject: 'actor' | 'camera' = 'actor',
  ): void => {
    const raw = block.extraState?.parts ?? [];
    const parts: MemberPart[] = raw.flatMap((part): MemberPart[] => {
      if (part.kind === 'param') {
        return [
          {
            kind: 'param',
            name: (part.var && variableNames.get(part.var)) || 'value',
            type: (part.type ?? 'number') as ParamType,
          },
        ];
      }
      return part.text ? [{kind: 'label', text: part.text}] : [];
    });
    const name = designedName(raw);
    if (!name) {
      return;
    }
    const params = parts
      .filter(
        (part): part is {kind: 'param'; name: string; type: ParamType} =>
          part.kind === 'param',
      )
      .map(part => ({name: part.name, type: part.type}));
    const returns = field(block, 'RETURNS');
    const common = {
      id: slug(name),
      name,
      params,
      parts,
      description: field(block, 'DESCRIPTION') || undefined,
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

  // A `define step` block → a StepMeta. Its ordering: the `ORDER` dropdown
  // (unordered/before/after) and, when anchored, the `STEP` dropdown's value —
  // an anchor `<owner>#<stepId>` where `owner` is a built-in rule export name or
  // a project rule module path (matching the trait dropdown's encoding).
  const stepAnchor = (value: string): StepAnchor | undefined => {
    const hash = value.lastIndexOf('#');
    if (hash < 0) {
      return undefined;
    }
    const owner = value.slice(0, hash);
    const stepId = value.slice(hash + 1);
    if (!owner || !stepId) {
      return undefined;
    }
    // `owner` is a rule NAME. Which rule that is — engine or project, and if a
    // project one, in which file — is the registry's business at generate time.
    const owned = ruleByName(owner);
    const ownerRef: MemberRef = {
      source: owned?.source ?? 'project',
      exportName: owned?.ref.exportName ?? '',
      ruleName: owner,
      modulePath: owned?.modulePath,
    };
    return {ownerRef, stepId};
  };
  /**
   * A step root → a StepMeta. Its ordering is the BLOCK TYPE, not a field:
   * `when tick` is unordered, `before`/`after` carry the anchor dropdown.
   */
  /**
   * Where a phased step sits relative to its moment.
   *
   * Absent reads as `during`, which is what a block saved before the field
   * existed meant and what an unset dropdown means.
   */
  const stepWhen = (block: RuleBlock): 'before' | 'during' | 'after' => {
    const when = field(block, 'WHEN');
    return when === 'before' || when === 'after' ? when : 'during';
  };

  const STEP_KIND: Record<string, StepOrderMeta['kind']> = {
    world_rule_step_tick: 'free',
    world_rule_step_before: 'before',
    world_rule_step_after: 'after',
    world_rule_step_in: 'phase',
  };
  const addStep = (block: RuleBlock): void => {
    const name = field(block, 'NAME');
    const kind = STEP_KIND[block.type ?? ''];
    if (!name || !kind) {
      return;
    }
    if (kind === 'phase') {
      const phase = field(block, 'PHASE');
      steps.push({
        id: slug(name),
        name,
        ownerRef: selfRef,
        scope: 'world',
        order: phase ? {kind, phase, when: stepWhen(block)} : {kind: 'free'},
      });
      return;
    }
    const anchor =
      kind === 'free' ? undefined : stepAnchor(field(block, 'STEP'));
    const order: StepOrderMeta = anchor ? {kind, anchor} : {kind: 'free'};
    steps.push({
      id: slug(name),
      name,
      ownerRef: selfRef,
      scope: 'world',
      order,
    });
  };

  /**
   * A step declared under a trait: it runs for each subject that has it.
   *
   * Always phased. A trait's step is saying what KIND of work it does — a
   * camera trait that clamps the view runs in `confine` — and the phases it is
   * offered are the ones its subject takes part in, so there is no neighbour
   * for it to name and no dropdown of every step in the project to pick from.
   */
  const addTraitStep = (
    block: RuleBlock,
    ownerTraitId: string,
    ownerSubject: 'actor' | 'camera',
  ): void => {
    const name = field(block, 'NAME');
    if (!name) {
      return;
    }
    const phase = field(block, 'PHASE');
    steps.push({
      id: slug(name),
      name,
      ownerRef: selfRef,
      scope: ownerSubject,
      ownerTraitId,
      order: phase
        ? {kind: 'phase', phase, when: stepWhen(block)}
        : {kind: 'free'},
    });
  };

  // The rule's own chain: `use rule` dependencies and its world-scoped members.
  // Traits are separate roots, handled below.
  for (
    let block: RuleBlock | undefined = root.next?.block;
    block;
    block = block.next?.block
  ) {
    if (block.type === 'world_use_rule') {
      const dep = field(block, 'RULE');
      if (dep) {
        requires.push(dep);
      }
    } else if (block.type === 'world_rule_property') {
      addProperty(block);
    } else if (block.type === 'world_rule_block') {
      addDesignedBlock(block);
    } else if (block.type === 'world_rule_event') {
      // A rule may declare an event with no trait to hang it on — the keyboard
      // rule's key events belong to the WORLD, not to a kind of actor. Events
      // are rule-level either way (`rule.addEvent`); chaining one under a trait
      // says which actors it is about, not who owns it.
      addEvent(block);
    }
  }

  // Steps are roots too: an event hat per tick, with its body chained below.
  for (const stepBlock of stepRoots) {
    addStep(stepBlock);
  }

  // A set of choices: the root names it, the blocks below it are the choices.
  // A word is both what a learner reads and what the block emits, so no
  // translation table and no way for the two to disagree. An empty set is kept
  // — a learner types the name before the options, and a set that vanished
  // between keystrokes would take the dropdowns using it with it.
  const enums: EnumMeta[] = [];
  for (const enumBlock of enumRoots) {
    const name = field(enumBlock, 'NAME');
    if (!name) {
      continue;
    }
    const options: Array<readonly [string, string]> = [];
    for (
      let block: RuleBlock | undefined = enumBlock.next?.block;
      block;
      block = block.next?.block
    ) {
      if (block.type !== 'world_rule_enum_option') {
        continue;
      }
      const word = field(block, 'NAME');
      if (word && !options.some(([, value]) => value === word)) {
        options.push([word, word]);
      }
    }
    enums.push({owner: ruleName, name, options});
  }

  // Each trait root, and the chain of members below it.
  for (const traitBlock of traitRoots) {
    const name = field(traitBlock, 'NAME');
    if (!name) {
      continue;
    }
    const traitId = slug(name);
    // What elects it. Absent on a trait saved before the field existed, which
    // reads as `actor` — the behaviour those files already had.
    const subject: 'actor' | 'camera' =
      field(traitBlock, 'SUBJECT') === 'camera' ? 'camera' : 'actor';
    const traitRequires: string[] = [];
    for (
      let member: RuleBlock | undefined = traitBlock.next?.block;
      member;
      member = member.next?.block
    ) {
      if (member.type === 'world_use_trait') {
        const dep = field(member, 'TRAIT');
        if (dep) {
          traitRequires.push(dep);
        }
      } else if (member.type === 'world_rule_property') {
        addProperty(member, traitId, subject);
      } else if (member.type === 'world_rule_block') {
        addDesignedBlock(member, traitId, subject);
      } else if (member.type === 'world_trait_step') {
        addTraitStep(member, traitId, subject);
      } else if (member.type === 'world_rule_event') {
        addEvent(member);
      }
    }
    traits.push({
      id: traitId,
      name,
      ref: ref(`${pascal(name)}Trait`),
      requires: traitRequires,
      subject,
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
    // `undefined`, and the project dies reading `.id` of it. The dropdown does
    // not offer it (editingRule), so this is for a file that already holds one.
    requires: requires.filter(dep => dep !== ruleName),
    traits,
    properties,
    actions,
    queries,
    events,
    steps,
    enums,
  };
}

// ── Action / query bodies ────────────────────────────────────────────────────
// The metadata above is static (no execution), but an action's `do` and a
// query's `do` (ending in a `return`) are IMPERATIVE — real code, generated from
// the body blocks the same way an event handler's body is. That needs a live
// Blockly generator, which `parseRuleMeta` deliberately avoids, so body codegen
// lives here as a separate pass ({@link extractRuleBodies}) run by the headless
// generator. Each body is keyed by the member it belongs to ({@link ruleBodyKey})
// so `ruleMetaToModule` can splice it into that member's `addAction`/`addQuery`.

/** A member's body key: the scope, owning trait (if any), kind, and id. */
export const ruleBodyKey = (
  kind: 'action' | 'query' | 'step',
  scope: MemberScope,
  ownerTraitId: string | undefined,
  id: string,
): string => `${kind}:${scope}:${ownerTraitId ?? ''}:${id}`;

/** The minimal live-block surface {@link extractRuleBodies} walks. */
interface LiveBlock {
  type: string;
  getFieldValue(name: string): string | null;
  getNextBlock(): LiveBlock | null;
  getInputTargetBlock(name: string): LiveBlock | null;
  /** A mutator's serialized state, when the block has one. */
  saveExtraState?: () => {
    parts?: ReadonlyArray<{kind?: string; text?: string}>;
  };
}

/** The generated closure of one action/query: its parameter identifiers (in
 * order, after the `world`/`actor` subject) and its statement body. */
export interface RuleBody {
  readonly params: readonly string[];
  readonly body: string;
}

/**
 * How {@link extractRuleBodies} turns a member's live blocks into code. `body`
 * generates the `DO` statement input; `signature` returns the member's parameter
 * identifiers, in order (its mutator's variables mapped through `getVariableName`),
 * so the closure signature and the body's getters agree.
 */
export interface RuleBodyGen {
  /** The member's `DO` statement input — an action's or a query's body. */
  body: (block: LiveBlock) => string;
  /** The chain BELOW a root — a step's body, which is an event hat's. */
  chainBody: (block: LiveBlock) => string;
  signature: (block: LiveBlock) => readonly string[];
}

/**
 * Generate the body and parameter signature of every `define block` and
 * `define step` in a loaded `.rule` workspace, keyed by {@link ruleBodyKey}.
 *
 * Takes the workspace's TOP BLOCKS rather than the rule root, because a trait
 * is a root of its own: its members chain below it, beside the rule rather than
 * inside it. Mirrors `parseRuleMeta`'s walk, over live blocks, so `gen` can run
 * `statementToCode` on each member's `DO` input and read its params.
 */
export function extractRuleBodies(
  roots: readonly LiveBlock[],
  gen: RuleBodyGen,
): Map<string, RuleBody> {
  const bodies = new Map<string, RuleBody>();
  const record = (
    kind: 'action' | 'query' | 'step',
    scope: MemberScope,
    ownerTraitId: string | undefined,
    member: LiveBlock,
    /** For a member with no NAME field, the id derived some other way. */
    explicitId?: string,
  ): void => {
    const id = explicitId ?? slug(member.getFieldValue('NAME') ?? '');
    if (id) {
      bodies.set(ruleBodyKey(kind, scope, ownerTraitId, id), {
        // A step takes no user params (its closure is `(world, delta)`).
        params: kind === 'step' ? [] : [...gen.signature(member)],
        body: gen.body(member),
      });
    }
  };
  const visit = (
    first: LiveBlock | null,
    scope: MemberScope,
    ownerTraitId: string | undefined,
  ): void => {
    for (let block = first; block; block = block.getNextBlock()) {
      if (block.type === 'world_rule_block') {
        // Whichever it is, the body is generated the same way; the RETURNS
        // field decides which key it is filed under. Its id comes from the
        // designed wording, not a NAME field — it has none.
        const returns = block.getFieldValue('RETURNS');
        record(
          returns && returns !== 'none' ? 'query' : 'action',
          scope,
          ownerTraitId,
          block,
          slug(designedName(block.saveExtraState?.()?.parts)),
        );
      } else if (block.type === 'world_trait_step') {
        // A step declared under a trait, so it carries the trait's scope and
        // owner — that is what the generator keys the body by, and what tells
        // it whether the loop it wraps the body in walks actors or cameras.
        //
        // Its body is a `DO` mouth, not the chain below it: a trait's members
        // chain through `next`, so a hat's shape was not available here.
        record('step', scope, ownerTraitId, block);
      }
    }
  };
  for (const root of roots) {
    if (root.type?.startsWith('world_rule_step')) {
      // A step's body is the chain BELOW it, not a `DO` input — it is an event
      // hat, so what follows it is what runs.
      const id = slug(root.getFieldValue('NAME') ?? '');
      if (id) {
        bodies.set(ruleBodyKey('step', 'world', undefined, id), {
          params: [],
          body: gen.chainBody(root),
        });
      }
    } else if (root.type === 'world_rule') {
      visit(root.getNextBlock(), 'world', undefined);
    } else if (root.type === 'world_rule_trait') {
      // A trait's members belong to whatever elects it — an actor, or a camera
      // (`TraitMeta.subject`). That decides what their bodies call the subject,
      // so it has to be known here as well as at parse time.
      visit(
        root.getNextBlock(),
        root.getFieldValue('SUBJECT') === 'camera' ? 'camera' : 'actor',
        slug(root.getFieldValue('NAME') ?? ''),
      );
    }
  }
  return bodies;
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
    case 'boolean':
      return value ? 'true' : 'false';
    case 'string':
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
      addProjectImport(
        `named:${modulePath}:${ref.exportName}`,
        `import {${ref.exportName}} from ${q(modulePath)};`,
      );
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
      `export const ${trait.ref.exportName} = rule.addTrait({id: ${q(trait.id)}, name: ${q(trait.name)}});`,
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
    // thing bound — the `for each … where has trait ⟨mine⟩` four of the seven
    // stock steps open by writing out, supplied here instead. No `const world`
    // preamble: unlike an action's, a step's closure already has one.
    const traitExport = step.ownerTraitId
      ? traitExportById.get(step.ownerTraitId)
      : undefined;
    const scoped = step.scope !== 'world' && traitExport;
    const inner = code?.body ?? '';
    const run = scoped
      ? `for (const ${step.scope} of world.${
          step.scope === 'camera' ? 'cameras' : 'actors'
        }.with(${traitExport})) {\n${inner}}\n`
      : inner;
    const closure = `(world, delta) => {\n${run}}`;
    const {kind, phase} = step.order;
    const inPhase =
      step.order.when === 'before'
        ? 'BeforePhase'
        : step.order.when === 'after'
          ? 'AfterPhase'
          : 'In';
    const call =
      kind === 'phase' && phase
        ? `rule.addStep${inPhase}(${q(step.id)}, ${q(phase)}, ${closure})`
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
