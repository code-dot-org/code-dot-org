// A plain-data description of a Rule for the Blockly authoring surface — the one
// shape the editor reads to know a project's traits, properties, actions,
// queries and events, and how to reference each in generated code. Built-in
// rules derive it from their live `Rule` objects ({@link builtinRuleMeta});
// project `.rule` files parse it from their workspace JSON (a later step, the
// same way `.actor`/`.world` files are read). So the block generator and the
// trait dropdown can be driven by BOTH sources without importing the engine's
// rule objects directly — the seam that lets rules live in the project.

import type {
  ActionParam,
  ActorAction,
  ArgType,
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

export type RuleSource = 'builtin' | 'project';

/**
 * How generated code names a rule member: `WorldLab.<exportName>` for a built-in,
 * or `import {<exportName>} from '<modulePath>'` for a project rule. Centralizing
 * this on every member lets one generator emit code for either source.
 */
export interface MemberRef {
  readonly source: RuleSource;
  readonly exportName: string;
  /** The project module a `project` member is imported from (absent for built-ins). */
  readonly modulePath?: string;
}

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
}

export interface PropertyMeta {
  readonly id: string;
  readonly name: string;
  readonly type: PropertyType;
  readonly default: unknown;
  readonly readonly: boolean;
  readonly scope: 'world' | 'actor';
  /** The trait that owns an actor-scoped property (absent for world-scoped). */
  readonly ownerTraitId?: string;
  readonly ref: MemberRef;
}

export interface ActionMeta {
  readonly id: string;
  readonly name: string;
  readonly params: readonly ActionParam[];
  readonly scope: 'world' | 'actor';
  readonly ownerTraitId?: string;
  readonly ref: MemberRef;
}

export interface QueryMeta {
  readonly id: string;
  readonly name: string;
  readonly returns?: PropertyType;
  readonly params: readonly ActionParam[];
  readonly scope: 'world' | 'actor';
  readonly ownerTraitId?: string;
  readonly ref: MemberRef;
}

export interface EventMeta {
  readonly id: string;
  readonly name: string;
  readonly ref: MemberRef;
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
  readonly kind: 'free' | 'before' | 'after';
  readonly anchor?: StepAnchor;
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
  readonly name: string;
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
  const ref = (obj: unknown): MemberRef => ({
    source: 'builtin',
    exportName: nameByRef.get(obj) ?? '',
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
    scope: 'world' | 'actor',
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
    scope: 'world' | 'actor',
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
      order: {kind: 'free' as const},
    }));
    return {
      id: rule.id,
      name: rule.name,
      source: 'builtin' as const,
      ref: ownerRef,
      // A rule's dependencies as their `world-lab` export names (what a `use
      // rule` names), so built-in and project requires resolve the same way.
      requires: rule.requires.map(r => ref(r).exportName).filter(name => name),
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
// A `.rule` file is a Blockly workspace (JSON): a `world_rule` root naming the
// rule, chaining member-declaration blocks. We read it STATICALLY — the same way
// `.actor`/`.world` files are read for their names — never executing it, to
// learn the traits/properties/events it declares (its metadata). A project
// rule's members are named in generated code by a fixed convention (PascalCase
// id + kind) that the rule's own module codegen mirrors, so `import`s line up.

/** An identifier from an authored name/id: non-alphanumerics become `_`. */
const slug = (text: string): string => text.replaceAll(/[^A-Za-z0-9_]/g, '_');

/** PascalCase an id for a generated export name (`gravity scale` → `GravityScale`). */
const pascal = (id: string): string =>
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
  extraState?: {params?: ReadonlyArray<{type?: string; var?: string}>};
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
    root = parsed.blocks?.blocks?.find(b => b?.type === 'world_rule');
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

  // The typed parameters a `define action`/`define query` takes come from its
  // params mutator's `extraState` — `{params: [{type, var}]}`, in order. The type
  // is the authored value type; the name is the bound variable's name (resolved
  // via the workspace variable map). The call-site block reads these to build its
  // arg sockets; the runtime signature is built separately (extractRuleBodies).
  const parseParams = (block: RuleBlock): ActionParam[] =>
    (block.extraState?.params ?? []).map(param => ({
      name: (param.var && variableNames.get(param.var)) || 'param',
      type: (param.type ?? 'number') as ArgType,
    }));
  const ruleName = field(root, 'NAME') || 'Rule';
  const ref = (exportName: string): MemberRef => ({
    source: 'project',
    exportName,
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
  const addProperty = (block: RuleBlock, ownerTraitId?: string): void => {
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
      readonly: false,
      scope: ownerTraitId ? 'actor' : 'world',
      ownerTraitId,
      ref: ref(`${pascal(name)}Property`),
    });
  };

  // A `define action` block → an ActionMeta (world at the rule level, actor
  // inside a trait). The imperative body is not read here — metadata is static;
  // the body is generated separately by the Blockly generator (extractRuleBodies)
  // and keyed back by {@link ruleBodyKey}. Its params (name + type) drive the
  // call-site block's arg sockets.
  const addAction = (block: RuleBlock, ownerTraitId?: string): void => {
    const name = field(block, 'NAME');
    if (!name) {
      return;
    }
    actions.push({
      id: slug(name),
      name,
      params: parseParams(block),
      scope: ownerTraitId ? 'actor' : 'world',
      ownerTraitId,
      ref: ref(`${pascal(name)}Action`),
    });
  };

  // A `define query` block → a QueryMeta. Its `TYPE` field is the value it
  // reports (the reporter block's output socket); the body (a `return`) is
  // generated separately, like an action's.
  const addQuery = (block: RuleBlock, ownerTraitId?: string): void => {
    const name = field(block, 'NAME');
    if (!name) {
      return;
    }
    const declared = field(block, 'TYPE');
    const returns = (
      QUERY_RETURN_TYPES.has(declared) ? declared : 'boolean'
    ) as PropertyType;
    queries.push({
      id: slug(name),
      name,
      returns,
      params: parseParams(block),
      scope: ownerTraitId ? 'actor' : 'world',
      ownerTraitId,
      ref: ref(`${pascal(name)}Query`),
    });
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
    const ownerRef: MemberRef = owner.includes('/')
      ? {source: 'project', exportName: '', modulePath: owner}
      : {source: 'builtin', exportName: owner};
    return {ownerRef, stepId};
  };
  const addStep = (block: RuleBlock): void => {
    const name = field(block, 'NAME');
    if (!name) {
      return;
    }
    const kind = field(block, 'ORDER'); // 'free' | 'before' | 'after'
    const anchor =
      kind === 'before' || kind === 'after'
        ? stepAnchor(field(block, 'STEP'))
        : undefined;
    const order: StepOrderMeta = anchor
      ? {kind: kind as 'before' | 'after', anchor}
      : {kind: 'free'};
    steps.push({id: slug(name), name, ownerRef: selfRef, order});
  };

  // The rule's top-level chain: `use rule` dependencies, world properties, traits.
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
    } else if (block.type === 'world_rule_action') {
      addAction(block);
    } else if (block.type === 'world_rule_query') {
      addQuery(block);
    } else if (block.type === 'world_rule_step') {
      addStep(block);
    } else if (block.type === 'world_rule_trait') {
      const name = field(block, 'NAME');
      if (!name) {
        continue;
      }
      const traitId = slug(name);
      // The trait's `do` body: `use trait` dependencies, actor properties, events.
      const traitRequires: string[] = [];
      for (
        let member: RuleBlock | undefined = block.inputs?.DO?.block;
        member;
        member = member.next?.block
      ) {
        if (member.type === 'world_use_trait') {
          const dep = field(member, 'TRAIT');
          if (dep) {
            traitRequires.push(dep);
          }
        } else if (member.type === 'world_rule_property') {
          addProperty(member, traitId);
        } else if (member.type === 'world_rule_action') {
          addAction(member, traitId);
        } else if (member.type === 'world_rule_query') {
          addQuery(member, traitId);
        } else if (member.type === 'world_rule_event') {
          const eventName = field(member, 'NAME');
          if (eventName) {
            events.push({
              id: slug(eventName),
              name: eventName,
              ref: ref(`${pascal(eventName)}Event`),
            });
          }
        }
      }
      traits.push({
        id: traitId,
        name,
        ref: ref(`${pascal(name)}Trait`),
        requires: traitRequires,
      });
    }
  }

  return {
    id: slug(ruleName),
    name: ruleName,
    source: 'project',
    modulePath,
    ref: selfRef,
    requires,
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
// Blockly generator, which `parseRuleMeta` deliberately avoids, so body codegen
// lives here as a separate pass ({@link extractRuleBodies}) run by the headless
// generator. Each body is keyed by the member it belongs to ({@link ruleBodyKey})
// so `ruleMetaToModule` can splice it into that member's `addAction`/`addQuery`.

/** A member's body key: the scope, owning trait (if any), kind, and id. */
export const ruleBodyKey = (
  kind: 'action' | 'query' | 'step',
  scope: 'world' | 'actor',
  ownerTraitId: string | undefined,
  id: string,
): string => `${kind}:${scope}:${ownerTraitId ?? ''}:${id}`;

/** The minimal live-block surface {@link extractRuleBodies} walks. */
interface LiveBlock {
  type: string;
  getFieldValue(name: string): string | null;
  getNextBlock(): LiveBlock | null;
  getInputTargetBlock(name: string): LiveBlock | null;
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
  body: (block: LiveBlock) => string;
  signature: (block: LiveBlock) => readonly string[];
}

/**
 * Walk a loaded `.rule` workspace's `world_rule` root and generate the body and
 * parameter signature of every `define action` / `define query`, keyed by {@link
 * ruleBodyKey}. Mirrors `parseRuleMeta`'s structural walk (scope by trait
 * nesting) but over live blocks, so `gen` can run `statementToCode` on each
 * member's `DO` input and read its params from the mutator.
 */
export function extractRuleBodies(
  ruleRoot: LiveBlock,
  gen: RuleBodyGen,
): Map<string, RuleBody> {
  const bodies = new Map<string, RuleBody>();
  const record = (
    kind: 'action' | 'query' | 'step',
    scope: 'world' | 'actor',
    ownerTraitId: string | undefined,
    member: LiveBlock,
  ): void => {
    const id = slug(member.getFieldValue('NAME') ?? '');
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
    scope: 'world' | 'actor',
    ownerTraitId: string | undefined,
  ): void => {
    for (let block = first; block; block = block.getNextBlock()) {
      if (block.type === 'world_rule_action') {
        record('action', scope, ownerTraitId, block);
      } else if (block.type === 'world_rule_query') {
        record('query', scope, ownerTraitId, block);
      } else if (block.type === 'world_rule_step') {
        // Steps are world-scoped (rule level), run per tick.
        record('step', 'world', undefined, block);
      } else if (block.type === 'world_rule_trait') {
        const traitId = slug(block.getFieldValue('NAME') ?? '');
        // Actions/queries in a trait's `do` are actor-scoped, owned by the trait.
        visit(block.getInputTargetBlock('DO'), 'actor', traitId);
      }
    }
  };
  visit(ruleRoot.getNextBlock(), 'world', undefined);
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
  const projectImports = new Map<string, string>(); // dedupe key → import line

  // A default-import identifier for a project rule module (`rules/wind` → `Wind`).
  const moduleVar = (path: string): string =>
    pascal(path.split('/').pop() ?? path) || 'Rule';

  // A rule dependency (`use rule` value) → its code reference: a built-in export
  // (named from `world-lab`) or a project rule (default import from its module).
  const ruleDepRef = (dep: string): string => {
    if (dep.includes('/')) {
      const varName = moduleVar(dep);
      projectImports.set(`default:${dep}`, `import ${varName} from ${q(dep)};`);
      return varName;
    }
    addWorldLab(dep);
    return dep;
  };

  // A trait dependency (`use trait` value) → its code reference: a built-in trait
  // (named from `world-lab`) or a project trait (`<module>#<export>`, named).
  const traitDepRef = (dep: string): string => {
    const hash = dep.indexOf('#');
    if (hash >= 0) {
      const modulePath = dep.slice(0, hash);
      const exportName = dep.slice(hash + 1);
      projectImports.set(
        `named:${modulePath}:${exportName}`,
        `import {${exportName}} from ${q(modulePath)};`,
      );
      return exportName;
    }
    addWorldLab(dep);
    return dep;
  };

  // A step-ordering ANCHOR → the code that names that step: a built-in rule's is
  // `WorldLab.<Rule>.steps[<id>]`; a project rule's default-imports the module and
  // reads `<Rule>.steps[<id>]`. (The anchored rule must be in play — the learner's
  // `use rule` ensures it — for the constraint to take effect.)
  const stepAnchorRef = (anchor: StepAnchor): string => {
    const owner = anchor.ownerRef;
    const at = `.steps[${q(anchor.stepId)}]`;
    if (owner.source === 'project' && owner.modulePath) {
      const varName = moduleVar(owner.modulePath);
      projectImports.set(
        `default:${owner.modulePath}`,
        `import ${varName} from ${q(owner.modulePath)};`,
      );
      return `${varName}${at}`;
    }
    return `WorldLab.${owner.exportName}${at}`;
  };

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
      property.scope === 'actor' && property.ownerTraitId
        ? traitExportById.get(property.ownerTraitId)
        : undefined;
    const target = owner ?? 'rule';
    body.push(
      `export const ${property.ref.exportName} = ${target}.addProperty(${q(property.id)}, ${q(property.type)}, ${defaultLiteral(property)}, {name: ${q(property.name)}});`,
    );
  }

  // Actions and queries carry an imperative body (from `bodies`, else empty). An
  // actor-scoped member is added to its owning trait and its closure takes the
  // `actor`; a world-scoped one is added to the rule and takes the `world`. The
  // body is a real function body — its `return` (queries) works as written. Any
  // parameters follow the subject in the signature — the body extractor resolved
  // them to the same identifiers the body's getters read.
  const memberTarget = (member: {
    scope: 'world' | 'actor';
    ownerTraitId?: string;
  }): string =>
    (member.scope === 'actor' && member.ownerTraitId
      ? traitExportById.get(member.ownerTraitId)
      : undefined) ?? 'rule';
  const subject = (member: {scope: 'world' | 'actor'}): string =>
    member.scope === 'actor' ? 'actor' : 'world';
  // The closure's argument list: the subject, then each parameter identifier.
  const signature = (member: {scope: 'world' | 'actor'}, code?: RuleBody) =>
    [subject(member), ...(code?.params ?? [])].join(', ');

  for (const action of meta.actions) {
    const code = bodies.get(
      ruleBodyKey('action', action.scope, action.ownerTraitId, action.id),
    );
    body.push(
      `export const ${action.ref.exportName} = ${memberTarget(action)}.addAction(${q(action.id)}, (${signature(action, code)}) => {\n${code?.body ?? ''}}, {name: ${q(action.name)}});`,
    );
  }

  for (const query of meta.queries) {
    const code = bodies.get(
      ruleBodyKey('query', query.scope, query.ownerTraitId, query.id),
    );
    body.push(
      `export const ${query.ref.exportName} = ${memberTarget(query)}.addQuery(${q(query.id)}, (${signature(query, code)}) => {\n${code?.body ?? ''}}, {name: ${q(query.name)}, returns: ${q(query.returns ?? 'boolean')}});`,
    );
  }

  for (const event of meta.events) {
    body.push(
      `export const ${event.ref.exportName} = rule.addEvent(${q(event.id)}, {name: ${q(event.name)}});`,
    );
  }

  // Steps — the rule's per-tick behavior. Each runs with `(world, delta)` bound;
  // ordering picks the builder method (free / before / after an anchor step).
  for (const step of meta.steps) {
    const code = bodies.get(ruleBodyKey('step', 'world', undefined, step.id));
    const closure = `(world, delta) => {\n${code?.body ?? ''}}`;
    const {kind, anchor} = step.order;
    const call =
      (kind === 'before' || kind === 'after') && anchor
        ? `rule.addStep${kind === 'before' ? 'Before' : 'After'}(${q(step.id)}, ${stepAnchorRef(anchor)}, ${closure})`
        : `rule.addStep(${q(step.id)}, ${closure})`;
    body.push(`export const ${pascal(step.name)}Step = ${call};`);
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
