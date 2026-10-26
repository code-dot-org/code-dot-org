// The seam between a MAP dropdown and the stock-map picker.
//
// `actors/actorImport`'s sibling, on `blockly/libraryImport`'s mechanism.

import {importSeam, type ImportHandler} from '../blockly/libraryImport';

/** The sentinel a MAP dropdown carries for its `(import…)` row. */
export const IMPORT_MAP_VALUE = '__import_map__';

export type MapImportHandler = ImportHandler;

const seam = importSeam();
export const setMapImportHandler = seam.register;
export const requestMapImport = seam.request;
