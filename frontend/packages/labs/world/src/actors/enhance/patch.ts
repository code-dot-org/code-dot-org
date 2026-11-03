// Editing an actor a learner owns.
//
// Every other library act in this lab is ADDITIVE: an import writes a new file
// and touches nothing that was there. An enhancement is the first that reaches
// into a file somebody made, so the rules it works by are worth stating.
//
// IT WRITES WHAT THEY COULD HAVE WRITTEN. An actor is data (`actors/actorData`)
// and an enhancement adds to it: a trait, a property, a value, a handler, the
// same things the Actor Editor and the toolbox offer. Nothing is marked,
// hidden or owned by the library afterwards: what an enhancement leaves behind
// is a project, and deleting what it added undoes it.
//
// IT ADDS AT THE END. A trait inserted among somebody's moves their list
// about, and a handler is read below the ones written first.
//
// IT IS IDEMPOTENT. Enhancing twice is a thing that will happen: a learner who
// cannot see what changed will do it again. Each of these asks whether the
// thing is already there and does nothing if it is, so the second time is a
// no-op rather than a duplicate trait and a second bar.

import {
  CODE_ROWS,
  type ActorData,
  type ActorMember,
  type ActorProperty,
  type ActorValue,
} from '../actorData';

/** One block, as much of it as an edit needs to see. */
export interface BlockJson {
  type: string;
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  next?: {block: BlockJson};
  [key: string]: unknown;
}

/** Every block in a chain, from a root down its `next`s. */
export function* down(block: BlockJson | undefined): Generator<BlockJson> {
  for (let at = block; at; at = at.next?.block) {
    yield at;
  }
}

/** The actor's handlers and code, as the workspace's roots. */
export const rootsOf = (data: ActorData | undefined): BlockJson[] =>
  (data?.blocks?.blocks?.blocks ?? []) as BlockJson[];

/** The data with these roots, in this order. */
const withRoots = (data: ActorData, roots: BlockJson[]): ActorData => ({
  ...data,
  blocks: {
    ...data.blocks,
    blocks: {languageVersion: 0, ...data.blocks?.blocks, blocks: roots},
  },
});

/** Whether any block down any root matches — a hat, a drawing, a step. */
export const hasRoot = (
  data: ActorData | undefined,
  matches: (block: BlockJson) => boolean,
): boolean => rootsOf(data).some(root => [...down(root)].some(matches));

const isCode = (block: BlockJson): boolean => CODE_ROWS.has(block.type);

/**
 * Add a root: code after the code, a handler after everything.
 *
 * The editor arranges the roots on open (`tidyLayout`), so the place given
 * is only somewhere clear of the others.
 */
export function addRoot(data: ActorData, block: BlockJson): ActorData {
  const roots = rootsOf(data);
  const lowest = roots.reduce(
    (bottom, root) => Math.max(bottom, Number(root.y ?? 0)),
    0,
  );
  const placed = {...block, x: 20, y: lowest + 220};
  const at = isCode(block) ? roots.filter(isCode).length : roots.length;
  return withRoots(data, [...roots.slice(0, at), placed, ...roots.slice(at)]);
}

/** The data with each root changed in place by `change`, the original untouched. */
export function changeRoots(
  data: ActorData,
  change: (root: BlockJson) => void,
): ActorData {
  const roots = structuredClone(rootsOf(data));
  roots.forEach(change);
  return withRoots(data, roots);
}

/**
 * Declare a variable the actor's blocks refer to: a `VAR` field points into
 * the workspace's list, and a block naming one it lacks loads with a
 * variable Blockly has never heard of.
 */
export function withVariable(data: ActorData, variable: object): ActorData {
  const held = data.blocks?.variables ?? [];
  const id = (variable as {id?: string}).id;
  return held.some(one => (one as {id?: string}).id === id)
    ? data
    : {...data, blocks: {...data.blocks, variables: [...held, variable]}};
}

/** Whether the actor elects `trait`. */
export const wears = (data: ActorData | undefined, trait: string): boolean =>
  (data?.traits ?? []).includes(trait);

/**
 * Elect the traits the actor has not got, in the order given: a learner who
 * already took one keeps it where they put it.
 */
export function electTraits(
  data: ActorData,
  traits: readonly string[],
): ActorData {
  const held = data.traits ?? [];
  const missing = traits.filter(trait => !held.includes(trait));
  return missing.length ? {...data, traits: [...held, ...missing]} : data;
}

/** Whether the actor declares a property of this name. */
export const declares = (data: ActorData | undefined, name: string): boolean =>
  (data?.properties ?? []).some(property => property.name === name);

/** Declare the properties the actor has not got, by name. */
export function withProperties(
  data: ActorData,
  properties: readonly ActorProperty[],
): ActorData {
  const missing = properties.filter(one => !declares(data, one.name));
  return missing.length
    ? {...data, properties: [...(data.properties ?? []), ...missing]}
    : data;
}

/** The value the actor sets with `setter`, if it sets one. */
export const valueOf = (
  data: ActorData | undefined,
  setter: string,
): ActorValue | undefined =>
  (data?.values ?? []).find(value => value.setter === setter);

/**
 * Set a value, in place where the actor sets that one already: two values
 * for one setter is an actor whose second answer silently wins.
 */
export function withValue(data: ActorData, value: ActorValue): ActorData {
  const held = data.values ?? [];
  return {
    ...data,
    values: held.some(one => one.setter === value.setter)
      ? held.map(one => (one.setter === value.setter ? value : one))
      : [...held, value],
  };
}

/** Add blocks and events, each given the first id of its kind not taken. */
export function withMembers(
  data: ActorData,
  members: ReadonlyArray<Omit<ActorMember, 'id'>>,
): ActorData {
  const held = [...(data.members ?? [])];
  for (const member of members) {
    let index = held.length;
    while (held.some(one => one.id === `${member.kind}-${index}`)) {
      index++;
    }
    held.push({...member, id: `${member.kind}-${index}`} as ActorMember);
  }
  return {...data, members: held};
}
