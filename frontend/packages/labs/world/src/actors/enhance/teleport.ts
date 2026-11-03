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

import type {ActorValue} from '../actorData';

import {actorAt, editActor, importRules, me} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import {
  addRoot,
  down,
  electTraits,
  hasRoot,
  valueOf,
  wears,
  withValue,
  type BlockJson,
} from './patch';

const PAD = 'Teleport#IsATeleportPadTrait';
const TRAVELS = 'Teleport#UsesTeleportPadsTrait';

/** The key the jetpack level binds, and the one a pad reads as "go". */
const PAD_KEY = 'down arrow';
const PRESSES = 'world_on_Input_PressesEvent';
const USE_PAD = 'world_do_Teleport_UseThePadAction';
const TAKES_ANY = 'world_set_Teleport_TakesAnyPadItTouchesProperty';
const KEYBOARD = 'Input#TakesKeyboardInputTrait';

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
    const actor = actorAt(source, target);
    return wears(actor, PAD);
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Teleport']);
    return editActor(current, target, data => electTraits(data, [PAD]));
  },
};

/** `when ⟨me⟩ presses ⟨down arrow⟩ → use the pad ⟨me⟩`. */
const useHandler = (): BlockJson => ({
  type: PRESSES,
  fields: {FILTER0: PAD_KEY},
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
  () =>
  (block: BlockJson): boolean => {
    if (block.type !== PRESSES || block.fields?.FILTER0 !== PAD_KEY) {
      return false;
    }
    // A kind named means a world's handler, not this actor's own.
    const named = block.fields?.SUBJECT || undefined;
    return (
      named === undefined && [...down(block)].some(row => row.type === USE_PAD)
    );
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
    const actor = actorAt(source, target);
    return (
      wears(actor, TRAVELS) &&
      wears(actor, KEYBOARD) &&
      hasRoot(actor, usesOnKey())
    );
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Teleport', 'Input']);
    return editActor(current, target, data => {
      const next = electTraits(data, [TRAVELS, KEYBOARD]);
      return hasRoot(next, usesOnKey()) ? next : addRoot(next, useHandler());
    });
  },
};

/** `set ⟨takes any pad it touches⟩ of this actor to ⟨true⟩`. */
const TAKES_ANY_VALUE: ActorValue = {
  setter: TAKES_ANY,
  type: 'boolean',
  value: true,
};

export const takenByAnyPadEnhancement: Enhancement = {
  id: 'taken-by-any-pad',
  subject: 'actor',
  name: 'Is taken by any pad it touches',
  description:
    'Makes this actor travel the moment it stands on a pad, without being asked — which is what makes a room with pads in it a room nobody can plan a route through. Meant for the things you are avoiding rather than the one you are steering. It will not loop: arriving somewhere does not count as touching, so a traveller has to step off a pad before any pad can take it again.',
  brings: ['Uses Teleport Pads', 'a line saying it does not choose'],
  offered: (source: MultiFileSource) => somePad(source),
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const actor = actorAt(source, target);
    return wears(actor, TRAVELS) && valueOf(actor, TAKES_ANY) !== undefined;
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    const current = importRules(source, ['Teleport']);
    return editActor(current, target, data => {
      const next = electTraits(data, [TRAVELS]);
      return valueOf(next, TAKES_ANY) ? next : withValue(next, TAKES_ANY_VALUE);
    });
  },
};
