// The seam between an ACTOR'S OWN menu and the enhancement shelf.
//
// `actors/actorImport`'s sibling, on the same mechanism and for the same
// reason (`blockly/libraryImport`): the menu is not where the dialogs live, so
// it asks, and whatever is mounted answers. A channel of its own because
// enhancing is not importing — nothing here hands a field a value, and the
// answer is only whether something happened.
//
// IT CARRIES THE ACTOR, which is what makes this a different shape of question
// from an import. Enhancing is done TO something, so the thing it is done to is
// chosen the way a rename or a delete chooses one: on that actor's own row,
// before any dialog opens. What is left to ask is only WHAT to give it.
//
// A `.actor` file's path today. The next place to ask from is the `define
// actor` block itself, which would also reach an actor a world defines for
// itself and has no file of its own — a second kind of address for the same
// question, and the reason this takes a target rather than reading one.

import {importSeam} from '../../blockly/libraryImport';

import type {EnhanceTarget} from './enhancements';

const seam = importSeam<[EnhanceTarget]>();

export const setActorEnhanceHandler = seam.register;
export const requestActorEnhance = seam.request;
