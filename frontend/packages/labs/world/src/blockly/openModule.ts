// Opening the file behind a block.
//
// `use rule Has Gravity` and `use trait Affected by Gravity` name things that
// are, in this project, files: `rules/gravity.rule` declares both. A learner who
// wants to know what "Has Gravity" actually does has no way to get there from
// the block that says it — they have to know it is a rule, know rules live in
// `rules/`, and find the right one. The button this backs takes them there.
//
// Only where there is something to open. A built-in rule's implementation is
// engine code the project does not contain, and a level may want the button gone
// even when there is (a first lesson about *using* gravity is not a lesson about
// reading it), so both the project's files and the level's wishes are registered
// here and the field asks.
//
// The same shape as `ruleImport` and `effectImport`: a Blockly field cannot
// reach React context or the project's files, so the editor registers a handler
// while it is mounted and the field asks through it.

/** Opens the project file a module path names. */
export type ModuleOpener = (modulePath: string) => void;

let opener: ModuleOpener | null = null;
let openable: ReadonlySet<string> = new Set();
let offeredByLevel = true;

/**
 * Register the opener. Called by the Blockly editor while it is mounted, and
 * with `null` on unmount so a stale closure over a dead workspace cannot run.
 */
export function setModuleOpener(next: ModuleOpener | null): void {
  opener = next;
}

/**
 * The module paths the project has files for — extension-less, as a block names
 * them. Refreshed with the rest of the project's registries.
 */
export function setOpenableModules(modules: Iterable<string>): void {
  openable = new Set(modules);
}

/**
 * Whether the level offers the button at all.
 *
 * Off is a deliberate choice a level makes, not a default: a project a learner
 * owns should let them read anything in it.
 */
export function setModuleOpeningOffered(offered: boolean): void {
  offeredByLevel = offered;
}

/**
 * Whether a block naming `modulePath` should show its open button: the level
 * allows it, the project has the file, and something is listening.
 */
export function canOpenModule(modulePath: string | undefined): boolean {
  return (
    offeredByLevel &&
    opener !== null &&
    modulePath !== undefined &&
    openable.has(modulePath)
  );
}

/** Open the file for `modulePath`, if anything can. */
export function openModule(modulePath: string): void {
  if (canOpenModule(modulePath)) {
    opener?.(modulePath);
  }
}
