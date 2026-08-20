// The seam between an ACTOR dropdown and the stock-actor picker.
//
// `blockly/ruleImport`'s sibling, on `blockly/libraryImport`'s mechanism, and
// a channel of its own for the reason given there.

import {importSeam, type ImportHandler} from '../blockly/libraryImport';

/** The sentinel an ACTOR dropdown carries for its `(import…)` row. */
export const IMPORT_ACTOR_VALUE = '__import_actor__';

/**
 * Opens the picker and resolves with the module path of whatever was imported,
 * or undefined if the learner cancelled.
 */
export type ActorImportHandler = ImportHandler;

const seam = importSeam();

export const setActorImportHandler = seam.register;
export const requestActorImport = seam.request;
