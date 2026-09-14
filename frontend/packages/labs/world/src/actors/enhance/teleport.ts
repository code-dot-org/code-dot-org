// Teleport pads — the pad, and the two ways of using one.
//
// Every other way across a room in this library is continuous: you walk, you
// fall, you climb. A pad breaks that, and two pads of the same COLOUR are one
// place however far apart they are (`rules/stock/teleport`).
//
// SO A PAD NEEDS NO SECOND ACTOR, which is worth saying because it looks as
// though it should. Pads find each other by their colour rather than by naming
// one another, so two placements of the SAME actor are already a working pair
// — there is nothing to point at, and so nothing to ask.
//
// AND USING ONE IS TWO ROWS, because the rule's own header says it is two
// things: "a player wants to choose: standing on a pad is not using it, or the
// mechanic takes the level away from them. An enemy wants no choice at all,
// which is what makes a room with pads in it unpredictable to move through."
// One writes a key to press; the other writes a boolean. They are different
// edits for different actors, which on this shelf has always meant two rows
// rather than one with a question under it.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {fileIdAt} from '../../runtime/projectFiles';

import {
  edit,
  electTraits,
  fileOf,
  importRules,
  me,
  subjectOf,
  wears,
} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, down, hasRoot, type BlockJson} from './patch';

const PAD = 'Teleport#IsATeleportPadTrait';
const TRAVELS = 'Teleport#UsesTeleportPadsTrait';

/** The key the jetpack level binds, and the one a pad reads as "go". */
const PAD_KEY = 'down arrow';
const PRESSES = 'world_on_Input_PressesEvent';
const USE_PAD = 'world_do_Teleport_UseThePadAction';
const TAKES_ANY = 'world_set_Teleport_TakesAnyPadItTouchesProperty';
const KEYBOARD = 'Input#TakesKeyboardInputTrait';

const contentsOf = (source: MultiFileSource, target: EnhanceTarget) => {
  const {path, root} = fileOf(target);
  const id = fileIdAt(source, path);
  return {contents: id ? source.files[id].contents : '', root};
};

/** Whether the project holds anything that is a pad. */
const somePad = (source: MultiFileSource): boolean =>
  Object.values(source.files).some(file => (file.contents ?? '').includes(PAD));

export const isATeleportPadEnhancement: Enhancement = {
  id: 'teleport-pad',
  subject: 'actor',
  name: 'Is a teleport pad',
  description:
    'Makes this actor a pad: a traveller that uses it is moved to another pad of the same colour, however far away it is. Its colour is a block in its file, and the colour is what pairs them — so put two of these in a map and they are two ends of one door. Three of the same colour is a door with three ends, and a traveller takes whichever one it is not standing on.',
  brings: ['Is a Teleport Pad'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {contents, root} = contentsOf(source, target);
    return wears(contents, PAD, root);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Teleport']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => electTraits(contents, root, [PAD]));
  },
};

/** `when ⟨me⟩ presses ⟨down arrow⟩ → use the pad ⟨me⟩`. */
const useHandler = (target: EnhanceTarget): BlockJson => ({
  type: PRESSES,
  fields: {FILTER0: PAD_KEY},
  ...(target.block ? {inputs: {ACTOR: subjectOf(target)}} : {}),
  next: {block: {type: USE_PAD, inputs: {ACTOR: me()}}},
});

/**
 * Whether this actor already answers the pad key by using a pad.
 *
 * The hat AND what is under it, for the reason `enhance/platformerControls`
 * gives about the space bar: the down arrow is a key a project may well press
 * for something else, and reading such a handler as "already travels" would
 * leave an actor that can never be given the row, in silence.
 */
const usesOnKey =
  (target: EnhanceTarget) =>
  (block: BlockJson): boolean => {
    if (block.type !== PRESSES || block.fields?.FILTER0 !== PAD_KEY) {
      return false;
    }
    const named = (block.inputs?.ACTOR as {block?: BlockJson} | undefined)
      ?.block?.fields?.ACTOR;
    const mine = target.block
      ? named === `local:${target.block}`
      : named === undefined;
    return mine && [...down(block)].some(row => row.type === USE_PAD);
  };

export const usesTeleportPadsEnhancement: Enhancement = {
  id: 'uses-teleport-pads',
  subject: 'actor',
  name: 'Can step onto a teleport pad',
  description:
    'Lets this actor travel by pad, when it chooses to: stand on one and press the down arrow, and it is moved to another pad of the same colour. Standing on a pad is not using it — a mechanic that fires wherever you happen to stand is one that has taken the level away from you. For something that should have no choice, “Is taken by any pad it touches” is the other row.',
  brings: ['Uses Teleport Pads', 'Reads the Keyboard', 'a key to press'],
  offered: (source: MultiFileSource) => somePad(source),
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {contents, root} = contentsOf(source, target);
    return (
      wears(contents, TRAVELS, root) &&
      wears(contents, KEYBOARD, root) &&
      hasRoot(contents, usesOnKey(target))
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Teleport', 'Input']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => {
          const next = electTraits(contents, root, [TRAVELS, KEYBOARD]);
          return hasRoot(next, usesOnKey(target))
            ? next
            : // Beside the definition rather than under it: a hat takes no
              // previous connection, and `DisableOrphansPlugin` grays out a
              // top-level block that has one along with everything below it.
              addRoot(next, useHandler(target));
        });
  },
};

/** `set ⟨takes any pad it touches⟩ of ⟨me⟩ to ⟨true⟩`, under the definition. */
const takesAnyRow = (): BlockJson => ({
  type: TAKES_ANY,
  inputs: {
    ACTOR: me(),
    VALUE: {block: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
  },
});

export const takenByAnyPadEnhancement: Enhancement = {
  id: 'taken-by-any-pad',
  subject: 'actor',
  name: 'Is taken by any pad it touches',
  description:
    'Makes this actor travel the moment it stands on a pad, without being asked — which is what makes a room with pads in it a room nobody can plan a route through. Meant for the things you are avoiding rather than the one you are steering. It will not loop: arriving somewhere does not count as touching, so a traveller has to step off a pad before any pad can take it again.',
  brings: ['Uses Teleport Pads', 'a line saying it does not choose'],
  offered: (source: MultiFileSource) => somePad(source),
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const {contents, root} = contentsOf(source, target);
    return wears(contents, TRAVELS, root) && contents.includes(TAKES_ANY);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Teleport']);
    const {path, root} = fileOf(target);
    const id = fileIdAt(current, path);
    return id === undefined
      ? current
      : edit(current, id, contents => {
          const next = electTraits(contents, root, [TRAVELS]);
          return next.includes(TAKES_ANY)
            ? next
            : append(next, root, [takesAnyRow()]);
        });
  },
};
