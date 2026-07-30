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
  GameEvent,
  Property,
  PropertyType,
  Query,
  Rule,
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
  /** Rule ids this rule depends on (`requires`). */
  readonly requires: readonly string[];
  readonly traits: readonly TraitMeta[];
  readonly properties: readonly PropertyMeta[];
  readonly actions: readonly ActionMeta[];
  readonly queries: readonly QueryMeta[];
  readonly events: readonly EventMeta[];
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
      traits.push({id: trait.id, name: trait.name, ref: ref(trait)});
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
    return {
      id: rule.id,
      name: rule.name,
      source: 'builtin' as const,
      ref: ref(rule),
      requires: rule.requires.map(r => r.id),
      traits,
      properties,
      actions,
      queries,
      events,
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

/** The type-zero default for a property with no declared default. */
const zeroFor = (type: PropertyType): unknown => {
  switch (type) {
    case 'boolean':
      return false;
    case 'string':
      return '';
    case 'vector':
    case 'point':
      return {x: 0, y: 0};
    default:
      return 0;
  }
};

const PROPERTY_TYPES: ReadonlySet<string> = new Set([
  'number',
  'boolean',
  'string',
  'vector',
  'point',
]);

// One block in a `.rule` workspace's `world_rule` chain.
interface RuleBlock {
  type?: string;
  fields?: Record<string, unknown>;
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
  try {
    const blocks = (JSON.parse(contents) as {blocks?: {blocks?: RuleBlock[]}})
      .blocks?.blocks;
    root = blocks?.find(b => b?.type === 'world_rule');
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
  const ruleId = slug(field(root, 'ID') || ruleName);
  const ref = (exportName: string): MemberRef => ({
    source: 'project',
    exportName,
    modulePath,
  });

  const traits: TraitMeta[] = [];
  const properties: PropertyMeta[] = [];
  const events: EventMeta[] = [];

  for (
    let block: RuleBlock | undefined = root.next?.block;
    block;
    block = block.next?.block
  ) {
    const id = field(block, 'ID');
    const name = field(block, 'NAME') || id;
    if (!id) {
      continue;
    }
    switch (block.type) {
      case 'world_rule_trait':
        traits.push({id, name, ref: ref(`${pascal(id)}Trait`)});
        break;
      case 'world_rule_property': {
        const declared = field(block, 'TYPE');
        const type = (
          PROPERTY_TYPES.has(declared) ? declared : 'number'
        ) as PropertyType;
        const traitId = field(block, 'TRAIT');
        properties.push({
          id,
          name,
          type,
          default: zeroFor(type),
          readonly: false,
          scope: traitId ? 'actor' : 'world',
          ownerTraitId: traitId || undefined,
          ref: ref(`${pascal(id)}Property`),
        });
        break;
      }
      case 'world_rule_event':
        events.push({id, name, ref: ref(`${pascal(id)}Event`)});
        break;
      default:
        break;
    }
  }

  return {
    id: ruleId,
    name: ruleName,
    source: 'project',
    modulePath,
    ref: {source: 'project', exportName: `${pascal(ruleId)}Rule`, modulePath},
    requires: [],
    traits,
    properties,
    actions: [],
    queries: [],
    events,
  };
}
