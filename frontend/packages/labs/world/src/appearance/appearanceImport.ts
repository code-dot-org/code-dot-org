// The seam between a `set sprite` / `play animation` dropdown and the picker.
//
// `blockly/ruleImport`'s sibling, on `blockly/libraryImport`'s mechanism, and
// the only one of the five whose request carries an argument.
//
// A SENTINEL PER DROPDOWN rather than one shared, because they pick different
// things: an image, an animation and a backdrop are not interchangeable, and a
// picker that had to ask which one you meant would be asking a question the
// block already answered. One HANDLER for all three, though — the three
// sentinels name one picker opened on a different shelf, which is what the
// kind says and why this seam takes one.

import {importSeam, type ImportHandler} from '../blockly/libraryImport';

/** What a dropdown's `(import…)` row carries. */
export const IMPORT_SPRITE_VALUE = '__import_sprite__';
export const IMPORT_ANIMATION_VALUE = '__import_animation__';
export const IMPORT_BACKGROUND_VALUE = '__import_background__';

/** Which library the picker should open on. */
export type AppearanceKind = 'sprite' | 'animation' | 'background';

/**
 * Opens the picker and resolves with what the field should now hold — a
 * sprite's file name or an animation's id — or undefined if nothing was
 * imported.
 */
export type AppearanceImportHandler = ImportHandler<[kind: AppearanceKind]>;

const seam = importSeam<[kind: AppearanceKind]>();

export const setAppearanceImportHandler = seam.register;
export const requestAppearanceImport = seam.request;
