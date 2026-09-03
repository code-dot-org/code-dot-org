// The enhancement shelf: what a project can give an actor it already has.
//
// AN ENHANCEMENT IS NOT AN IMPORT, and the Health Bar is what made the
// difference obvious. Importing one gives a project a file; what a learner
// wanted was a bar ABOUT something — health on the actor, a bar over its head,
// and the line pointing one at the other. Three edits across three files, none
// of which is right without the others, and all of which the bar's own
// description had to explain in prose because nothing in the lab could do it.
//
// So the test for whether something belongs here: it takes MORE THAN ONE EDIT,
// or it needs a companion actor, or it needs a line aiming two things at each
// other. Anything that is only "elect this trait" belongs on the rule shelf,
// which already offers exactly that.
//
// WHAT IT LEAVES BEHIND IS A PROJECT. Every edit is ordinary blocks in files
// the learner owns (`./patch`), so an enhancement is a shortcut through work
// they could have done by hand — never a thing the library keeps a hold of.
// Nothing marks an enhanced actor as enhanced; there is nothing to un-enhance
// but blocks to delete.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {healthEnhancement} from './health';

/** What one enhancement is. */
export interface Enhancement {
  /** Its id, which is what a lesson or a test names it by. */
  id: string;
  /** What it is called, on the shelf — a sentence about the actor, not a file. */
  name: string;
  /** One line on what it gives an actor. */
  description: string;
  /**
   * What else lands in the project, in words a learner reads.
   *
   * The same promise the import dialogs make with "Also adds": an enhancement
   * writes rules, actors and blocks into files, and a learner who is about to
   * let it should be told what it will touch.
   */
  brings: readonly string[];
  /**
   * Whether this actor can take it, and why not when it cannot.
   *
   * A Health Bar cannot be given a health bar — it would ride above itself and
   * show its own empty health — and saying so on the row is better than
   * leaving a learner to find out.
   */
  refuse?(target: EnhanceTarget): string | undefined;
  /** Whether the target already has it, which makes enhancing a no-op. */
  applied(source: MultiFileSource, target: EnhanceTarget): boolean;
  /** Do it: rules imported, actors placed, blocks appended. */
  apply(source: MultiFileSource, target: EnhanceTarget): MultiFileSource;
}

/**
 * The actor an enhancement is being given to.
 *
 * TWO KINDS OF ADDRESS, because there are two kinds of actor. Most have a file
 * of their own and are named by its module path. An actor a WORLD defines for
 * itself has no file — it is a `define actor` block among the world's own
 * roots — so it is named by the world plus the block, which is how everything
 * else in the lab names one (`blockly/localActors`).
 */
export interface EnhanceTarget {
  /**
   * The module path of the FILE it lives in: `actors/player` for an actor with
   * a file, `worlds/main` for one a world defines.
   */
  path: string;
  /** The `define actor` block, for a world's own actor; absent for a file. */
  block?: string;
  /** What it calls itself, for the words on the dialog. */
  name: string;
}

export const ENHANCEMENTS: readonly Enhancement[] = [healthEnhancement];

/** One by id, for a caller that knows which it wants. */
export const enhancementById = (id: string): Enhancement | undefined =>
  ENHANCEMENTS.find(one => one.id === id);
