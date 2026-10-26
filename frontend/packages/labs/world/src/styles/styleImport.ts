// The seam between the `use theme` dropdown and the import dialog.
//
// `effectImport`'s sibling on the same mechanism: picking `(import…)` has to
// open a dialog, write a file into the project, and come back with the new
// module path. A channel of its own, for the reason given there.

import {importSeam, type ImportHandler} from '../blockly/libraryImport';

/** The sentinel the `use theme` dropdown carries for its `(import…)` row. */
export const IMPORT_STYLE_VALUE = '__import_style__';

/**
 * Opens the theme picker and resolves with the module path of whatever was
 * imported, or undefined if the learner canceled.
 */
export type StyleImportHandler = ImportHandler;

const seam = importSeam();

export const setStyleImportHandler = seam.register;
export const requestStyleImport = seam.request;
