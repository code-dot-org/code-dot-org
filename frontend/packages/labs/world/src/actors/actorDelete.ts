// Asking for an actor to be deleted from somewhere that does not own the
// lab's dialogs: the Actor Palette's Delete (specs/SHELL_PLAN.md, step 2).
//
// The file acts' host owns the prompts, as it owns the Actor Creator
// (`create/actorCreate`), so they answer: they say where the actor is used,
// ask, and take it and its placements out of the project
// (`files/actorUses`). A request resolves with the actor's module path when
// it was deleted, and with nothing when the learner kept it or nobody is
// listening.

import {importSeam} from '../blockly/libraryImport';

const seam = importSeam<[path: string]>();

export const setActorDeleteHandler = seam.register;
export const requestActorDelete = seam.request;
