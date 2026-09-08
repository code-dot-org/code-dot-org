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
// The declaration block is `world_rule_property`, the same one a rule and a
// trait use, deliberately. That block already takes its meaning from where it
// sits — at rule level it is world-scoped, inside a trait it is actor-scoped
// (see `parseRuleMeta`) — so a third site is what it was already built for. A
// separate near-identical block would invite exactly the confusion of trying
// the familiar one here and finding it inert.
//
// SCOPE IS THE DECLARING FILE. These properties exist in `player.actor` and
// nowhere else: no other file's palette offers them, and nothing imports them.
// That is why the generated trait can be module-local and why renaming or
// deleting the actor cannot dangle a reference somewhere else. Widening this
// later is additive; narrowing it would not be, which is why it starts here.

import type {PropertyType} from '../engine/core/types';

import type {ParamType} from './enums';
import {localActorVar} from './localActors';
import {
  designedName,
  parseDefault,
  pascal,
  PROPERTY_TYPES,
  slug,
  type ActionMeta,
  type EventMeta,
  type MemberPart,
  type MemberRef,
  type PropertyMeta,
} from './ruleMeta';

/** A block as it appears in a serialized workspace. */
interface ActorBlock {
  type?: string;
  fields?: Record<string, unknown>;
  next?: {block?: ActorBlock};
  /** A `define block`'s designed signature, as the designer mutator saved it. */
  extraState?: {
    parts?: ReadonlyArray<{
      kind?: string;
      text?: string;
      var?: string;
      type?: string;
    }>;
  };
}

const field = (block: ActorBlock, name: string): string =>
  typeof block.fields?.[name] === 'string'
    ? (block.fields[name] as string)
    : '';

/** The blocks chained below one, in order — a `define actor`'s body. */
function chain(from: ActorBlock | undefined): ActorBlock[] {
  const blocks: ActorBlock[] = [];
  for (let at = from?.next?.block; at; at = at.next?.block) {
    blocks.push(at);
  }
  return blocks;
}

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
   * per-frame work (`each frame`): a NAMED thing it does. A rule is still the
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
 * An actor file's own property declarations.
 *
 * Returns undefined for a file with no `define actor` — mid-edit, or not an
 * actor at all — matching `parseRuleMeta`, which a caller already handles. An
 * actor with no declarations returns a meta with none rather than undefined, so
 * "no properties" and "not parseable" stay distinguishable.
 */
export function parseActorOwnMeta(
  modulePath: string,
  contents: string,
): OwnMeta | undefined {
  return declarationsIn(
    modulePath,
    contents,
    'world_actor',
    'actor',
    'Actor',
    // The only root that may hold a `define block` or a `define event`, and so
    // the only reader that asks for either — see `declarationsFrom`.
    true,
  );
}

/**
 * A WORLD file's own property declarations (specs/WORLD_STATE.md).
 *
 * The same walk over a different root, because it is the same declaration in a
 * fourth home: `world_rule_property` already takes its meaning from where it
 * sits, and a `.world` file's `define world` body is one more place to sit.
 *
 * What differs is the SCOPE, and everything downstream follows from it: a
 * world-scoped property's get/set blocks take no subject socket and compile to
 * `world.get(…)` / `world.set(…)`, which is the shape a rule's own properties
 * already have.
 */
export function parseWorldOwnMeta(
  modulePath: string,
  contents: string,
): OwnMeta | undefined {
  return declarationsIn(modulePath, contents, 'world_world', 'world', 'World');
}

/**
 * Every ACTOR a world defines for itself, and what each declares.
 *
 * A world's own `define actor` roots are actors like any other, so `define
 * property` inside one is that actor's — the same declaration in a fifth home.
 * They were not read at all until this, which is not a boundary anybody drew:
 * the walk simply looked for ONE root of one type per file, and `world_world`
 * was the one it looked for. A world-defined actor could therefore have a
 * picture and no memory, and a scoreboard that carried a number had to be a
 * file (fixtures/platformerSingle).
 *
 * THE MODULE PATH CARRIES THE DEFINING BLOCK, `worlds/main#someActorDef`, and
 * that is the whole of what made this hard. A block type is minted from the
 * path (`pathSlug` in domainBlocks), so two local actors in one world both
 * declaring `subject` would mint one block type for two different properties —
 * and which one a `get` block read would depend on which meta was registered
 * last. The `#` is not a path anything resolves; nothing imports these, and
 * their scope is the block their actor's body generates into.
 */
export function parseWorldActorOwnMetas(
  modulePath: string,
  contents: string,
): OwnMeta[] {
  let roots: ActorBlock[];
  try {
    const parsed = JSON.parse(contents) as {
      blocks?: {blocks?: (ActorBlock & {id?: string})[]};
    };
    roots = (parsed.blocks?.blocks ?? []).filter(
      b => b?.type === 'world_actor',
    );
  } catch {
    return []; // mid-edit / not JSON
  }
  return roots.flatMap(root => {
    const id = (root as {id?: string}).id;
    const meta = declarationsFrom(
      id ? `${modulePath}#${id}` : modulePath,
      root,
      'actor',
      'Actor',
    );
    return meta ? [meta] : [];
  });
}

/**
 * What generated code calls a property a WORLD-DEFINED actor declares.
 *
 * TWO NAMES, because they answer two questions. The `exportName` is what the
 * property is CALLED, and a block type is minted from it (`memberKey`) — which
 * is a name people read: `standInBlocks` splits that segment back into words to
 * put on a dead block's face, so `Worlds Main Bar Def Subject Property` is a
 * sentence and the generator's identifier would not be. This is the other
 * question: what the generator WRITES. It needs a name of its own because the
 * declaration is hoisted to the world module's top level (`domainBlocks`,
 * `world_actor`), and two local actors both declaring `subject` would otherwise
 * be one const declared twice, which is a project that does not compile.
 *
 * Both sides call this: the `const` the definition emits, and the reference a
 * `get`/`set` block generates (`refCode`). They have to agree, and there is one
 * place where they do.
 */
export const ownPropertyCodeName = (
  exportName: string,
  worldLocal: {actorName: string; blockId: string},
): string =>
  `${localActorVar(worldLocal.actorName, worldLocal.blockId)}_${exportName}`;

/** The walk both share: a root's chain, and every declaration in it. */
function declarationsIn(
  modulePath: string,
  contents: string,
  rootType: string,
  scope: 'actor' | 'world',
  fallbackName: string,
  actorFile = false,
): OwnMeta | undefined {
  let root: ActorBlock | undefined;
  const variables = new Map<string, string>();
  try {
    const parsed = JSON.parse(contents) as {
      blocks?: {blocks?: ActorBlock[]};
      variables?: ReadonlyArray<{id?: string; name?: string}>;
    };
    // A designed block's parameters are workspace variables, and what the
    // mutator saved is their ids — the same resolution `parseRuleMeta` does.
    for (const variable of parsed.variables ?? []) {
      if (variable.id) {
        variables.set(variable.id, variable.name ?? variable.id);
      }
    }
    root = (parsed.blocks?.blocks ?? []).find(b => b?.type === rootType);
  } catch {
    return undefined; // mid-edit / not JSON
  }
  if (!root) {
    return undefined;
  }
  return declarationsFrom(
    modulePath,
    root,
    scope,
    fallbackName,
    variables,
    actorFile,
  );
}

/**
 * Everything one root declares, given the root itself.
 *
 * @param variables the workspace's variable map, id → name. A designed block's
 *   parameters are variables, and their ids are what the mutator saved; without
 *   this every parameter would be called by its id.
 * @param actorFile whether this root is an `.actor` FILE's `define actor`,
 *   which is the whole of where a `define block` or a `define event` may be
 *   written today: a world's own `define actor` generates into a block scope,
 *   where the `export const` either declaration emits is not legal, and a
 *   `.world` is not offered the blocks at all (`ROOT_HOMES`).
 */
function declarationsFrom(
  modulePath: string,
  root: ActorBlock,
  scope: 'actor' | 'world',
  fallbackName: string,
  variables: ReadonlyMap<string, string> = new Map(),
  actorFile = false,
): OwnMeta | undefined {
  const name = field(root, 'NAME') || fallbackName;
  const properties: PropertyMeta[] = [];
  const actions: ActionMeta[] = [];
  const events: EventMeta[] = [];
  const taken = new Set<string>();
  const namedBlocks = new Set<string>();
  const namedEvents = new Set<string>();

  let actsLike: string | undefined;

  for (const block of chain(root)) {
    if (block.type === 'world_acts_like') {
      // A world's own actor is a `const` in its world's module and not
      // something another file can be, so a `local:` value names nothing here.
      const named = field(block, 'ACTOR');
      if (named && !named.startsWith('local:') && named !== modulePath) {
        actsLike = named;
      }
      continue;
    }
    if (block.type === 'world_rule_event') {
      if (actorFile) {
        const declared = designedEvent(block, modulePath, name, variables);
        // First wins, as for the rest: two events designed to read the same
        // way are one hat minted twice, and which one a handler was written
        // for would depend on registration order.
        if (declared && !namedEvents.has(declared.id)) {
          namedEvents.add(declared.id);
          events.push(declared);
        }
      }
      continue;
    }
    if (block.type === 'world_rule_block') {
      if (actorFile) {
        const declared = designedBlock(block, modulePath, name, variables);
        // First wins, as for properties: two blocks designed to read the same
        // way would mint one block type twice, and which one a call site meant
        // would depend on registration order.
        if (declared && !namedBlocks.has(declared.id)) {
          namedBlocks.add(declared.id);
          actions.push(declared);
        }
      }
      continue;
    }
    if (block.type !== 'world_rule_property') {
      continue;
    }
    const declared = field(block, 'NAME');
    if (!declared) {
      continue; // an unnamed declaration declares nothing
    }
    const id = slug(declared);
    // First wins, as elsewhere: a duplicate would give one name two slots, and
    // which one a get block read would depend on generation order.
    if (taken.has(id)) {
      continue;
    }
    taken.add(id);

    const declaredType = field(block, 'TYPE');
    const type = (
      PROPERTY_TYPES.has(declaredType) ? declaredType : 'number'
    ) as PropertyType;
    const ref: MemberRef = {
      source: 'project',
      exportName: `${pascal(declared)}Property`,
      // The declaring actor or world, which is what the block type is keyed
      // from — and `own` says so, because it is NOT a rule anyone can look up.
      ruleName: name,
      modulePath,
      own: true,
    };

    properties.push({
      id,
      name: declared,
      type,
      default: parseDefault(field(block, 'DEFAULT'), type),
      // Meaningful here, and not the same no-op it would be if these were
      // visible elsewhere. An actor's declaring scope is a DECLARATION, not a
      // body — there is nowhere in it to run a `set` — so read-only means no
      // setter is offered at all: a per-kind constant, like a max health.
      readonly: field(block, 'ACCESS') === 'readonly',
      scope,
      // No owning trait: nothing elects these, and the `ref` already names the
      // actor and the file, which is the whole of where they come from.
      ref,
    });
  }

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
 * One `define block` in an actor's body, as the metadata its call site is
 * minted from.
 *
 * The same reading `parseRuleMeta` gives the same block (`addDesignedBlock`),
 * and deliberately so: it is one block with one meaning, and where it sits
 * decides whose it is. What differs is the REF — `own`, naming the file rather
 * than a rule — which is exactly how an own property differs from a rule's.
 *
 * Returns nothing for a block that says it REPORTS something. That form wants
 * `defineQuery` and a `return`, which is the next piece of work rather than
 * this one; the block wears a warning saying so, so it is not silent.
 */
function designedBlock(
  block: ActorBlock,
  modulePath: string,
  actorName: string,
  variables: ReadonlyMap<string, string>,
): ActionMeta | undefined {
  const returns = field(block, 'RETURNS');
  if (returns && returns !== 'none') {
    return undefined;
  }
  const raw = block.extraState?.parts ?? [];
  const parts: MemberPart[] = raw.flatMap((part): MemberPart[] => {
    if (part.kind === 'param') {
      return [
        {
          kind: 'param',
          name: (part.var && variables.get(part.var)) || 'value',
          type: (part.type ?? 'number') as ParamType,
        },
      ];
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
    description: field(block, 'DESCRIPTION') || undefined,
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
 * One `define event` in an actor's body, as the metadata its hat and its
 * `emit` block are minted from.
 *
 * `parseRuleMeta.addEvent`'s reading of the same block, with two differences
 * and no others. The REF is `own` and names the file, exactly as an own
 * property's and an own action's do. And the SCOPE is always `actor`: a rule
 * has a level above its traits where an event is the world's, and a kind of
 * actor has no such level — whatever it declares happened to one of them.
 *
 * A parameter defaults to a string called `choice`, matching the rule side,
 * because the common designed event is one that carries a choice for the hat
 * to filter on (specs/ENUMS.md).
 */
function designedEvent(
  block: ActorBlock,
  modulePath: string,
  actorName: string,
  variables: ReadonlyMap<string, string>,
): EventMeta | undefined {
  const raw = block.extraState?.parts ?? [];
  const parts: MemberPart[] = raw.flatMap((part): MemberPart[] => {
    if (part.kind === 'param') {
      return [
        {
          kind: 'param',
          name: (part.var && variables.get(part.var)) || 'choice',
          type: (part.type ?? 'string') as ParamType,
        },
      ];
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
    scope: 'actor',
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
  return declarations(meta, 'world');
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

/**
 * A declaration emitted from the BLOCK rather than from parsed metadata.
 *
 * The one case that needs it: an actor a world defines for itself. Everywhere
 * else the declaration is written by the module assembler from an `OwnMeta`,
 * at the top of a module where the whole file can see it. A world-local
 * actor's body generates inside a block of its own — `{ const actor = …; … }`
 * — so the declaration has to be emitted THERE, by the block that opens it,
 * or nothing in the body can see the property.
 *
 * It shares `declarationLine` with the assembler rather than formatting its
 * own, because the two must agree on the name a `get` block will reach for.
 *
 * NOT EXPORTED, unlike a file-level actor's. `export` is only legal at a
 * module's top level and this lands inside the block a `define actor` opens,
 * so exporting it is a syntax error — and there would be nothing to export to
 * anyway, since the name is block-scoped. What that costs is that a handler
 * elsewhere in the world cannot `set ⟨…⟩ of ⟨any ⟨Bar⟩⟩` for a world-defined
 * actor's own property; the MAP still can, because `loadMap` resolves against
 * the actor's live properties rather than by name (`Actor.ownProperties`).
 */
export function ownPropertyDeclarationFor(
  fields: {
    name: string;
    type: string;
    default: string;
    access: string;
  },
  /**
   * The actor being defined: what to call `defineProperty` on, and what to
   * name the const after. Both because the declaration is HOISTED out of the
   * block the body generates into — see the note above.
   */
  on: {variable: string; actorName: string; blockId: string},
): string {
  const declared = fields.name;
  if (!declared) {
    return ''; // an unnamed declaration declares nothing
  }
  const type = (
    PROPERTY_TYPES.has(fields.type) ? fields.type : 'number'
  ) as PropertyType;
  return declarationLine(
    on.variable,
    ownPropertyCodeName(`${pascal(declared)}Property`, {
      actorName: on.actorName,
      blockId: on.blockId,
    }),
    slug(declared),
    false,
    {
      type,
      value: parseDefault(fields.default, type),
      name: declared,
      readonly: fields.access === 'readonly',
    },
  );
}
