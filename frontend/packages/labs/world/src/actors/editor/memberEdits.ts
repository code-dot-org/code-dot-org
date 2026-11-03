// What the member page changes in an actor's data (specs/ACTOR_BLOCKS_PLAN.md,
// step 3).
//
// Pure, as `actorEdits` is: each edit takes the data or the parts and gives
// them back changed. Parts are edited as they are ARRANGED, breaks that end
// nothing included; what is written to the data is settled (`designParts`).

import {settledParts} from '../../blockly/designParts';
import {MEMBER_HEAD, MEMBER_HEAD_ID} from '../../blockly/pageHeads';
import {designedName} from '../../blockly/ruleMeta';
import {
  type ActorData,
  type ActorMember,
  type ActorMemberPart,
} from '../actorData';

/** `item` without `key`, typed as such. */
export function without<T extends object, K extends keyof T>(
  item: T,
  key: K,
): Omit<T, K> {
  const copy = {...item};
  delete copy[key];
  return copy;
}

/** The value types a design may take, as the palette offers them. */
export const VALUE_TYPES: ReadonlyArray<{type: string; label: string}> = [
  {type: 'number', label: 'Number'},
  {type: 'string', label: 'Text'},
  {type: 'boolean', label: 'True or false'},
  {type: 'vector', label: 'Vector'},
  {type: 'actor', label: 'Actor'},
  {type: 'list', label: 'List'},
  {type: 'kind', label: 'Kind'},
  {type: 'map', label: 'Map'},
];

/** A value's name when it is made, by type: the designer's own defaults. */
const DEFAULT_NAMES: Readonly<Record<string, string>> = {
  number: 'amount',
  string: 'text',
  boolean: 'flag',
  vector: 'vec',
  actor: 'other',
  list: 'items',
  kind: 'kind',
  map: 'map',
};

/** What a part is called in words: a type's label, or "Word" and "Line break". */
export function partKindLabel(part: ActorMemberPart): string {
  if (part.kind === 'label') {
    return 'word';
  }
  if (part.kind === 'row') {
    return 'line break';
  }
  const known = VALUE_TYPES.find(one => one.type === part.type);
  return `${(known?.label ?? 'choice').toLowerCase()} value`;
}

/** A fresh id: unique among the actor's members, as a block id must be. */
const freshId = (kind: string, taken: ReadonlySet<string>): string => {
  for (let n = 1; ; n += 1) {
    const id = `${kind}-${n}`;
    if (!taken.has(id)) {
      return id;
    }
  }
};

/** A new member, phrased so it reads as something. */
export function newMember(
  data: ActorData,
  kind: ActorMember['kind'],
): ActorMember {
  const taken = new Set((data.members ?? []).map(member => member.id));
  return {
    id: freshId(kind, taken),
    kind,
    parts: [
      {kind: 'label', text: kind === 'event' ? 'happens' : 'do something'},
    ],
  };
}

export const addMember = (data: ActorData, member: ActorMember): ActorData => ({
  ...data,
  members: [...(data.members ?? []), member],
});

/** The member written over the one with its id, its parts settled. */
export function setMember(data: ActorData, member: ActorMember): ActorData {
  const settled = {...member, parts: settledParts(member.parts)};
  return {
    ...data,
    members: (data.members ?? []).map(one =>
      one.id === member.id ? settled : one,
    ),
  };
}

export function removeMember(data: ActorData, id: string): ActorData {
  const members = (data.members ?? []).filter(member => member.id !== id);
  // ActorData has an index signature, which `Omit` cannot keep apart from
  // its named keys.
  const rest = without(data, 'members') as ActorData;
  return members.length ? {...rest, members} : rest;
}

/** A new part of the given kind: a word, a break, or a value of `type`. */
export function newPart(
  what: 'label' | 'row' | string,
  parts: readonly ActorMemberPart[],
): ActorMemberPart {
  if (what === 'label') {
    return {kind: 'label', text: ''};
  }
  if (what === 'row') {
    return {kind: 'row'};
  }
  const wanted = DEFAULT_NAMES[what] ?? 'value';
  const names = new Set(
    parts.flatMap(part =>
      part.kind === 'param' ? [String(part.name ?? '').toLowerCase()] : [],
    ),
  );
  let name = wanted;
  for (let n = 2; names.has(name.toLowerCase()); n += 1) {
    name = `${wanted}${n}`;
  }
  return {kind: 'param', type: what, var: '', name};
}

// Arrangements by place: a part list, or anything kept in step with one.

export const insertAt = <T>(items: readonly T[], at: number, item: T): T[] => [
  ...items.slice(0, at),
  item,
  ...items.slice(at),
];

export function moveTo<T>(items: readonly T[], from: number, to: number): T[] {
  const moved = [...items];
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);
  return moved;
}

/** Which line of the block each part is on, counting from 1. */
export function linesOf(parts: readonly ActorMemberPart[]): number[] {
  let line = 1;
  return parts.map(part => {
    const here = line;
    if (part.kind === 'row') {
      line += 1;
    }
    return here;
  });
}

/** What is wrong with a design, said where it is wrong. */
export interface DesignProblems {
  /** Of the whole design: no words, or reading as another member does. */
  design?: string;
  /** Of a value, by its place among the parts. */
  values: ReadonlyMap<number, string>;
}

export function designProblems(
  parts: readonly ActorMemberPart[],
  member: ActorMember,
  others: readonly ActorMember[],
): DesignProblems {
  const values = new Map<number, string>();
  const seen = new Map<string, number>();
  parts.forEach((part, at) => {
    if (part.kind !== 'param') {
      return;
    }
    const name = String(part.name ?? '').trim();
    if (!name) {
      values.set(at, 'A value needs a name.');
      return;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      values.set(at, `Two values are called ${name}; rename one.`);
    }
    seen.set(key, at);
  });
  const name = designedName(parts);
  if (!name) {
    return {design: 'A design needs a word in it.', values};
  }
  const twin = others.find(
    one =>
      one.id !== member.id &&
      one.kind === member.kind &&
      designedName(one.parts) === name,
  );
  return twin
    ? {
        design: `Another ${member.kind} already reads “${name}”; change a word.`,
        values,
      }
    : {values};
}

/**
 * The workspace's variables named as an event's values are. An event's value
 * keeps the variable its declaration was written with, and the metadata
 * names it by that variable (`ownProperties.designedEvent`); a value the
 * page made has none, and is named by its part.
 */
export function withValueNames(data: ActorData): ActorData {
  const names = new Map<string, string>();
  for (const member of data.members ?? []) {
    for (const part of member.parts) {
      if (part.kind === 'param' && part.var && part.name) {
        names.set(part.var, String(part.name));
      }
    }
  }
  const variables = data.blocks?.variables as
    | Array<{id: string; name: string}>
    | undefined;
  if (
    !variables?.some(one => names.has(one.id) && names.get(one.id) !== one.name)
  ) {
    return data;
  }
  return {
    ...data,
    blocks: {
      ...data.blocks,
      variables: variables.map(one =>
        names.has(one.id) ? {...one, name: names.get(one.id)!} : one,
      ),
    },
  };
}

/**
 * The workspace a block's implementation is written on: the block being made
 * at its head (`memberHead`), what it does below it, and the actor's
 * variables, which hold each value's.
 */
export function memberDocument(data: ActorData, member: ActorMember): string {
  const variables = data.blocks?.variables;
  return JSON.stringify(
    {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: MEMBER_HEAD,
            id: MEMBER_HEAD_ID,
            x: 20,
            y: 20,
            extraState: {parts: member.parts},
            ...(member.body ? {next: {block: member.body}} : {}),
          },
        ],
      },
      ...(variables ? {variables} : {}),
    },
    null,
    2,
  );
}

/**
 * The data with what that workspace saved: the member's parts and what it
 * does, and the actor's variables. The parts come from the workspace, which
 * gives a new value its variable; what the block is for and whether it is
 * shown stay as the page has them. What the head's sockets hold is not read:
 * those are its getters, made for the page.
 */
export function withMemberDocument(
  data: ActorData,
  id: string,
  saved: string,
): ActorData {
  let document: {
    blocks?: {blocks?: SavedHead[]};
    variables?: NonNullable<ActorData['blocks']>['variables'];
  };
  try {
    document = JSON.parse(saved);
  } catch {
    return data;
  }
  const head = (document.blocks?.blocks ?? []).find(
    root => root.type === MEMBER_HEAD,
  );
  const current = (data.members ?? []).find(member => member.id === id);
  const parts = head?.extraState?.parts;
  if (!current || !parts) {
    return data;
  }
  const body = head.next?.block;
  const member: ActorMember = {
    ...without(current, 'body'),
    parts,
    ...(body ? {body} : {}),
  };
  return {
    ...data,
    ...(document.variables
      ? {blocks: {...data.blocks, variables: document.variables}}
      : {}),
    members: (data.members ?? []).map(one => (one.id === id ? member : one)),
  };
}

/** A member head as a workspace saves it, as far as it is read. */
interface SavedHead {
  type: string;
  extraState?: {parts?: ActorMemberPart[]};
  next?: {block?: ActorMember['body']};
}
