// "Walks and jumps like a platformer" — the control scheme, as blocks.
//
// A PLATFORMER'S CONTROLS ARE AN ASSEMBLY, and that is the whole reason this is
// an enhancement rather than a row on the rule shelf. Three traits out of three
// different rules and one key binding: walking left and right, jumping, and
// hearing the keyboard at all. None of them is a platformer alone, and a
// learner who knows they want a character that runs and jumps should not have
// to know that jumping is a separate rule from walking and that both are
// separate from reading a key.
//
// It is the same assembly the stock "Platformer Player" is (`actors/stock/
// player`), and the difference is WHOSE ACTOR IT IS. Importing that gives a
// project a new actor with a stock drawing and a stock name; this gives the
// controls to the actor the learner already has — their picture, their kind,
// their file. A test holds the two to the same blocks, because written twice
// they would drift and the one that drifted would be the one nobody read.
//
// WHAT IT WRITES, all of it in the actor:
//
//   actors/<target>.actor    define actor named ⟨…⟩
//                              use trait ⟨Jumping#Jumps⟩
//                              use trait ⟨Arrow Keys#Moves Across⟩
//                              use trait ⟨Input#TakesKeyboardInput⟩
//
//                            when ⟨me⟩ presses ⟨space⟩   make ⟨me⟩ jump
//
// GRAVITY IS NOT ELECTED, and its absence is the point rather than an
// oversight. "Jumps" is written against "Affected by Gravity" and a trait
// brings its own dependencies, so electing both would say the same thing twice
// — the same reason the stock Player says neither. The rule still lands in the
// project, which is why `brings` names it: what a learner is told is what
// arrives, not which line said so.
//
// ACROSS, NOT DOWN. `Arrow Keys` has two traits and wanting one is not wanting
// the other (`rules/stock/arrows`): "Moves Across" is left and right, "Moves
// Down" is up and down for a game seen from above. A platformer that elected
// down would have an up arrow that flies and a down arrow that beats gravity
// into the floor, so this elects across and leaves the other for the top-down
// game it was written for.
//
// HANDLED, NOT POLLED. A jump is one moment — the frame the key goes down —
// and asking "is space held?" sixty times a second would jump again on every
// one of them. The walking is polled, inside the rule, because holding a
// direction IS a continuous thing to ask about; which of the two a mechanic
// wants is the mechanic's business and neither is written here.
//
// THE KEY IS A BLOCK IN THEIR FILE, not a setting of the library's. A game that
// jumps with W, or with the up arrow, changes one field in a file it owns —
// which is the same bargain `enhance/climbArrows` strikes for the same reason:
// bindings are exactly the part a game wants to change.
//
// ROOTS, NOT ROWS. A hat takes no previous connection, so it sits beside the
// `define actor` rather than under it (`patch.addRoot`). In a WORLD's own
// `define actor` the hat is a root of the world and names its subject as
// `any ⟨kind⟩`, exactly as the neighbours here do.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, down, hasRoot, holds, type BlockJson} from './patch';

/** Jumping, which brings being pulled down with it. */
const JUMPS = 'Jumping#JumpsTrait';
/** Walking. Across only — down is for a top-down game. */
const WALKS = 'Arrow Keys#MovesAcrossTrait';
/** Hearing the keyboard, which an actor elects rather than simply having. */
const KEYBOARD = 'Input#TakesKeyboardInputTrait';

/** In the order they are written into the file, and read out of it. */
const TRAITS = [JUMPS, WALKS, KEYBOARD];

/** The rules those traits come out of. Gravity arrives under Jumping. */
const RULES = ['Jumping', 'Arrow Keys', 'Input'];

/** What jumping is bound to, until the learner changes the field. */
const JUMP_KEY = 'space';

const PRESSES = 'world_on_Input_PressesEvent';
const MAKE_JUMP = 'world_do_Jumping_MakeJumpAction';

/** Which file holds this actor, and which of its roots defines it. */
const fileOf = (target: EnhanceTarget) =>
  target.block
    ? {
        path: `${target.path}.world`,
        root: {type: 'world_actor', id: target.block},
      }
    : {path: `${target.path}.actor`, root: {type: 'world_actor'}};

/** Whether a `use trait` for `trait` is already in this actor's chain. */
const wears = (
  contents: string,
  trait: string,
  root: {type: string; id?: string},
): boolean =>
  holds(
    contents,
    root,
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/** Who the hat is about: this actor's file, or one kind among a world's. */
const subjectOf = (target: EnhanceTarget) =>
  target.block
    ? {
        block: {
          type: 'world_actor_kind',
          fields: {ACTOR: `local:${target.block}`},
        },
      }
    : undefined;

/**
 * `when ⟨me⟩ presses ⟨space⟩ → make ⟨me⟩ jump`.
 *
 * `VALUE`, not `ACTOR`, for the jump: a designed block's parameter socket is
 * `VALUE` whatever the parameter is called, and written as `ACTOR` the socket
 * is empty and the block asks nobody to jump, in silence.
 *
 * The hat's own `ACTOR` is left OFF for an actor file, where a hat is already
 * about the kind whose file it is in, and named for a world, where it is not.
 *
 * EXPORTED so the stock Platformer Player can be checked against it: the actor
 * and the enhancement assemble the same platformer, and nothing but a test
 * makes them keep agreeing.
 */
export const platformerJumpHandler = (
  target: EnhanceTarget = {kind: 'actor', path: '', name: ''},
): BlockJson => {
  const subject = subjectOf(target);
  return {
    type: PRESSES,
    fields: {FILTER0: JUMP_KEY},
    ...(subject ? {inputs: {ACTOR: subject}} : {}),
    next: {
      block: {
        type: MAKE_JUMP,
        inputs: {VALUE: {block: {type: 'world_this_actor'}}},
      },
    },
  };
};

/**
 * Whether this actor already jumps on the jump key.
 *
 * THE WHOLE HANDLER, not just its hat, which is where this parts company with
 * `enhance/climbArrows`. That one asks only whether a press of the up arrow is
 * bound, because an actor with an up-arrow handler in a game with ladders is
 * climbing with it. Space is not like that: a project may well press it to
 * shoot, or to talk, and reading such a handler as "already jumps" would leave
 * an actor that can never be given a jump — silently, since an enhancement that
 * believes it is applied does nothing at all.
 *
 * SUBJECT AND ALL. In a world the same file holds every actor's handlers, so
 * "somebody presses space" is not the question — "does THIS kind" is.
 */
const jumpsOnKey =
  (target: EnhanceTarget) =>
  (block: BlockJson): boolean => {
    if (block.type !== PRESSES || block.fields?.FILTER0 !== JUMP_KEY) {
      return false;
    }
    const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)
      ?.block?.fields?.ACTOR;
    const mine = target.block
      ? named === `local:${target.block}`
      : named === undefined;
    return mine && [...down(block)].some(row => row.type === MAKE_JUMP);
  };

const jumps = (contents: string, target: EnhanceTarget): boolean =>
  hasRoot(contents, jumpsOnKey(target));

/** Rewrite one file's contents, leaving the rest of the project alone. */
const edit = (
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

export const platformerControlsEnhancement: Enhancement = {
  id: 'platformer-controls',
  // The ACTOR's: every trait and the binding land in its own chain or in a hat
  // about it, and no world is touched. Where it stands and what it stands on
  // are the world's, and are the world's whether this is applied or not.
  subject: 'actor',
  name: 'Walks and jumps like a platformer',
  description:
    'Gives this actor the side-view control scheme: the left and right arrows walk it, space makes it jump, and gravity pulls it down onto whatever is solid. The key is a block in its file, so change it to whatever your game uses. An actor that also elects “Moves Down” will fly rather than fall — that trait is for a game seen from above.',
  brings: [
    'Jumps',
    'Has Gravity',
    'Moves with Arrow Keys',
    'Reads the Keyboard',
  ],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {path, root} = fileOf(target);
    const id = fileIdAt(source, path);
    const contents = id ? source.files[id].contents : '';
    return (
      TRAITS.every(trait => wears(contents, trait, root)) &&
      jumps(contents, target)
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    for (const name of RULES) {
      const rule = STOCK_RULES.find(one => one.name === name);
      if (rule) {
        current = importStockRule(current, rule).source;
      }
    }

    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    if (!id) {
      return current;
    }
    return edit(current, id, contents => {
      let next = contents;
      for (const trait of TRAITS) {
        if (!wears(next, trait, root)) {
          next = append(next, root, [
            {type: 'world_use_trait', fields: {TRAIT: trait}},
          ]);
        }
      }
      if (!jumps(next, target)) {
        // Beside the definition rather than under it: a hat takes no previous
        // connection, and `DisableOrphansPlugin` grays out a top-level block
        // that has one along with everything below it.
        next = addRoot(next, platformerJumpHandler(target));
      }
      return next;
    });
  },
};
