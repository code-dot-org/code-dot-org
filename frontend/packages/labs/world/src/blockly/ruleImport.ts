// The seam between a `use rule` dropdown and the import dialog.
//
// The mechanism is `libraryImport`'s, shared with the other four dropdowns
// that can import something. What is NOT shared is the channel: this has its
// own handler slot and its own sentinel, because `(import…)` here means the
// rule dialog and nothing else, and one channel for all five would carry a
// discriminator standing in for the functions it replaced.

import {importSeam, type ImportHandler} from './libraryImport';

/** The sentinel a `use rule` dropdown carries for its `(import…)` row. */
export const IMPORT_RULE_VALUE = '__import_rule__';

/**
 * Opens the import dialog and resolves with the module path of whatever was
 * imported, or undefined if the learner cancelled.
 */
export type RuleImportHandler = ImportHandler;

const seam = importSeam();

export const setRuleImportHandler = seam.register;
export const requestRuleImport = seam.request;
