// The seam between a world's rules buttons and the dialog behind them: the
// one on the `define world` block, and the one in the map editor's World
// inspector.
//
// `ruleImport`'s shape exactly, and for the same reason: a Blockly field cannot
// open a React dialog or write a file, so the React layer registers a handler
// while the editor is mounted and the field asks through it.
//
// A seam of its own rather than a second use of the import one, because this
// asks a different question. Importing wants a rule back — the dropdown that
// asked is about to take its value. This wants nothing back: it opens a panel
// on the project's rules, and whatever the learner does there is done to the
// PROJECT, not to the block that opened it. The block only wants to know when
// the panel closed, so it can count again.

/** What the panel is opened for: whether it may change anything. */
export interface RulesConfigRequest {
  editable: boolean;
}

/** Opens the rules panel; resolves when it is dismissed. */
export type RulesConfigHandler = (request: RulesConfigRequest) => Promise<void>;

let handler: RulesConfigHandler | null = null;

/**
 * Register the panel opener. Called by the lab's dialog host while it is
 * mounted (`library/LibraryImports`), and with `null` on unmount.
 */
export function setRulesConfigHandler(next: RulesConfigHandler | null): void {
  handler = next;
}

/**
 * Ask for the panel. Resolves immediately when no handler is registered, which
 * is the case in the headless code generator and in tests.
 */
export function requestRulesConfig(
  request: RulesConfigRequest = {editable: true},
): Promise<void> {
  return handler ? handler(request) : Promise.resolve();
}
