// The seam between a SCREEN dropdown and the stock-screen picker.
//
// `actors/actorImport`'s sibling, on `blockly/libraryImport`'s mechanism.

import {importSeam, type ImportHandler} from '../blockly/libraryImport';

/** The sentinel a SCREEN dropdown carries for its `(import…)` row. */
export const IMPORT_SCREEN_VALUE = '__import_screen__';

export type ScreenImportHandler = ImportHandler;

const seam = importSeam();
export const setScreenImportHandler = seam.register;
export const requestScreenImport = seam.request;
