// Which `.rule` a workspace is editing.
//
// A rule cannot use itself. `use rule Gravity` inside `rules/gravity.rule`
// generates a module that imports its own default export, which is a cycle the
// compiler resolves to `undefined` — and the project dies reading `.id` of it
// before anything is on screen. So the rule being edited is left out of its own
// `use rule` dropdown, which means that dropdown has to know which rule that is.
//
// Per WORKSPACE rather than per process, because there is more than one at a
// time: the editor's, the headless generator's, and a flyout's. Block
// definitions and their dropdowns are global — one `world_use_rule` serves all
// of them — so a module-level "the rule being edited" would be whichever of them
// last rendered, and the dropdown would be right only some of the time.

import type {Blockly} from '@code-dot-org/blockly';

/** The tag, on the workspace object itself. */
interface Tagged {
  __editingRuleModule?: string;
}

/**
 * Record which `.rule` this workspace edits, or that it edits none.
 *
 * The headless generator tags nothing: its palette is never shown, and a value
 * it cannot offer is a value it would drop while deserializing.
 */
export function setEditingRule(
  workspace: Blockly.Workspace,
  modulePath: string | undefined,
): void {
  (workspace as Tagged).__editingRuleModule = modulePath;
}

/**
 * The `.rule` the workspace behind this field is editing, if any.
 *
 * A field in a flyout belongs to the flyout's own workspace — the block there is
 * a preview of one you might drag out — so the question is asked of the
 * workspace it would be dragged into.
 */
export function editingRuleFor(
  field: Blockly.Field | undefined,
): string | undefined {
  const workspace = field?.getSourceBlock()?.workspace as
    | (Blockly.WorkspaceSvg & Tagged)
    | undefined;
  if (!workspace) {
    return undefined;
  }
  const target = workspace.isFlyout
    ? (workspace.targetWorkspace as (Blockly.WorkspaceSvg & Tagged) | undefined)
    : workspace;
  return target?.__editingRuleModule;
}
