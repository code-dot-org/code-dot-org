// Renaming an image cascades through everything that references it by name,
// so tidying a name never breaks a project.

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {SpriteLab2Source} from './types';

// The serialized shape of one Blockly block (WorkspaceSerialization is
// untyped JSON).
interface SerializedBlock {
  type?: string;
  fields?: {[name: string]: unknown};
  inputs?: {
    [name: string]: {block?: SerializedBlock; shadow?: SerializedBlock};
  };
  next?: {block?: SerializedBlock; shadow?: SerializedBlock};
}

function renameInBlock(
  block: SerializedBlock,
  oldQuoted: string,
  newQuoted: string
): void {
  if (block.fields) {
    for (const [name, value] of Object.entries(block.fields)) {
      // Image pickers store the quoted name (e.g. `"cat"`); plain text
      // fields are unquoted, so the quoted form identifies image
      // references. TEXT is skipped anyway in case a student typed a
      // quoted name verbatim.
      if (name !== 'TEXT' && value === oldQuoted) {
        block.fields[name] = newQuoted;
      }
    }
  }
  Object.values(block.inputs || {}).forEach(input => {
    if (input.block) {
      renameInBlock(input.block, oldQuoted, newQuoted);
    }
    if (input.shadow) {
      renameInBlock(input.shadow, oldQuoted, newQuoted);
    }
  });
  if (block.next?.block) {
    renameInBlock(block.next.block, oldQuoted, newQuoted);
  }
  if (block.next?.shadow) {
    renameInBlock(block.next.shadow, oldQuoted, newQuoted);
  }
}

function renameInWorkspace(
  source: WorkspaceSerialization | undefined,
  oldQuoted: string,
  newQuoted: string
): void {
  const blocks = (source as {blocks?: {blocks?: SerializedBlock[]}})?.blocks
    ?.blocks;
  (blocks || []).forEach(block => renameInBlock(block, oldQuoted, newQuoted));
}

/**
 * Rename every reference to an image across the project's sources: picker
 * fields in every scene's blocks (and the top-level mirror of scene 1) and
 * World-tab grid cells. Pure — returns a new sources object.
 */
export function renameImageReferences(
  sources: SpriteLab2Source,
  oldName: string,
  newName: string
): SpriteLab2Source {
  const out: SpriteLab2Source = JSON.parse(JSON.stringify(sources));
  const oldQuoted = JSON.stringify(oldName);
  const newQuoted = JSON.stringify(newName);
  renameInWorkspace(out.source as WorkspaceSerialization, oldQuoted, newQuoted);
  (out.scenes || []).forEach(scene => {
    renameInWorkspace(scene.source, oldQuoted, newQuoted);
    (scene.world?.grid || []).forEach(row =>
      row.forEach(cell => {
        if (cell && cell.image === oldName) {
          cell.image = newName;
        }
      })
    );
  });
  return out;
}

/**
 * Rename image references on the live Blockly workspace (the scene open in
 * the Code tab), so the visible blocks match the renamed serialization
 * without a reload.
 */
interface WorkspaceField {
  name?: string;
  getValue: () => unknown;
  setValue: (value: string) => void;
}

interface WorkspaceLike {
  getAllBlocks: () => {
    inputList: {fieldRow: WorkspaceField[]}[];
  }[];
}

export function renameImageReferencesOnWorkspace(
  workspace: WorkspaceLike | null,
  oldName: string,
  newName: string
): void {
  if (!workspace) {
    return;
  }
  const oldQuoted = JSON.stringify(oldName);
  const newQuoted = JSON.stringify(newName);
  workspace.getAllBlocks().forEach(block => {
    block.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (field.name !== 'TEXT' && field.getValue() === oldQuoted) {
          field.setValue(newQuoted);
        }
      });
    });
  });
}
