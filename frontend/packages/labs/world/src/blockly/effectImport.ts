// The seam between a Blockly dropdown and a React dialog.
//
// Picking `(import…)` on an effect dropdown has to open a dialog, write a file
// into the project, and come back with the new module path — none of which a
// Blockly field can do. A field has no access to React context, and the
// registries it *can* read (moduleOptions) are plain module state by design.
//
// So this is one more piece of module state, in the same spirit: the React
// layer registers a handler while the editor is mounted, and the field asks for
// an import through it. The alternative — reaching into a React context from
// inside a field validator — is what this exists to avoid.

/** The sentinel a dropdown carries for its `(import…)` row. */
export const IMPORT_EFFECT_VALUE = '__import_effect__';

/**
 * Opens the import dialog and resolves with the module path of whatever was
 * imported, or undefined if the learner cancelled.
 */
export type EffectImportHandler = () => Promise<string | undefined>;

let handler: EffectImportHandler | null = null;

/**
 * Register the dialog opener. Called by the Blockly editor while it is mounted,
 * and with `null` on unmount so a stale closure over a dead workspace cannot be
 * invoked later.
 */
export function setEffectImportHandler(next: EffectImportHandler | null): void {
  handler = next;
}

/**
 * Ask for an import. Resolves undefined when nothing was imported — including
 * when no handler is registered, which is the case in the headless code
 * generator and in tests.
 */
export function requestEffectImport(): Promise<string | undefined> {
  return handler ? handler() : Promise.resolve(undefined);
}
