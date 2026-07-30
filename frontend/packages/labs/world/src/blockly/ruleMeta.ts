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

const PROPERTY_TYPES: ReadonlySet<string> = new Set([
  'number',
  'boolean',
  'string',
  'vector',
  'point',
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
// `do` body (its `inputs.DO`).
interface RuleBlock {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: RuleBlock}>;
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
  const ref = (exportName: string): MemberRef => ({
    source: 'project',
    exportName,
    modulePath,
  });

  const traits: TraitMeta[] = [];
  const properties: PropertyMeta[] = [];
  const events: EventMeta[] = [];

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

  // The rule's top-level chain: world properties and traits.
  for (
    let block: RuleBlock | undefined = root.next?.block;
    block;
    block = block.next?.block
  ) {
    if (block.type === 'world_rule_property') {
      addProperty(block);
    } else if (block.type === 'world_rule_trait') {
      const name = field(block, 'NAME');
      if (!name) {
        continue;
      }
      const traitId = slug(name);
      traits.push({id: traitId, name, ref: ref(`${pascal(name)}Trait`)});
      // The trait's `do` body: its actor properties and events.
      for (
        let member: RuleBlock | undefined = block.inputs?.DO?.block;
        member;
        member = member.next?.block
      ) {
        if (member.type === 'world_rule_property') {
          addProperty(member, traitId);
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
    }
  }

  return {
    id: slug(ruleName),
    name: ruleName,
    source: 'project',
    modulePath,
    ref: {source: 'project', exportName: `${pascal(ruleName)}Rule`, modulePath},
    requires: [],
    traits,
    properties,
    actions: [],
    queries: [],
    events,
  };
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

/** Generate the `world-lab` RuleBuilder module for a project rule's metadata. */
export function ruleMetaToModule(meta: RuleMeta): string {
  const q = (value: string): string => JSON.stringify(value);
  const needsVector = meta.properties.some(
    p => p.type === 'vector' || p.type === 'point',
  );
  const lines: string[] = [
    `import {RuleBuilder${needsVector ? ', Vector' : ''}} from 'world-lab';`,
    '',
    `const rule = new RuleBuilder({id: ${q(meta.id)}, name: ${q(meta.name)}});`,
  ];

  // Traits first, so an actor-scoped property can attach to its trait below.
  const traitExportById = new Map<string, string>();
  for (const trait of meta.traits) {
    traitExportById.set(trait.id, trait.ref.exportName);
    lines.push(
      `export const ${trait.ref.exportName} = rule.addTrait({id: ${q(trait.id)}, name: ${q(trait.name)}});`,
    );
  }

  for (const property of meta.properties) {
    const owner =
      property.scope === 'actor' && property.ownerTraitId
        ? traitExportById.get(property.ownerTraitId)
        : undefined;
    const target = owner ?? 'rule';
    lines.push(
      `export const ${property.ref.exportName} = ${target}.addProperty(${q(property.id)}, ${q(property.type)}, ${defaultLiteral(property)}, {name: ${q(property.name)}});`,
    );
  }

  for (const event of meta.events) {
    lines.push(
      `export const ${event.ref.exportName} = rule.addEvent(${q(event.id)}, {name: ${q(event.name)}});`,
    );
  }

  lines.push('', 'export default rule.build();', '');
  return lines.join('\n');
}
