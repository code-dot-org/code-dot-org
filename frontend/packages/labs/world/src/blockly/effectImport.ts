// The seam between an effect dropdown and the import dialog.
//
// `ruleImport`'s sibling, on `libraryImport`'s mechanism: picking `(import…)`
// has to open a dialog, write a file into the project, and come back with the
// new module path. A channel of its own, for the reason given there.

import {importSeam, type ImportHandler} from './libraryImport';

/** The sentinel a dropdown carries for its `(import…)` row. */
export const IMPORT_EFFECT_VALUE = '__import_effect__';

/**
 * Opens the import dialog and resolves with the module path of whatever was
 * imported, or undefined if the learner cancelled.
 */
export type EffectImportHandler = ImportHandler;

const seam = importSeam();

export const setEffectImportHandler = seam.register;
export const requestEffectImport = seam.request;
