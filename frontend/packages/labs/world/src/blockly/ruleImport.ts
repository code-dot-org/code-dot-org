// The seam between a `use rule` dropdown and the import dialog.
//
// The same shape as `effectImport`, and for the same reason: a Blockly field
// cannot open a React dialog or write a file, and the registries it can reach
// are plain module state by design. So the React layer registers a handler
// while the editor is mounted and the field asks through it.
//
// Two seams rather than one generic one because the two dropdowns want
// different dialogs and different sentinels, and a shared "import something"
// channel would have to carry which kind — a discriminator standing in for the
// two functions it replaced.

/** The sentinel a `use rule` dropdown carries for its `(import…)` row. */
export const IMPORT_RULE_VALUE = '__import_rule__';

/**
 * Opens the import dialog and resolves with the module path of whatever was
 * imported, or undefined if the learner cancelled.
 */
export type RuleImportHandler = () => Promise<string | undefined>;

let handler: RuleImportHandler | null = null;

/**
 * Register the dialog opener. Called by the Blockly editor while it is mounted,
 * and with `null` on unmount so a stale closure over a dead workspace cannot be
 * invoked later.
 */
export function setRuleImportHandler(next: RuleImportHandler | null): void {
  handler = next;
}

/**
 * Ask for an import. Resolves undefined when nothing was imported — including
 * when no handler is registered, which is the case in the headless code
 * generator and in tests.
 */
export function requestRuleImport(): Promise<string | undefined> {
  return handler ? handler() : Promise.resolve(undefined);
}
