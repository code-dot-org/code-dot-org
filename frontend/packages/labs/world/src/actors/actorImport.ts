// The seam between an ACTOR dropdown and the stock-actor picker.
//
// `blockly/ruleImport`'s sibling and the same shape, for the same reason: a
// Blockly field cannot open a React dialog or write a file, so the React layer
// registers a handler while the editor is mounted and the field asks through it.
//
// A separate seam rather than a shared "import something" channel, again as
// there: the two want different dialogs and different sentinels, and one channel
// would carry a discriminator standing in for the two functions it replaced.

/** The sentinel an ACTOR dropdown carries for its `(import…)` row. */
export const IMPORT_ACTOR_VALUE = '__import_actor__';

/**
 * Opens the picker and resolves with the module path of whatever was imported,
 * or undefined if the learner cancelled.
 */
export type ActorImportHandler = () => Promise<string | undefined>;

let handler: ActorImportHandler | null = null;

/** Register the opener; `null` on unmount, so no stale closure survives. */
export function setActorImportHandler(next: ActorImportHandler | null): void {
  handler = next;
}

/** Ask for an import. Undefined when nothing was imported — including when no
 *  handler is registered, which is the headless generator and the tests. */
export function requestActorImport(): Promise<string | undefined> {
  return handler ? handler() : Promise.resolve(undefined);
}
