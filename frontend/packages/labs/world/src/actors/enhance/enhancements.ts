// The enhancement shelf: what a project can give something it already has.
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
//
// A SUBJECT, AND SOMETIMES AN ARGUMENT, which the camera taught. "Health and a
// bar above it" edits the ACTOR: the trait, the property and the handlers all
// land in its file, and the bar it places is a companion it makes. "A camera
// that follows an actor" edits no actor at all — it defines a camera in the
// WORLD and points it at one, so the actor is a value in the patch rather than
// the thing being patched.
//
// Reading that as an actor enhancement was wrong in the way that matters: it
// was asked for from the actor's own sparkles, and answering it wrote nothing into
// the file the learner was looking at. So an enhancement says whose it is
// (`subject`), and one that needs to name something else ASKS for it — which
// is a question the shelf puts under the row, rather than a fact it guesses
// from where it was opened.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {cameraFollowEnhancement} from './cameraFollow';
import {climbArrowsEnhancement} from './climbArrows';
import {collectsEnhancement} from './collects';
import {healthEnhancement} from './health';
import {scoreboardEnhancement} from './scoreboard';
import {typesOutTextEnhancement} from './typesOutText';

/** What one enhancement is. */
export interface Enhancement {
  /** Its id, which is what a lesson or a test names it by. */
  id: string;
  /**
   * WHOSE it is: the thing whose files this edits, and so where it is asked
   * for. An actor's sparkles offer the actor ones; a world's offers the world
   * ones.
   */
  subject: 'actor' | 'world';
  /** What it is called, on the shelf — a sentence about the thing, not a file. */
  name: string;
  /** One line on what it gives that thing. */
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
  /**
   * What else it needs before it can be done, if anything.
   *
   * A camera has to follow SOMEBODY, and which actor that is cannot be read
   * off the world it is being added to. The shelf asks, under the row.
   */
  asks?: EnhanceQuestion;
  /** Whether the target already has it, which makes enhancing a no-op. */
  applied(
    source: MultiFileSource,
    target: EnhanceTarget,
    answer?: string,
  ): boolean;
  /** Do it: rules imported, actors placed, blocks appended. */
  apply(
    source: MultiFileSource,
    target: EnhanceTarget,
    answer?: string,
  ): MultiFileSource;
}

/** A question an enhancement asks before it can be applied. */
export interface EnhanceQuestion {
  /** What the row calls it — "Following". */
  label: string;
  /** The choices, read from the project as it stands. */
  options(
    source: MultiFileSource,
    target: EnhanceTarget,
  ): readonly EnhanceChoice[];
}

/** One answer to that question: what it is called, and what it means. */
export interface EnhanceChoice {
  /** What the patch writes — an actor reference, for the camera. */
  value: string;
  /** What the button says. */
  name: string;
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
  /** Which kind of thing this is, and so which enhancements are on offer. */
  kind: 'actor' | 'world';
  /**
   * The module path of the FILE it lives in: `actors/player` for an actor with
   * a file, `worlds/main` for a world or for an actor that world defines.
   */
  path: string;
  /** The `define actor` block, for a world's own actor; absent for a file. */
  block?: string;
  /** What it calls itself, for the words on the dialog. */
  name: string;
}

export const ENHANCEMENTS: readonly Enhancement[] = [
  // An actor's, then a world's, in the order a game is built up in: what the
  // actor can do, then what the screen says about it.
  healthEnhancement,
  collectsEnhancement,
  climbArrowsEnhancement,
  typesOutTextEnhancement,
  cameraFollowEnhancement,
  scoreboardEnhancement,
];

/** One by id, for a caller that knows which it wants. */
export const enhancementById = (id: string): Enhancement | undefined =>
  ENHANCEMENTS.find(one => one.id === id);

/** The ones on offer for a thing of this kind. */
export const enhancementsFor = (
  target: EnhanceTarget,
): readonly Enhancement[] =>
  ENHANCEMENTS.filter(one => one.subject === target.kind);
