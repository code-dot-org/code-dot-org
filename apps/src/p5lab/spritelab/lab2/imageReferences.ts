// Image names are reference tokens: block picker fields store them quoted
// (e.g. `"cat"`), so everything here keeps names and references consistent —
// sanitizing names on the way in, and cascading renames through everything
// that references one.

import {Workspace} from 'blockly/core';

import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {SpriteLab2Source} from './types';

export const IMAGE_NAME_MAX_LENGTH = 40;

/**
 * Tidy a name as it's typed: drop double quotes (they'd corrupt the quoted
 * reference format, and Blockly warns every frame on the invalid value,
 * dragging the whole app), collapse whitespace, cap the length. A trailing
 * space survives so multi-word names can be typed naturally; callers trim
 * when committing.
 */
export function sanitizeImageName(raw: string): string {
  return raw
    .replace(/"/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, IMAGE_NAME_MAX_LENGTH);
}

function renameInBlock(
  block: JsonBlockConfig,
  oldQuoted: string,
  newQuoted: string
): void {
  if (block.fields) {
    for (const [name, value] of Object.entries(block.fields)) {
      // The quoted form identifies image references; plain text fields are
      // unquoted. TEXT is skipped anyway in case a student typed a quoted
      // name verbatim.
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
  const blocks = (source as {blocks?: {blocks?: JsonBlockConfig[]}})?.blocks
    ?.blocks;
  (blocks || []).forEach(block => renameInBlock(block, oldQuoted, newQuoted));
}

// Names are sanitized quote-free, so quoting is plain wrapping — the escaped
// forms JSON.stringify could produce never occur.
const quote = (name: string) => JSON.stringify(name);

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
  const oldQuoted = quote(oldName);
  const newQuoted = quote(newName);
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
export function renameImageReferencesOnWorkspace(
  workspace: Workspace | null,
  oldName: string,
  newName: string
): void {
  if (!workspace) {
    return;
  }
  const oldQuoted = quote(oldName);
  const newQuoted = quote(newName);
  workspace.getAllBlocks().forEach(block => {
    block.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (
          field instanceof CdoFieldAnimationDropdown &&
          field.getValue() === oldQuoted
        ) {
          field.setValue(newQuoted);
        }
      });
    });
  });
}
