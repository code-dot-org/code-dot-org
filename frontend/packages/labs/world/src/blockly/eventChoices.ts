// The events a section can start with, for the "+" between sections and the
// map editor's quick add (specs/LAZY_WORKSPACE_PLAN.md, "Adding a section").
//
// A section is a top block, and the top blocks a learner adds are event hats:
// `when ⟨this⟩ is clicked`, `when a key is pressed`. Finding one meant knowing
// which drawer holds it, among drawers of rows; these lists put every event
// the file can use in one place, worded as the hat reads.
//
// FROM THE TOOLBOX THE FILE ALREADY HAS, not a list of our own: the toolbox
// is already narrowed to this kind of file and to the rules the project holds,
// so what is offered here is exactly what could be dragged out of a drawer.

import type {Toolbox, ToolboxCategory} from '@code-dot-org/blockly';

import {ANY_FIELD, THIS_FIELD} from './eventSubject';
import type {EventMeta, RuleMeta} from './ruleMeta';
import {memberLocalName, memberValue} from './ruleRegistry';

/** One event a section can start with. */
export interface EventChoice {
  /** The hat's block type. */
  type: string;
  /** How the hat reads, its sockets as "…": `when … is clicked`. */
  label: string;
  /** The drawer it is in, which is what the list is grouped by. */
  drawer: string;
}

/** A block definition, as far as a label is read from it. */
interface Definition {
  type?: string;
  message0?: string;
  args0?: ReadonlyArray<{type?: string; name?: string}>;
}

/**
 * The wording of a hat, its sockets and fields as "…".
 *
 * Whose event it is (`eventSubject`) is `this actor`, or `any` and a kind,
 * in inputs of their own. Here it is one "…", as every other choice the
 * block holds is: the words and the inputs that hold them say nothing.
 */
const labelOf = (definition: Definition | undefined, type: string): string => {
  const silent = new Set(
    (definition?.args0 ?? []).flatMap((arg, index) =>
      arg.type === 'input_dummy' ||
      arg.name === THIS_FIELD ||
      arg.name === ANY_FIELD
        ? [index + 1]
        : [],
    ),
  );
  return (definition?.message0 ?? type)
    .replace(/%(\d+)/g, (_, at) => (silent.has(Number(at)) ? '' : '…'))
    .replace(/\s+/g, ' ')
    .trim();
};

const typeOf = (item: unknown): string | undefined =>
  typeof item === 'string'
    ? item
    : typeof (item as {type?: unknown})?.type === 'string'
      ? (item as {type: string}).type
      : undefined;

/** Whether a block type is an event's hat. */
export const isEventHat = (type: string): boolean =>
  type.startsWith('world_on_');

/**
 * Every event hat the toolbox offers, once each, in drawer order.
 *
 * A hat filed in two drawers is listed under the first.
 */
export function eventChoicesIn(
  toolbox: Toolbox,
  definitions: ReadonlyArray<object>,
): EventChoice[] {
  if (!Array.isArray(toolbox)) {
    return [];
  }
  const byType = new Map<string, Definition>();
  for (const definition of definitions as ReadonlyArray<Definition>) {
    if (definition.type) {
      byType.set(definition.type, definition);
    }
  }
  const seen = new Set<string>();
  const choices: EventChoice[] = [];
  for (const category of toolbox as ToolboxCategory[]) {
    if (typeof (category as {kind?: unknown}).kind === 'string') {
      continue; // a heading, not a drawer
    }
    for (const item of category.blocks ?? []) {
      const type = typeOf(item);
      if (!type || !isEventHat(type) || seen.has(type)) {
        continue;
      }
      seen.add(type);
      choices.push({
        type,
        label: labelOf(byType.get(type), type),
        drawer: category.name,
      });
    }
  }
  return choices;
}

/** The hat type an event's handler is written with. */
export const hatTypeOf = (event: EventMeta): string =>
  `world_on_${memberLocalName(event.ref)}`;

/** A kind's own facts, as far as which events reach it depends on them. */
export interface KindFacts {
  /** The `use trait` values its file elects, as the dropdown stores them. */
  traitValues: readonly string[];
  /** Its own events, declared in its file. */
  ownEvents: readonly EventMeta[];
  /** The kind it acts like, if any, by module path. */
  actsLike?: string;
}

/**
 * The trait ids a kind holds: what its file elects, what the kinds it acts
 * like elect, what those traits require, and what every actor holds.
 *
 * By id, which is what an event says it belongs to (`EventMeta.ownerTraitId`).
 * A file elects a trait by its dropdown value (`memberValue`), so the values
 * are turned into ids against the project's rules.
 */
export function traitIdsOfKind(
  kind: string,
  facts: (module: string) => KindFacts | undefined,
  rules: readonly RuleMeta[],
  everyActor: ReadonlySet<string> = new Set(),
): Set<string> {
  const traitByValue = new Map(
    rules.flatMap(rule =>
      rule.traits.map(trait => [memberValue(trait.ref), trait] as const),
    ),
  );
  const ids = new Set<string>();
  const visit = (value: string) => {
    const trait = traitByValue.get(value);
    if (!trait || ids.has(trait.id)) {
      return;
    }
    ids.add(trait.id);
    trait.requires.forEach(visit);
  };
  everyActor.forEach(visit);
  const kindsSeen = new Set<string>();
  for (
    let at: string | undefined = kind;
    at && !kindsSeen.has(at);
    at = facts(at)?.actsLike
  ) {
    kindsSeen.add(at);
    facts(at)?.traitValues.forEach(visit);
  }
  return ids;
}

/**
 * The choices that can reach an actor of this kind: the world's own events,
 * which fire whoever is listening, its own and its parents' events, and those
 * of the traits it holds. A hat for any other trait's event, or for an event
 * another kind declares for itself (`declaredByKinds`), would be a handler
 * that never runs, which is the silent failure this list is meant to keep a
 * learner out of.
 */
export function eventChoicesForKind(
  choices: readonly EventChoice[],
  kind: string,
  facts: (module: string) => KindFacts | undefined,
  rules: readonly RuleMeta[],
  everyActor: ReadonlySet<string> = new Set(),
  declaredByKinds: ReadonlySet<string> = new Set(),
): EventChoice[] {
  const traits = traitIdsOfKind(kind, facts, rules, everyActor);
  // Each event with the traits it reaches through. An actor's event names
  // the trait that owns it; a built-in rule's names none — the engine's rules
  // carry their events on the rule — and reaches through the rule's traits,
  // each of which has only one: Space's is every actor's, a Viewport's is a
  // Viewport's.
  const events = new Map<
    string,
    {event: EventMeta; through: readonly string[]}
  >();
  for (const rule of rules) {
    for (const event of rule.events) {
      events.set(hatTypeOf(event), {
        event,
        through: event.ownerTraitId
          ? [event.ownerTraitId]
          : rule.traits.map(trait => trait.id),
      });
    }
  }
  const own = new Set<string>();
  const kindsSeen = new Set<string>();
  for (
    let at: string | undefined = kind;
    at && !kindsSeen.has(at);
    at = facts(at)?.actsLike
  ) {
    kindsSeen.add(at);
    for (const event of facts(at)?.ownEvents ?? []) {
      own.add(hatTypeOf(event));
    }
  }
  return choices.filter(choice => {
    if (own.has(choice.type)) {
      return true;
    }
    // ANOTHER KIND'S OWN EVENT. An event an actor declares in its own file
    // belongs to no rule, so it is not in `events` below, and was let
    // through as though it were the language's: a Button was offered the
    // Slider's `changed`, a handler that would never run.
    if (declaredByKinds.has(choice.type)) {
      return false;
    }
    const held = events.get(choice.type);
    if (!held) {
      // A hat no rule and no kind declares — the language's own, like a map
      // loading.
      return true;
    }
    return (
      held.event.scope === 'world' || held.through.some(id => traits.has(id))
    );
  });
}

/** A block in a file's JSON, as far as finding `use trait` rows needs. */
interface JsonBlock {
  type?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: JsonBlock; shadow?: JsonBlock} | undefined>;
  next?: {block?: JsonBlock};
}

/** Every `use trait` value an actor file elects, wherever the row sits. */
export function traitValuesIn(contents: string): string[] {
  let document: {blocks?: {blocks?: JsonBlock[]}};
  try {
    document = JSON.parse(contents) as typeof document;
  } catch {
    return [];
  }
  const values: string[] = [];
  const walk = (block: JsonBlock | undefined) => {
    if (!block) {
      return;
    }
    if (block.type === 'world_use_trait') {
      const value = block.fields?.TRAIT;
      if (typeof value === 'string' && value) {
        values.push(value);
      }
    }
    for (const held of Object.values(block.inputs ?? {})) {
      walk(held?.block);
    }
    walk(block.next?.block);
  };
  (document.blocks?.blocks ?? []).forEach(walk);
  return values;
}

/**
 * Every event an actor kind declares in its own file, as hat types: the
 * events no other kind can hear (`eventChoicesForKind`).
 */
export function kindDeclaredEvents(
  owns: ReadonlyArray<{modulePath: string; events: readonly EventMeta[]}>,
): Set<string> {
  return new Set(
    owns
      .filter(meta => meta.modulePath.startsWith('actors/'))
      .flatMap(meta =>
        meta.events.filter(event => event.scope !== 'world').map(hatTypeOf),
      ),
  );
}

/**
 * Each actor kind's facts, read from the project's files: what its file
 * elects, the events it declares, and what it acts like.
 */
export function kindFactsFrom(
  files: Readonly<Record<string, string>>,
  owns: ReadonlyArray<{
    modulePath: string;
    events: readonly EventMeta[];
    actsLike?: string;
  }>,
): (module: string) => KindFacts | undefined {
  const byModule = new Map(owns.map(meta => [meta.modulePath, meta]));
  return module => {
    const contents = files[`${module}.actor`];
    const meta = byModule.get(module);
    if (contents === undefined && !meta) {
      return undefined;
    }
    return {
      traitValues: contents === undefined ? [] : traitValuesIn(contents),
      ownEvents: meta?.events ?? [],
      ...(meta?.actsLike ? {actsLike: meta.actsLike} : {}),
    };
  };
}
