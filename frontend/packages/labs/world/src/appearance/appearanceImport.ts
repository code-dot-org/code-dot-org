// The seam between a `set sprite` / `play animation` dropdown and the picker.
//
// The same shape as `ruleImport` and `effectImport`, and for the same reason: a
// Blockly field cannot open a React dialog or write a file, and the registries
// it can reach are plain module state by design. The field asks through a
// handler the editor registers while it is mounted.
//
// A sentinel per dropdown rather than one shared, because they pick different
// things: an image, an animation and a backdrop are not interchangeable, and a
// picker that had to ask which one you meant would be asking a question the
// block already answered.

/** What a dropdown's `(import…)` row carries. */
export const IMPORT_SPRITE_VALUE = '__import_sprite__';
export const IMPORT_ANIMATION_VALUE = '__import_animation__';
export const IMPORT_BACKGROUND_VALUE = '__import_background__';

/** Which library the picker should open on. */
export type AppearanceKind = 'sprite' | 'animation' | 'background';

/**
 * Opens the picker and resolves with what the field should now hold — a sprite's
 * file name or an animation's id — or undefined if nothing was imported.
 */
export type AppearanceImportHandler = (
  kind: AppearanceKind,
) => Promise<string | undefined>;

let handler: AppearanceImportHandler | null = null;

/**
 * Register the picker. Called by the Blockly editor while it is mounted, and
 * with `null` on unmount so a stale closure over a dead workspace cannot run.
 */
export function setAppearanceImportHandler(
  next: AppearanceImportHandler | null,
): void {
  handler = next;
}

/**
 * Ask for an import. Resolves undefined when nothing was imported — including
 * when no handler is registered, which is the case in the headless generator and
 * in tests.
 */
export function requestAppearanceImport(
  kind: AppearanceKind,
): Promise<string | undefined> {
  return handler ? handler(kind) : Promise.resolve(undefined);
}
