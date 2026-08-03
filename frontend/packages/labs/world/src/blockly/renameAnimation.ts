// Renaming an animation, everywhere the name is.
//
// An animation is referred to by the id it is filed under inside a `.anim`
// (`{"animations": {"coinSpin": …}}`), and a block that plays one holds that id
// in an `ANIMATION` field — the `play animation` block, and the appearance
// trait's animation parameter. Nothing records which file an id came from: the
// dropdown offers every id the project defines, and `playAnimation` looks one up
// by id at runtime. That is what makes the id load-bearing, and what makes
// renaming one in the animation editor an edit to the whole project rather than
// to one file.
//
// The same shape as a rule's rename (renameRule), over the same walk
// (rewriteWorkspaces), and for the same reason: "coinSpin" appears in a `log`
// message and a sprite's file name too, and a text substitution cannot tell
// those from a reference.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  mapWorkspaces,
  rewriteWorkspace,
  WORKSPACE_FILE,
} from './rewriteWorkspaces';

/** The field an animation id is held in, wherever a block names one. */
const ANIMATION_FIELD = 'ANIMATION';

/** Rewrite one saved workspace, renaming plays of `from` to `to`. */
export function renameAnimationReferences(
  contents: string,
  from: string,
  to: string,
): string | undefined {
  return rewriteWorkspace(contents, {
    fields(fields) {
      if (fields[ANIMATION_FIELD] === from) {
        fields[ANIMATION_FIELD] = to;
      }
    },
  });
}

/**
 * The project with every play of the animation `from` renamed to `to`.
 *
 * Only saved workspaces are touched. A `.js` file that calls
 * `WorldLab.playAnimation(actor, 'coinSpin')` is code, and its strings are not
 * this transform's to rewrite — the same line the rule rename draws.
 *
 * Returns the same source object when nothing played it.
 */
export function renameAnimationInSource(
  source: MultiFileSource,
  from: string,
  to: string,
): MultiFileSource {
  return mapWorkspaces(source, contents =>
    renameAnimationReferences(contents, from, to),
  );
}

/**
 * Which `.anim` files define each animation id, by path.
 *
 * An id defined in two files is a reference with two meanings — `play
 * animation` cannot say which, and neither can a rename. The editor asks this
 * both to refuse creating such an id and to know whether an existing one is
 * safe to carry.
 */
export function animationIdOwners(
  files: Record<string, string>,
): Record<string, string[]> {
  const owners: Record<string, string[]> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.anim')) {
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(contents);
    } catch {
      continue; // Mid-edit or not JSON: it defines nothing until it parses.
    }
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as {type?: unknown}).type !== 'animation'
    ) {
      continue;
    }
    const animations = (parsed as {animations?: unknown}).animations;
    if (typeof animations !== 'object' || animations === null) {
      continue;
    }
    for (const id of Object.keys(animations)) {
      (owners[id] ??= []).push(path);
    }
  }
  return owners;
}

/**
 * Which files play a given animation, by path.
 *
 * What deleting one would strand. A block holds an id and nothing else, so a
 * play whose animation has gone is a block that quietly stops working — the
 * learner is owed the list before they decide, not a mystery afterwards.
 */
export function animationPlayedIn(
  files: Record<string, string>,
  id: string,
): string[] {
  const playing: string[] = [];
  for (const [path, contents] of Object.entries(files)) {
    if (!WORKSPACE_FILE.test(path)) {
      continue;
    }
    // The same structural test the rename uses, asked without rewriting: a
    // reference is an ANIMATION field holding this id, not the word appearing
    // in a log message or a sprite's file name.
    if (renameAnimationReferences(contents, id, `${id}\u0000`) !== undefined) {
      playing.push(path);
    }
  }
  return playing.sort();
}
