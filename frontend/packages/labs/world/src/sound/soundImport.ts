// The seam between a `play sound` dropdown and the sound library.
//
// `blockly/ruleImport`'s sibling, on `blockly/libraryImport`'s mechanism, and
// a channel of its own for the reason given there.

import {importSeam, type ImportHandler} from '../blockly/libraryImport';

/** What a `play sound` dropdown's `(import…)` row carries. */
export const IMPORT_SOUND_VALUE = '__import_sound__';

/**
 * Opens the sound library and resolves with what the field should now hold —
 * the imported file's name — or undefined if nothing was imported.
 */
export type SoundImportHandler = ImportHandler;

const seam = importSeam();

export const setSoundImportHandler = seam.register;
export const requestSoundImport = seam.request;
