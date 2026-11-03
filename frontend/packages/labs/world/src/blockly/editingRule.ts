// Which file a workspace is editing.
//
// Per WORKSPACE rather than per process, because there is more than one at a
// time: the editor's, the headless generator's, and a flyout's. Block
// definitions and their dropdowns are global, so a module-level "the file
// being edited" would be whichever of them last rendered.

import type {Blockly} from '@code-dot-org/blockly';

import type {UnlockTarget} from '../progression/types';

/** The tags, on the workspace object itself. */
interface Tagged {
  __editingActorModule?: string;
  __editingFileModule?: string;
  __subjectPropertiesWithheld?: boolean;
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
 * am I": which map's layers a block may name (`layers`), and which file's own
 * properties a hat may be about (`eventSubject`).
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

/** The shelf's grant that lets a hat be about an actor property. */
export const SUBJECT_PROPERTIES: UnlockTarget = {
  kind: 'affordance',
  id: 'subject-properties',
};

/**
 * Record whether a gated lab withholds actor properties as a hat's subject
 * (the `subject-properties` affordance, specs/PROPERTY_SUBJECTS_PLAN.md).
 */
export function setSubjectPropertiesWithheld(
  workspace: Blockly.Workspace,
  withheld: boolean,
): void {
  (workspace as Tagged).__subjectPropertiesWithheld = withheld;
}

/** Whether this block's workspace withholds actor properties as subjects. */
export function subjectPropertiesWithheld(
  block: Blockly.Block | undefined,
): boolean {
  const workspace = block?.workspace as
    | (Blockly.WorkspaceSvg & Tagged)
    | undefined;
  if (!workspace) {
    return false;
  }
  const target = workspace.isFlyout
    ? (workspace.targetWorkspace as (Blockly.WorkspaceSvg & Tagged) | undefined)
    : workspace;
  return target?.__subjectPropertiesWithheld ?? false;
}
