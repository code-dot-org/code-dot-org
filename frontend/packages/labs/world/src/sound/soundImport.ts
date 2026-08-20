// The seam between a `play sound` dropdown and the sound library.
//
// The same shape as `appearanceImport`, `ruleImport` and `effectImport`, and
// for the same reason: a Blockly field cannot open a React dialog or write a
// file, and the registries it can reach are plain module state by design. The
// field asks through a handler the editor registers while it is mounted.
//
// This is the FIFTH copy of that shape (rule, effect, actor, appearance, and
// this). They have drifted once already: two of the five carried a
// `field.getOptions(false)` before `setValue` that stopped being necessary when
// `bindLiveOptions` took the cache away, and the comment explaining it was
// copied here before anyone checked. A shared `libraryImport` taking the kind
// as data is the obvious tidy — `appearanceImportField` is already that shape
// for three of them — and the case for it is now evidence rather than taste.

/** What a `play sound` dropdown's `(import…)` row carries. */
export const IMPORT_SOUND_VALUE = '__import_sound__';

/**
 * Opens the sound library and resolves with what the field should now hold —
 * the imported file's name — or undefined if nothing was imported.
 */
export type SoundImportHandler = () => Promise<string | undefined>;

let handler: SoundImportHandler | null = null;

/**
 * Register the library. Called by the Blockly editor while it is mounted, and
 * with `null` on unmount so a stale closure over a dead workspace cannot run.
 */
export function setSoundImportHandler(next: SoundImportHandler | null): void {
  handler = next;
}

/**
 * Ask for an import. Resolves undefined when nothing was imported — including
 * when no handler is registered, which is the case in the headless generator
 * and in tests.
 */
export function requestSoundImport(): Promise<string | undefined> {
  return handler ? handler() : Promise.resolve(undefined);
}
