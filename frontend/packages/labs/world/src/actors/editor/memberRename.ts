// An actor's own event or block, renamed or deleted across the project
// (specs/ACTOR_BLOCKS_PLAN.md, step 4).
//
// A member's blocks are named after its words, as a property's are after its
// name: `heal by` on `actors/hero` is called by `world_do_ActorsHero_HealByAction`,
// and `is hurt` is heard by `world_on_ActorsHero_IsHurtEvent` and raised by
// `world_emit_…`. So new words are new block types, and every use is
// rewritten to follow them.
//
// A VALUE is matched by its name in two more places. A block that takes more
// than one names a socket for each (`NAME`, or `NAME_X` and `NAME_Y`); and a
// handler reads what its event carries as a local of that name, below its hat
// (specs/EVENT_VALUES_PLAN.md). Both follow a value renamed.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {mapWorkspaces, WORKSPACE_FILE} from '../../blockly/rewriteWorkspaces';
import {designedName, pascal} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import {resolveRuleContents} from '../../rules/ruleReference';
import {viewOf, type ActorMember} from '../actorData';

/** What a member's blocks are named by: `heal by` → `HealByAction`. */
export const memberKey = (member: ActorMember): string =>
  `${pascal(designedName(member.parts))}${
    member.kind === 'event' ? 'Event' : 'Action'
  }`;

/** The block types a member makes: a hat and a raise, or a call. */
export function memberTypes(modulePath: string, member: ActorMember): string[] {
  const at = `${pathSlug(modulePath)}_${memberKey(member)}`;
  return member.kind === 'event'
    ? [`world_on_${at}`, `world_emit_${at}`]
    : [`world_do_${at}`];
}

type Node = Record<string, unknown>;

const isNode = (value: unknown): value is Node =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Every block in a saved workspace, wherever it hangs. */
function eachBlock(value: unknown, visit: (block: Node) => void): void {
  if (Array.isArray(value)) {
    value.forEach(one => eachBlock(one, visit));
    return;
  }
  if (!isNode(value)) {
    return;
  }
  if (typeof value.type === 'string') {
    visit(value);
  }
  for (const held of Object.values(value)) {
    eachBlock(held, visit);
  }
}

/** The files whose code uses the member, by file id. */
export function memberUses(
  source: MultiFileSource,
  modulePath: string,
  member: ActorMember,
): string[] {
  const types = new Set(memberTypes(modulePath, member));
  return Object.entries(source.files)
    .filter(([, file]) => WORKSPACE_FILE.test(file.name))
    .filter(([, file]) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(viewOf(resolveRuleContents(file.contents ?? '')));
      } catch {
        return false;
      }
      let used = false;
      eachBlock(parsed, block => {
        used ||= types.has(block.type as string);
      });
      return used;
    })
    .map(([id]) => id);
}

const valueNames = (member: ActorMember): string[] =>
  member.parts.flatMap(part =>
    part.kind === 'param' ? [String(part.name ?? '')] : [],
  );

/**
 * The project with every use of `before` made a use of `after`: new words,
 * and values renamed in place. The same project when nothing changed.
 *
 * A value is matched by its place among the values, and only when there are
 * as many after as before: one added or taken away is a different design,
 * whose uses say so in their own editors.
 */
export function renameMember(
  source: MultiFileSource,
  modulePath: string,
  before: ActorMember,
  after: ActorMember,
): MultiFileSource {
  if (before.kind !== after.kind || !designedName(after.parts)) {
    return source;
  }
  const fromTypes = memberTypes(modulePath, before);
  const toTypes = memberTypes(modulePath, after);
  const typeOf = new Map(fromTypes.map((type, at) => [type, toTypes[at]]));
  const from = valueNames(before);
  const to = valueNames(after);
  const renamed = new Map(
    from.length === to.length
      ? from.flatMap((name, at) => (name !== to[at] ? [[name, to[at]]] : []))
      : [],
  );
  // Sockets are named for values only when a block takes more than one.
  const sockets = from.length > 1 && to.length > 1 ? renamed : new Map();
  if (
    fromTypes.every((type, at) => type === toTypes[at]) &&
    renamed.size === 0
  ) {
    return source;
  }
  const hat = toTypes[0];
  return mapWorkspaces(source, contents => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(contents);
    } catch {
      return undefined;
    }
    let changed = false;
    eachBlock(parsed, block => {
      const now = typeOf.get(block.type as string);
      if (now === undefined) {
        return;
      }
      if (now !== block.type) {
        block.type = now;
        changed = true;
      }
      if (sockets.size && isNode(block.inputs)) {
        changed = renameSockets(block.inputs, sockets) || changed;
      }
    });
    if (before.kind === 'event' && renamed.size && isNode(parsed)) {
      changed = renameCarried(parsed, hat, renamed) || changed;
    }
    return changed ? JSON.stringify(parsed, null, 2) : undefined;
  });
}

/** A call's or a raise's sockets, renamed after their values. */
function renameSockets(
  inputs: Node,
  renamed: ReadonlyMap<string, string>,
): boolean {
  let changed = false;
  for (const [from, to] of renamed) {
    for (const suffix of ['', '_X', '_Y']) {
      const was = `${from.toUpperCase()}${suffix}`;
      if (was in inputs) {
        inputs[`${to.toUpperCase()}${suffix}`] = inputs[was];
        delete inputs[was];
        changed = true;
      }
    }
  }
  return changed;
}

/**
 * Under each hat of the event, the locals that read a renamed value, made to
 * read the new name: the variable of that name and type, made if the file
 * has none. A variable is shared within a file, so it is the getters that
 * are moved, not the variable renamed.
 */
function renameCarried(
  document: Node,
  hat: string,
  renamed: ReadonlyMap<string, string>,
): boolean {
  const variables = (
    Array.isArray(document.variables) ? document.variables : []
  ) as Array<{id: string; name: string; type?: string}>;
  const byId = new Map(variables.map(one => [one.id, one]));
  const named = (name: string, type: string | undefined) => {
    const found = variables.find(
      one => one.name === name && (one.type ?? '') === (type ?? ''),
    );
    if (found) {
      return found;
    }
    let id = `${name}-carried`;
    for (let n = 2; byId.has(id); n += 1) {
      id = `${name}-carried-${n}`;
    }
    const made = {id, name, ...(type === undefined ? {} : {type})};
    variables.push(made);
    byId.set(id, made);
    document.variables = variables;
    return made;
  };
  let changed = false;
  eachBlock(document, block => {
    if (block.type !== hat || !isNode(block.next)) {
      return;
    }
    eachBlock(block.next, held => {
      const field = isNode(held.fields) ? held.fields.VAR : undefined;
      if (!isNode(field)) {
        return;
      }
      const was = byId.get(field.id as string);
      const name = (was?.name ?? field.name) as string | undefined;
      const to = name === undefined ? undefined : renamed.get(name);
      if (to === undefined) {
        return;
      }
      const variable = named(to, was?.type ?? (field.type as string));
      (held.fields as Node).VAR = {id: variable.id};
      changed = true;
    });
  });
  return changed;
}
