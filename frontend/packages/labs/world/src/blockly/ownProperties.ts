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

import {
  parseDefault,
  pascal,
  PROPERTY_TYPES,
  slug,
  type MemberRef,
  type PropertyMeta,
} from './ruleMeta';

/** A block as it appears in a serialized workspace. */
interface ActorBlock {
  type?: string;
  fields?: Record<string, unknown>;
  next?: {block?: ActorBlock};
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
  /** Its `define actor` NAME, which is what its properties are labelled by. */
  readonly name: string;
  readonly properties: readonly PropertyMeta[];
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
  return declarationsIn(modulePath, contents, 'world_actor', 'actor', 'Actor');
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

/** The walk both share: a root's chain, and every declaration in it. */
function declarationsIn(
  modulePath: string,
  contents: string,
  rootType: string,
  scope: 'actor' | 'world',
  fallbackName: string,
): OwnMeta | undefined {
  let root: ActorBlock | undefined;
  try {
    const parsed = JSON.parse(contents) as {blocks?: {blocks?: ActorBlock[]}};
    root = (parsed.blocks?.blocks ?? []).find(b => b?.type === rootType);
  } catch {
    return undefined; // mid-edit / not JSON
  }
  if (!root) {
    return undefined;
  }

  const name = field(root, 'NAME') || fallbackName;
  const properties: PropertyMeta[] = [];
  const taken = new Set<string>();

  for (const block of chain(root)) {
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

  return {modulePath, name, properties};
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
 * Nothing is exported. Their scope is this file (see the note at the top), so
 * an export would offer a name no other module is allowed to ask for.
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
    .map(property => {
      const opts: Record<string, unknown> = {name: property.name};
      if (property.readonly) {
        opts.readonly = true;
      }
      return (
        `const ${property.ref.exportName} = ${receiver}.defineProperty(` +
        `${JSON.stringify(property.id)}, ${JSON.stringify(property.type)}, ` +
        `${JSON.stringify(property.default)}, ${JSON.stringify(opts)});\n`
      );
    })
    .join('');
}
