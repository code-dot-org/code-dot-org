// The four things every actor enhancement does, said once.
//
// An enhancement that edits an ACTOR always needs the same four answers: which
// file holds it and which root defines it, who a hat it adds is about, whether
// a trait is already elected, and how to rewrite one file without disturbing
// the rest of the project. `health`, `collects`, `climbArrows` and
// `platformerControls` each answer them separately, in about forty lines
// apiece, and the enemy rows would have made seven copies of the same forty.
//
// NEW CODE LIVES HERE; the four that predate it still carry their own. That is
// a half-migration on purpose rather than by neglect — moving them is a change
// to four working files with no behavior in it, and it belongs in its own
// commit rather than smuggled into this one. Anything added from here on
// should use these, and the old copies should come across the next time one of
// those files is opened for another reason.
//
// `fileOf` AND `subjectOf` ARE ONE-LINERS NOW, and stay: there were two kinds
// of actor, and a patch asked these two questions rather than knowing the
// answer. Every actor is a file, and a row that still asks is a row that will
// not have to be opened if the answer changes again.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';

import type {EnhanceTarget} from './enhancements';
import {append, holds, type BlockJson} from './patch';

/** Which root a patch is about — `patch.RootPick`, named for what it picks. */
export interface ActorRoot {
  type: string;
  id?: string;
}

/** `this actor` — inside a hat, the actor the event fired for. */
export const me = () => ({block: {type: 'world_this_actor'}});

/** `any ⟨kind⟩`, as a socket's contents. */
export const kindOf = (actor: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: actor}},
});

/** Which file holds this actor, and which of its roots defines it. */
export const fileOf = (
  target: EnhanceTarget,
): {path: string; root: ActorRoot} => ({
  path: `${target.path}.actor`,
  root: {type: 'world_actor'},
});

/**
 * Who a hat this adds is about.
 *
 * In an actor's own file a hat is already about the kind whose file it is in,
 * and `this actor` is what fills the socket. In a world the same file holds
 * every actor's hats, so it has to say which kind — otherwise the coin patrols
 * too.
 */
export const subjectOf = () => me();

/** Whether a `use trait` for `trait` is already in this actor's chain. */
export const wears = (
  contents: string,
  trait: string,
  root: ActorRoot,
): boolean =>
  holds(
    contents,
    root,
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/**
 * Elect the traits this actor has not got, in the order given.
 *
 * Only the missing ones: a learner who already took a trait by hand keeps the
 * row they wrote, in the place they wrote it, and enhancing is a no-op for
 * that part rather than a second identical line (`patch`).
 */
export const electTraits = (
  contents: string,
  root: ActorRoot,
  traits: readonly string[],
): string => {
  let next = contents;
  for (const trait of traits) {
    if (!wears(next, trait, root)) {
      next = append(next, root, [
        {type: 'world_use_trait', fields: {TRAIT: trait}} as BlockJson,
      ]);
    }
  }
  return next;
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
