import * as BlocklyCore from 'blockly/core';

import {
  BLOCK_TYPES,
  PROCEDURE_DEFINITION_TYPES,
} from '@cdo/apps/blockly/constants';

/**
 * Tracks which procedure/behavior names originated from curriculum-authored
 * content and are therefore eligible for display-time translation on their
 * caller blocks (procedures_callnoreturn, gamelab_behavior_get). Names the
 * student types via the function editor never enter this set — they render
 * verbatim.
 *
 * Populated from the initial workspace state when Blockly fires
 * FINISHED_LOADING on the main and hidden definition workspaces, and from the
 * main workspace's flyout (for caller blocks placed in the level's toolbox
 * XML). Registrations after that point — e.g., a student creating a new
 * procedure — are not auto-captured.
 */
const translatable = new Set<string>();

type RegistryListener = () => void;
const listeners = new Set<RegistryListener>();
let notifyQueued = false;

// Coalesce bursts of markTranslatable calls (e.g., a single scan adding
// many names) into one listener notification per microtask.
function notifySoon(): void {
  if (notifyQueued) {
    return;
  }
  notifyQueued = true;
  queueMicrotask(() => {
    notifyQueued = false;
    for (const listener of listeners) {
      listener();
    }
  });
}

export function onRegistryChange(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isTranslatable(name: string): boolean {
  return translatable.has(name);
}

export function markTranslatable(name: string): void {
  if (name && !translatable.has(name)) {
    translatable.add(name);
    notifySoon();
  }
}

export function clearTranslatable(): void {
  if (translatable.size === 0) {
    return;
  }
  translatable.clear();
  notifySoon();
}

// Scans procedure/behavior DEFINITION blocks only. Appropriate for the main
// and hidden definition workspaces where caller NAME values can legitimately
// be student-renamed copies and must not be auto-registered.
function scanDefinitions(
  workspace: BlocklyCore.Workspace | null | undefined
): void {
  if (!workspace) {
    return;
  }
  for (const block of workspace.getAllBlocks(false)) {
    if (PROCEDURE_DEFINITION_TYPES.includes(block.type)) {
      const name = block.getFieldValue('NAME');
      if (name) {
        markTranslatable(name);
      }
    }
  }
}

const FLYOUT_TRANSLATABLE_TYPES: readonly string[] = [
  ...PROCEDURE_DEFINITION_TYPES,
  BLOCK_TYPES.procedureCall,
  BLOCK_TYPES.behaviorGet,
];

// Scans a flyout workspace. Flyout blocks are curriculum-authored by
// construction (students don't edit the flyout), so caller NAME values on
// procedure_callnoreturn and gamelab_behavior_get are also safe to register —
// this is how a behaviorGet placed in a level's toolboxBlocks XML gets its
// name registered without needing a matching definition elsewhere.
function scanFlyout(workspace: BlocklyCore.Workspace | null | undefined): void {
  if (!workspace) {
    return;
  }
  for (const block of workspace.getAllBlocks(false)) {
    if (FLYOUT_TRANSLATABLE_TYPES.includes(block.type)) {
      const name = block.getFieldValue('NAME');
      if (name) {
        markTranslatable(name);
      }
    }
  }
}

/**
 * Change listener. On FINISHED_LOADING, scans the emitting workspace for
 * procedure/behavior definition blocks, the hidden definition workspace for
 * the same, and the emitting workspace's flyout (if it has one) for both
 * definitions and caller blocks. Attached to the main workspace and the
 * hidden definition workspace in blocklyWrapper.inject.
 */
export function handleFinishedLoading(
  event: BlocklyCore.Events.Abstract
): void {
  if (
    event.type !== BlocklyCore.Events.FINISHED_LOADING ||
    !event.workspaceId
  ) {
    return;
  }
  const workspace = BlocklyCore.Workspace.getById(event.workspaceId);
  scanDefinitions(workspace);
  scanDefinitions(Blockly.getHiddenDefinitionWorkspace?.());

  // Flyout contents don't flow through the main/hidden serialization path,
  // but a level's toolbox XML can place caller blocks directly there. Scan
  // once per load to pick those up.
  const svgWorkspace = workspace as BlocklyCore.WorkspaceSvg | null;
  const flyoutWorkspace = svgWorkspace?.getFlyout?.()?.getWorkspace();
  scanFlyout(flyoutWorkspace);
}
