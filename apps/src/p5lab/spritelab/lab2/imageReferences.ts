// Image names are reference tokens: block picker fields store them quoted
// (e.g. `"cat"`), so everything here keeps names and references consistent —
// sanitizing names on the way in, and cascading renames through everything
// that references one.

import {Workspace} from 'blockly/core';

import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {Sources} from './types';

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

// A picker field's saved value is its XML element, `<field name="X">"cat"
// </field>`, once the scene has been through a workspace; a value written
// straight to JSON is the bare quoted name. Compare and rewrite the text
// inside, whichever form it is in.
const FIELD_ELEMENT = /^(<field\b[^>]*>)([\s\S]*)(<\/field>)$/;

// Fields also hold numbers and variable descriptors; only strings can name
// an image.
function fieldValueText(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const match = FIELD_ELEMENT.exec(value);
  return match ? match[2] : value;
}

function withFieldValueText(value: string, text: string): string {
  const match = FIELD_ELEMENT.exec(value);
  return match ? `${match[1]}${text}${match[3]}` : text;
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
      if (
        name !== 'TEXT' &&
        typeof value === 'string' &&
        fieldValueText(value) === oldQuoted
      ) {
        block.fields[name] = withFieldValueText(value, newQuoted);
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
  sources: Sources,
  oldName: string,
  newName: string
): Sources {
  const out: Sources = JSON.parse(JSON.stringify(sources));
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

function removeInBlock(block: JsonBlockConfig, quoted: string): void {
  if (block.fields) {
    for (const [name, value] of Object.entries(block.fields)) {
      if (name !== 'TEXT' && fieldValueText(value) === quoted) {
        // With no stored value the picker loads its first option, so the
        // block visibly points at another image rather than a ghost.
        delete block.fields[name];
      }
    }
  }
  Object.values(block.inputs || {}).forEach(input => {
    if (input.block) {
      removeInBlock(input.block, quoted);
    }
    if (input.shadow) {
      removeInBlock(input.shadow, quoted);
    }
  });
  if (block.next?.block) {
    removeInBlock(block.next.block, quoted);
  }
  if (block.next?.shadow) {
    removeInBlock(block.next.shadow, quoted);
  }
}

/**
 * Drop every reference to a deleted image across the project's sources:
 * picker fields in every scene's blocks (and the top-level mirror of scene
 * 1) fall back to their first option, and World-tab cells placing the image
 * are cleared. Pure — returns a new sources object. A reference left behind
 * would spawn a costume the engine cannot find.
 */
export function removeImageReferences(sources: Sources, name: string): Sources {
  const out: Sources = JSON.parse(JSON.stringify(sources));
  const quoted = quote(name);
  const blocksOf = (source: WorkspaceSerialization | undefined) =>
    (source as {blocks?: {blocks?: JsonBlockConfig[]}})?.blocks?.blocks || [];
  blocksOf(out.source as WorkspaceSerialization).forEach(block =>
    removeInBlock(block, quoted)
  );
  (out.scenes || []).forEach(scene => {
    blocksOf(scene.source).forEach(block => removeInBlock(block, quoted));
    (scene.world?.grid || []).forEach(row =>
      row.forEach((cell, i) => {
        if (cell && cell.image === name) {
          row[i] = null;
        }
      })
    );
  });
  return out;
}

/**
 * Point the live workspace's picker fields away from a deleted image, to
 * their first remaining option, so the visible blocks match the cleaned
 * serialization without a reload.
 */
export function removeImageReferencesOnWorkspace(
  workspace: Workspace | null,
  name: string
): void {
  if (!workspace) {
    return;
  }
  const quoted = quote(name);
  workspace.getAllBlocks().forEach(block => {
    block.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        if (
          field instanceof CdoFieldAnimationDropdown &&
          field.getValue() === quoted
        ) {
          const first = field.getOptions(false)[0];
          if (first && first[1] !== quoted) {
            field.setValue(first[1]);
          }
        }
      });
    });
  });
}
