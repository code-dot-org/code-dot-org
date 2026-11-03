// A FILE's OWN properties — state declared where it is used, without a rule.
//
// An actor's first, and a world's since (specs/WORLD_STATE.md): one walk, one
// emitter, and the declaring root and the scope as the only differences. The
// note below is written about actors because that is where it started, and
// every line of it holds for a world one level up.
//
// The shorthand for the case where declaring a trait (which means declaring a
// rule, in a file of its own) is more ceremony than the thing deserves: one
// number a kind of actor needs to remember, like when it last fired.
//
// It is shorthand and not a new concept. What this produces is the same
// `PropertyMeta` a trait's property produces, so the get/set blocks, the slots
// on `Traited` and the defaults are all machinery that already existed. The
// only new thing is a third place to declare from.
//
// NO TRAIT IS INVENTED for these. An earlier draft synthesized one per actor
// kind to hold them, which works — but a trait is something elected, shareable
// between kinds, and answerable by `has trait`, and this is none of those. It
// would have put a trait the learner never wrote into `traits()`. The engine
// takes them through `ActorBuilder.defineProperty`, which makes the property
// and seeds its slot through the overrides every instance is built with.
//
// A declaration is data, the same shape a rule's and a trait's take
// (`ActorProperty`, `RuleProperty`): at rule level it is world-scoped, on a
// trait it is actor-scoped, and on an actor it is that kind's.
//
// SCOPE IS THE DECLARING FILE. These properties exist in `player.actor` and
// nowhere else: no other file's palette offers them, and nothing imports them.
// That is why the generated trait can be module-local and why renaming or
// deleting the actor cannot dangle a reference somewhere else. Widening this
// later is additive; narrowing it would not be, which is why it starts here.

import {
  actorDataOf,
  type ActorData,
  type ActorMember,
} from '../actors/actorData';
import type {PropertyType} from '../engine/core/types';

import type {ParamType} from './enums';
import type {SocketState} from './extensions/blockDesigner';
import {
  designedName,
  propertyDefault,
  pascal,
  PROPERTY_TYPES,
  slug,
  type ActionMeta,
  type EventMeta,
  type MemberPart,
  type PropertyMeta,
} from './ruleMeta';
import {
  DEFAULT_SCREEN_NAME,
  parseScreenData,
  type ScreenData,
} from './screenData';

/** One piece of a designed signature, as a member's data holds it. */
type DesignedPart = {
  kind?: string;
  text?: string;
  var?: string;
  /** A value's name, for one that names no variable. */
  name?: string;
  type?: string;
  /** What a call site starts with — a value, or the whole block. */
  default?: unknown;
  shadow?: SocketState;
};

/** What an actor's own declarations amount to. */
export interface OwnMeta {
  /** The module the actor is written in — `actors/player`. */
  readonly modulePath: string;
  /** Its `define actor` NAME, which is what its properties are labeled by. */
  readonly name: string;
  readonly properties: readonly PropertyMeta[];
  /**
   * Things this kind does, by name — `define block` in an `.actor` file.
   *
   * The third declaration a kind may make, after state (`define property`) and
   * per-frame work (its steps): a NAMED thing it does. A rule is still the
   * answer when behavior is shared between kinds, elected, or answerable by
   * `has trait`; this is for when the same six blocks were written twice.
   *
   * `ActionMeta` and not a shape of its own, because everything downstream is
   * the machinery a rule's actions already use: `defineActionBlock` mints the
   * call site from this, `memberKey` names it apart from every other file's,
   * and `refCode` imports it where it is used. An own action differs from a
   * rule's in exactly what an own property differs in — the ref says which
   * FILE declared it rather than which rule.
   *
   * STATEMENTS ONLY for now. `define block` also designs a block that REPORTS
   * a value, which wants `defineQuery` and a `return` in the body; one that
   * says it reports something is refused here and says so on its own face
   * (`extensions/actorBlockStatementOnly`).
   */
  readonly actions: readonly ActionMeta[];
  /**
   * Things that HAPPEN to this kind — `define event` in an `.actor` file.
   *
   * The fourth declaration, and the one that lets a kind of actor say
   * something to the rest of the project without a rule in between: a speech
   * box that has finished revealing, a door that has reached the top. The
   * `.actor` file raises it with `emit`, and whoever cares — the same file, a
   * world, another actor — hears it with the hat.
   *
   * ALWAYS ACTOR-SCOPED, which is the one place this differs from a rule's.
   * A rule declares an event at rule level and it is the WORLD's ("a key went
   * down"), or under a trait and it is an actor's. A kind of actor has no
   * level above itself: whatever it declares happened TO one of them, so the
   * hat takes a subject and the handler is handed the actor it happened to.
   *
   * `EventMeta` and not a shape of its own, for the reason `actions` gives:
   * the hat and the `emit` block are minted by the same two factories a rule's
   * events go through, and the only difference is a ref that names the FILE.
   */
  readonly events: readonly EventMeta[];
  /**
   * The kind this one acts LIKE, by module path — `actors/progressBar`.
   *
   * Read for the palette and for nothing else. What subclassing DOES is the
   * builder's (`ActorBuilder.actsLike`), written by the block's own generator;
   * what it needs from here is that a child's drawer offers the parent's
   * blocks as well as its own, because a learner looking in the Health Bar's
   * drawer for the thing that fills it should find it there
   * (`domainBlocks`, the actors' drawers).
   *
   * The LAST one wins if a file somehow holds two. Nothing offers a second —
   * the block is a row and a chain may hold any number — and two would be two
   * answers to "what is this", where the builder simply takes both in order.
   * One is what the palette can say something about.
   */
  readonly actsLike?: string;
}

/**
 * An actor file's own declarations, read from its data (`actors/actorData`).
 *
 * Undefined for contents that are no actor — mid-edit, or not one at all —
 * matching `parseRuleMeta`. An actor with no declarations has a meta with
 * none, so "no properties" and "not parseable" stay apart.
 */
export function parseActorOwnMeta(
  modulePath: string,
  contents: string,
): OwnMeta | undefined {
  const data = actorDataOf(contents);
  return data ? actorOwnMeta(modulePath, data) : undefined;
}

/**
 * A SCREEN's own declarations: its game-wide values and events, which it
 * holds as data rather than as rows (specs/SCREEN_MAP_PLAN.md, step 4), read
 * from the data (`screenOwnMeta`).
 */
export function parseScreenOwnMeta(
  modulePath: string,
  contents: string,
): OwnMeta | undefined {
  const data = parseScreenData(contents);
  return data ? screenOwnMeta(modulePath, data) : undefined;
}

/**
 * What a screen's data declares, as a world's declarations read: named,
 * minted and imported as a world's are, by the module path of the screen
 * (specs/WORLD_AS_DATA_PLAN.md, step 2).
 */
export function screenOwnMeta(modulePath: string, data: ScreenData): OwnMeta {
  const name = data.name || DEFAULT_SCREEN_NAME;
  const properties: PropertyMeta[] = [];
  const taken = new Set<string>();
  for (const property of data.properties ?? []) {
    // An unnamed one declares nothing, and the first of a name wins, as for
    // every other declaration.
    const declared = property?.name;
    if (typeof declared !== 'string' || !declared.trim()) {
      continue;
    }
    const id = slug(declared);
    if (taken.has(id)) {
      continue;
    }
    taken.add(id);
    const type = (
      PROPERTY_TYPES.has(property.type) ? property.type : 'number'
    ) as PropertyType;
    const held = vectorText(property.value);
    properties.push({
      id,
      name: declared,
      type,
      default:
        type === 'vector'
          ? propertyDefault(type, held ?? {x: 0, y: 0})
          : type === 'point'
            ? propertyDefault(type, held?.x ?? 0, held?.y ?? 0)
            : propertyDefault(type, property.value),
      readonly: false,
      scope: 'world',
      ref: {
        source: 'project',
        exportName: `${pascal(declared)}Property`,
        ruleName: name,
        modulePath,
        own: true,
      },
    });
  }
  const events: EventMeta[] = [];
  const named = new Set<string>();
  for (const event of data.events ?? []) {
    if (typeof event?.name !== 'string' || !event.name.trim()) {
      continue;
    }
    const carries = event.carries;
    const declared = designedEventOf(
      [
        {kind: 'label', text: event.name},
        ...(carries
          ? [{kind: 'param', name: carries.name, type: carries.type}]
          : []),
      ],
      modulePath,
      name,
      new Map(),
      'world',
    );
    if (declared && !named.has(declared.id)) {
      named.add(declared.id);
      events.push(declared);
    }
  }
  return {modulePath, name, properties, actions: [], events};
}

/** `x,y` as two numbers, or nothing for text that is not a pair. */
const vectorText = (text: unknown): {x: number; y: number} | undefined => {
  if (typeof text !== 'string') {
    return undefined;
  }
  const parts = text.split(',');
  if (parts.length !== 2) {
    return undefined;
  }
  const [x, y] = parts.map(part => Number(part.trim()));
  return Number.isFinite(x) && Number.isFinite(y) ? {x, y} : undefined;
};

/** What an actor's data declares. */
export function actorOwnMeta(modulePath: string, data: ActorData): OwnMeta {
  const name = data.name || 'Actor';
  // A designed member's values are workspace variables, held by id.
  const variables = new Map<string, string>();
  for (const variable of (data.blocks?.variables ?? []) as Array<{
    id?: string;
    name?: string;
  }>) {
    if (variable?.id) {
      variables.set(variable.id, variable.name ?? variable.id);
    }
  }
  const properties: PropertyMeta[] = [];
  const actions: ActionMeta[] = [];
  const events: EventMeta[] = [];
  const taken = new Set<string>();
  const namedBlocks = new Set<string>();
  const namedEvents = new Set<string>();

  for (const member of data.members ?? []) {
    // First wins, for members as for properties: two designed to read the
    // same way would mint one block type twice.
    if (member.kind === 'event') {
      const declared = designedEventOf(
        member.parts,
        modulePath,
        name,
        variables,
      );
      if (declared && !namedEvents.has(declared.id)) {
        namedEvents.add(declared.id);
        events.push(declared);
      }
      continue;
    }
    const declared = designedBlock(member, modulePath, name, variables);
    if (declared && !namedBlocks.has(declared.id)) {
      namedBlocks.add(declared.id);
      actions.push(declared);
    }
  }

  for (const property of data.properties ?? []) {
    const declared = property.name;
    if (!declared) {
      continue; // an unnamed declaration declares nothing
    }
    const id = slug(declared);
    if (taken.has(id)) {
      continue;
    }
    taken.add(id);
    const type = (
      PROPERTY_TYPES.has(property.type) ? property.type : 'number'
    ) as PropertyType;
    properties.push({
      id,
      name: declared,
      type,
      default: propertyDefault(type, property.value, property.valueY),
      // A per-kind constant, like a max health: no setter is offered at all.
      readonly: property.access === 'readonly',
      scope: 'actor',
      // No owning trait: the ref names the actor and the file, and `own`
      // says it is no rule anyone can look up.
      ref: {
        source: 'project',
        exportName: `${pascal(declared)}Property`,
        ruleName: name,
        modulePath,
        own: true,
      },
    });
  }

  const actsLike =
    data.actsLike && data.actsLike !== modulePath ? data.actsLike : undefined;
  return {
    modulePath,
    name,
    properties,
    actions,
    events,
    ...(actsLike ? {actsLike} : {}),
  };
}

/**
 * One block an actor adds, as the metadata its call site is minted from.
 *
 * The same reading `parseRuleMeta` gives a rule's (`addDesignedBlock`), and
 * deliberately so: it is one kind of member with one meaning. What differs is the REF — `own`, naming the file rather
 * than a rule — which is exactly how an own property differs from a rule's.
 *
 * Returns nothing for a block that says it REPORTS something. That form wants
 * `defineQuery` and a `return`, which is the next piece of work rather than
 * this one; the block wears a warning saying so, so it is not silent.
 */
function designedBlock(
  member: ActorMember,
  modulePath: string,
  actorName: string,
  variables: ReadonlyMap<string, string>,
): ActionMeta | undefined {
  if (member.returns) {
    return undefined;
  }
  const raw = member.parts as DesignedPart[];
  const parts: MemberPart[] = raw.flatMap((part): MemberPart[] => {
    if (part.kind === 'param') {
      return [
        {
          kind: 'param',
          name: (part.var && variables.get(part.var)) || part.name || 'value',
          type: (part.type ?? 'number') as ParamType,
        },
      ];
    }
    if (part.kind === 'row') {
      return [{kind: 'row'}];
    }
    return part.text ? [{kind: 'label', text: part.text}] : [];
  });
  const named = designedName(raw);
  if (!named) {
    return undefined; // a block with no words on it names nothing
  }
  return {
    id: slug(named),
    name: named,
    params: parts
      .filter(
        (part): part is {kind: 'param'; name: string; type: ParamType} =>
          part.kind === 'param',
      )
      .map(part => ({name: part.name, type: part.type})),
    parts,
    description: member.description || undefined,
    // The eye shut: only this file's own drawer offers the block.
    shared: !member.hidden,
    // An actor's, so the call site takes an actor socket and the body is
    // handed one — the same scope a trait's action has.
    scope: 'actor',
    ref: {
      source: 'project',
      exportName: `${pascal(named)}Action`,
      // The declaring ACTOR, as an own property's ref names it: `memberRule`
      // reads `own` and looks up no rule, so nothing warns that a project has
      // stopped having an actor named "Ball".
      ruleName: actorName,
      modulePath,
      own: true,
    },
  };
}

/**
 * One event an actor or a screen declares, as the metadata its hat and its
 * `emit` block are minted from, read from its designed parts.
 */
function designedEventOf(
  raw: readonly DesignedPart[],
  modulePath: string,
  actorName: string,
  variables: ReadonlyMap<string, string>,
  scope: 'actor' | 'world' = 'actor',
): EventMeta | undefined {
  const parts: MemberPart[] = raw.flatMap((part): MemberPart[] => {
    if (part.kind === 'param') {
      return [
        {
          kind: 'param',
          // `value`, not `choice`: an event's parameter was a filter over a
          // set of choices and is a VALUE THE EVENT CARRIES now, of whatever
          // type its author gave it (specs/EVENT_VALUES_PLAN.md).
          name: (part.var && variables.get(part.var)) || part.name || 'value',
          type: (part.type ?? 'string') as ParamType,
          // What the `emit` socket starts with, as a rule's own events carry
          // one (`ruleMeta.addEvent`).
          ...(part.default === undefined ? {} : {default: part.default}),
          ...(part.shadow === undefined ? {} : {shadow: part.shadow}),
        },
      ];
    }
    if (part.kind === 'row') {
      return [{kind: 'row'}];
    }
    return part.text ? [{kind: 'label', text: part.text}] : [];
  });
  const named = designedName(raw);
  if (!named) {
    return undefined; // an event with no words on it names nothing
  }
  return {
    id: slug(named),
    name: named,
    scope,
    ...(parts.length > 0 ? {parts} : {}),
    ref: {
      source: 'project',
      exportName: `${pascal(named)}Event`,
      ruleName: actorName,
      modulePath,
      own: true,
    },
  };
}

/**
 * The declarations an actor module needs for its own properties.
 *
 * Emitted AFTER `const actor = …` rather than before it, which is why these are
 * `actor.defineProperty(…)` and not free-standing objects: the actor is what
 * owns them, and putting them after removes the ordering hazard that made
 * hoisted world hats emit `world.on(…)` above `const world`. The handlers that
 * read them come later still and close over these consts.
 *
 * EXPORTED, which the note at the top said this would grow into: "widening
 * this later is additive". It has, and the stock Health Bar is why. A bar
 * carries the actor it is about, and the whole point of that property is that
 * something ELSE sets it — a world saying `set subject of ⟨any ⟨Health Bar⟩⟩
 * to ⟨this actor⟩`. Module-local, that generated an import of a name the
 * module did not offer, and the project would not compile.
 *
 * The scope that stays narrow is the DECLARATION: only the actor's own file
 * may declare one, and only its own body may say `define property`. Who may
 * read and write it afterwards is a different question, and the answer a
 * rule's property already gives is the right one.
 */
export function ownPropertyDeclarations(meta: OwnMeta): string {
  return declarations(meta, 'actor');
}

/**
 * …and the same for a world's own, which a world module needs before anything
 * reads them.
 *
 * `world.defineProperty` rather than `actor.`, and otherwise identical: the
 * builder methods are siblings on purpose, so one emitter with the receiver
 * named is the whole difference (specs/WORLD_STATE.md).
 */
export function worldOwnPropertyDeclarations(meta: OwnMeta): string {
  return declarations(meta, 'world') + worldOwnEventDeclarations(meta);
}

/**
 * …and the world's own EVENTS: the identity, and the name a map raises it by.
 *
 * TWO LINES EACH, and the second is the whole of this plan. The `export const`
 * is what a hat in this module refers to, exactly as a map's event is an
 * export its own module refers to. The `defineEvent` beside it puts the same
 * identity in the world's registry under the words it reads by, because a MAP
 * cannot import this module — the world loads the map, which is a cycle, and
 * a `.map` is meant for several worlds anyway (specs/MAP_EVENTS_PLAN.md).
 *
 * The third registry of its kind, beside `define` for actor kinds and
 * `defineTheme` for themes, and reached for the same reason each time: a name
 * that arrives as DATA cannot be followed by an import.
 *
 * Emitted where a world's properties are, at the module's top level directly
 * after `const world` — so the export precedes every hat that refers to it and
 * the registration precedes every map that could raise it.
 */
function worldOwnEventDeclarations(meta: OwnMeta): string {
  return meta.events
    .map(event => {
      const constant = event.ref.exportName;
      return (
        `export const ${constant} = {id: ${JSON.stringify(event.id)}, ` +
        `name: ${JSON.stringify(event.name)}, ` +
        `ownerId: ${JSON.stringify(meta.modulePath)}};\n` +
        `world.defineEvent(${JSON.stringify(event.name)}, ${constant});\n`
      );
    })
    .join('');
}

/**
 * What a screen other than the Main Screen declares, in its own module: its
 * values and its events as plain objects, which every copy of it on the stack
 * reads its own of (`MapLoad.get`), and the names of the values, which its
 * map data lists so each copy seeds them (specs/SCREEN_STACK_PLAN.md).
 *
 * No `defineEvent` beside each event: a screen's words are seen by its own
 * code alone, so nothing names one from outside.
 */
export function screenModuleDeclarations(meta: OwnMeta): {
  code: string;
  values: string[];
} {
  const owner = JSON.stringify(meta.modulePath);
  const code =
    meta.properties
      .map(property => {
        const fields = [
          `id: ${JSON.stringify(property.id)}`,
          `name: ${JSON.stringify(property.name)}`,
          `type: ${JSON.stringify(property.type)}`,
          `default: ${JSON.stringify(property.default)}`,
          `readonly: ${property.readonly ? 'true' : 'false'}`,
          `scope: 'world'`,
          `ownerId: ${owner}`,
          `ownerKind: 'world'`,
        ];
        return `export const ${property.ref.exportName} = {${fields.join(', ')}};\n`;
      })
      .join('') +
    meta.events
      .map(
        event =>
          `export const ${event.ref.exportName} = {id: ${JSON.stringify(event.id)}, ` +
          `name: ${JSON.stringify(event.name)}, ownerId: ${owner}};\n`,
      )
      .join('');
  return {
    code,
    values: meta.properties.map(property => property.ref.exportName),
  };
}

function declarations(meta: OwnMeta, receiver: string): string {
  return meta.properties
    .map(property =>
      declarationLine(receiver, property.ref.exportName, property.id, true, {
        type: property.type,
        value: property.default,
        name: property.name,
        readonly: property.readonly,
      }),
    )
    .join('');
}

/** The one line every one of these compiles to, wherever it was declared. */
function declarationLine(
  receiver: string,
  exportName: string,
  id: string,
  exported: boolean,
  declared: {
    type: PropertyType;
    value: unknown;
    name: string;
    readonly: boolean;
  },
): string {
  const opts: Record<string, unknown> = {name: declared.name};
  if (declared.readonly) {
    opts.readonly = true;
  }
  return (
    `${exported ? 'export ' : ''}const ${exportName} = ${receiver}.defineProperty(` +
    `${JSON.stringify(id)}, ${JSON.stringify(declared.type)}, ` +
    `${JSON.stringify(declared.value)}, ${JSON.stringify(opts)});\n`
  );
}
