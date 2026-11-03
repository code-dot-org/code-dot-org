// What every actor enhancement does to the project, said once: find the
// actor's file, read its data, rewrite it, and copy in the rules its traits
// come from. What it does to the data is `patch`.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';
import {isActorData, type ActorData} from '../actorData';

import type {EnhanceTarget} from './enhancements';

/** `this actor` — inside a hat, the actor the event fired for. */
export const me = () => ({block: {type: 'world_this_actor'}});

/** `any ⟨kind⟩`, as a socket's contents. */
export const kindOf = (actor: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: actor}},
});

/** The file that holds this actor. */
export const pathOf = (target: EnhanceTarget): string => `${target.path}.actor`;

/** The data an actor's file holds, as written. */
const parsed = (contents: string): ActorData | undefined => {
  try {
    const held = JSON.parse(contents) as unknown;
    return isActorData(held) ? held : undefined;
  } catch {
    return undefined;
  }
};

/** The actor's data, or nothing when the project has no such actor. */
export const actorAt = (
  source: MultiFileSource,
  target: EnhanceTarget,
): ActorData | undefined => {
  const id = fileIdAt(source, pathOf(target));
  return id === undefined ? undefined : parsed(source.files[id].contents);
};

/**
 * Copy the stock rules these traits come out of into the project.
 *
 * By NAME, which is what a `use trait` reference is keyed by — and what the
 * rule calls itself rather than which file it ships in. Requirements come
 * along on their own (`importStockRule`), so a rule written against three
 * others is still one name here.
 */
export const importRules = (
  source: MultiFileSource,
  names: readonly string[],
): MultiFileSource => {
  let current = source;
  for (const name of names) {
    const rule = STOCK_RULES.find(one => one.name === name);
    if (rule) {
      current = importStockRule(current, rule).source;
    }
  }
  return current;
};

/** Rewrite one actor's data, leaving the rest of the project alone. */
export const editActor = (
  source: MultiFileSource,
  target: EnhanceTarget,
  change: (data: ActorData) => ActorData,
): MultiFileSource => {
  const id = fileIdAt(source, pathOf(target));
  const data = id === undefined ? undefined : parsed(source.files[id].contents);
  if (id === undefined || !data) {
    return source;
  }
  const next = change(data);
  return next === data
    ? source
    : edit(source, id, () => JSON.stringify(next, null, 2));
};

/** Rewrite one file's contents, leaving the rest of the project alone. */
export const edit = (
  source: MultiFileSource,
  id: string,
  change: (contents: string) => string,
): MultiFileSource => ({
  ...source,
  files: {
    ...source.files,
    [id]: {...source.files[id], contents: change(source.files[id].contents)},
  },
});
