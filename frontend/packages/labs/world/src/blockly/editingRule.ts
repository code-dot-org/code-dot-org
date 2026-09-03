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

/** The tags, on the workspace object itself. */
interface Tagged {
  __editingRuleModule?: string;
  __editingActorModule?: string;
  __editingFileModule?: string;
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

/**
 * Record which `.actor` this workspace edits, or that it edits none.
 *
 * The same tag mechanism one file over, and for the same per-workspace reason:
 * block definitions are global, so a module-level "the actor being edited"
 * would be whichever workspace rendered last.
 *
 * What reads it is `this actor`, which draws the kind it is about
 * (`actorAbout`). A world's own `define actor` is named by the block it is
 * defined in and needs nothing from here; a file's own root is named by the
 * file, and the workspace is the only thing that knows which file it is.
 */
export function setEditingActor(
  workspace: Blockly.Workspace,
  modulePath: string | undefined,
): void {
  (workspace as Tagged).__editingActorModule = modulePath;
}

/** The `.actor` the workspace behind this block is editing, if any. */
export function editingActorModule(
  block: Blockly.Block | undefined,
): string | undefined {
  const workspace = block?.workspace as
    | (Blockly.WorkspaceSvg & Tagged)
    | undefined;
  if (!workspace) {
    return undefined;
  }
  const target = workspace.isFlyout
    ? (workspace.targetWorkspace as (Blockly.WorkspaceSvg & Tagged) | undefined)
    : workspace;
  return target?.__editingActorModule;
}

/**
 * Record which FILE this workspace is, whatever kind of file it is.
 *
 * The two tags above answer questions about a file's own subject — which rule
 * may not use itself, which actor `this actor` means. This one answers "where
 * am I", which is what an act on the file needs: the wand on `define actor`
 * enhances an actor a WORLD defines, and to write anything at all it has to
 * know which world (`blockly/extensions/enhanceButton`).
 */
export function setEditingFile(
  workspace: Blockly.Workspace,
  modulePath: string | undefined,
): void {
  (workspace as Tagged).__editingFileModule = modulePath;
}

/** The module path of the file this block's workspace is editing, if any. */
export function editingFileModule(
  block: Blockly.Block | undefined,
): string | undefined {
  const workspace = block?.workspace as
    | (Blockly.WorkspaceSvg & Tagged)
    | undefined;
  if (!workspace) {
    return undefined;
  }
  const target = workspace.isFlyout
    ? (workspace.targetWorkspace as (Blockly.WorkspaceSvg & Tagged) | undefined)
    : workspace;
  return target?.__editingFileModule;
}
