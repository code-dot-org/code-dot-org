// Image names are reference tokens: block picker fields store them quoted
// (e.g. `"cat"`), so everything here keeps names and references consistent —
// sanitizing names on the way in, and cascading renames through everything
// that references one.

import {Workspace} from 'blockly/core';

import CdoFieldAnimationDropdown from '@cdo/apps/blockly/addons/cdoFieldAnimationDropdown';
import {JsonBlockConfig, WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {IMAGE_TYPE_LABELS, ImageType} from './ai/images/types';
import {Sources} from './types';

export const IMAGE_NAME_MAX_LENGTH = 40;

/**
 * Name for an image created without a name field (the student dialog): the
 * type's label plus the first free number — "Sprite 1", "Sprite 2", …
 */
export function nextImageName(
  imageType: ImageType,
  isNameTaken: (name: string) => boolean
): string {
  for (let n = 1; ; n++) {
    const name = `${IMAGE_TYPE_LABELS[imageType]} ${n}`;
    if (!isNameTaken(name)) {
      return name;
    }
  }
}

/**
 * Tidy a name as it's typed: drop double quotes and backslashes (either
 * would corrupt the quoted reference format), collapse whitespace, cap the
 * length. A trailing space survives so multi-word names can be typed;
 * callers trim when committing.
 */
export function sanitizeImageName(raw: string): string {
  return raw
    .replace(/["\\]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, IMAGE_NAME_MAX_LENGTH);
}

// The picker fields that hold image references, by block type. The block
// type matters because a field name alone is ambiguous: GROUP here is a
// costume picker, but on the GameDev group blocks it is the players/walls
// dropdown, and rewriting that would silently rewire the program.
const IMAGE_FIELDS: Record<string, readonly string[]> = {
  gamelab_addTarget: ['TARGET'],
  gamelab_allSpritesWithAnimation: ['ANIMATION'],
  gamelab_costumeImage: ['COSTUME'],
  gamelab_createNewSprite: ['COSTUME'],
  gamelab_isCostumeEqual: ['COSTUME'],
  gamelab_layoutSprites: ['GROUP'],
  gamelab_makeBurst: ['ANIMATION_NAME'],
  gamelab_makeNewSpriteAnon: ['ANIMATION_NAME'],
  gamelab_makeNewSpriteGroup: ['GROUP'],
  gamelab_makeNumSprites: ['ANIMATION_NAME'],
  gamelab_makeNumSpritesNear: ['ANIMATION_NAME'],
  gamelab_makeProjectile: ['ANIMATION_NAME'],
  gamelab_makeSpritesGrid: ['ANIMATION_NAME'],
  gamelab_makeSpritesGridInput: ['ANIMATION_NAME'],
  gamelab_makeSpritesWithSize: ['COSTUME'],
  gamelab_setAnimation: ['ANIMATION'],
  gamelab_setBackgroundImageAs: ['IMG'],
  gamelab_setupScoreboard: [
    'SPRITE1COSTUME',
    'SPRITE2COSTUME',
    'SPRITE3COSTUME',
  ],
  gamelab_setupSim: ['SPRITE1COSTUME', 'SPRITE2COSTUME', 'SPRITE3COSTUME'],
  gamelab_startAvoiding: ['TARGET'],
  gamelab_startFollowing: ['TARGET'],
  spritelab2_makePlatformBlocks: ['ANIMATION_NAME'],
  spritelab2_makePlatformPlayer: ['ANIMATION_NAME'],
  spritelab2_makeSpriteAtGrid: ['ANIMATION_NAME'],
  spritelab2_setAsPlatformPlayer: ['ANIMATION_NAME'],
};

// A picker field's saved value is its XML element, `<field name="X">"cat"
// </field>`, once the scene has been through a workspace; a value written
// straight to JSON is the bare quoted name. Compare and rewrite the text
// inside, whichever form it is in.
const FIELD_ELEMENT = /^(<field\b[^>]*>)([\s\S]*)(<\/field>)$/;

// The XML form escapes the element's text — "cats & dogs" is stored as
// `"cats &amp; dogs"` — so comparisons and rewrites work on the unescaped
// name. The serializer escapes exactly & < > in element text.
const XML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
};

const decodeXmlText = (text: string): string =>
  text.replace(/&(amp|lt|gt);/g, (_, entity: string) => XML_ENTITIES[entity]);

const encodeXmlText = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Fields also hold numbers and variable descriptors; only strings can name
// an image.
function fieldValueText(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  const match = FIELD_ELEMENT.exec(value);
  return match ? decodeXmlText(match[2]) : value;
}

// The unwrapped name text of a field that can reference an image, or null
// for one that cannot (a field outside IMAGE_FIELDS, or a non-string
// value).
function imageReferenceText(
  block: JsonBlockConfig,
  fieldName: string,
  value: unknown
): unknown {
  if (
    typeof value !== 'string' ||
    !(IMAGE_FIELDS[block.type] || []).includes(fieldName)
  ) {
    return null;
  }
  return fieldValueText(value);
}

function withFieldValueText(value: string, text: string): string {
  const match = FIELD_ELEMENT.exec(value);
  return match ? `${match[1]}${encodeXmlText(text)}${match[3]}` : text;
}

// Visit a block and every block nested in its inputs, shadows and next chain.
function forEachBlock(
  block: JsonBlockConfig,
  visit: (block: JsonBlockConfig) => void
): void {
  visit(block);
  Object.values(block.inputs || {}).forEach(input => {
    if (input.block) {
      forEachBlock(input.block, visit);
    }
    if (input.shadow) {
      forEachBlock(input.shadow, visit);
    }
  });
  if (block.next?.block) {
    forEachBlock(block.next.block, visit);
  }
  if (block.next?.shadow) {
    forEachBlock(block.next.shadow, visit);
  }
}

function renameInBlock(
  block: JsonBlockConfig,
  oldQuoted: string,
  newQuoted: string
): void {
  forEachBlock(block, visited => {
    for (const [name, value] of Object.entries(visited.fields || {})) {
      if (imageReferenceText(visited, name, value) === oldQuoted) {
        visited.fields![name] = withFieldValueText(value as string, newQuoted);
      }
    }
  });
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

// Names are sanitized free of quotes and backslashes, so quoting is plain
// wrapping — the escaped forms JSON.stringify could produce never occur.
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
  forEachBlock(block, visited => {
    for (const [name, value] of Object.entries(visited.fields || {})) {
      if (imageReferenceText(visited, name, value) === quoted) {
        // With no stored value the picker loads its first option, so the
        // block visibly points at another image rather than a ghost.
        delete visited.fields![name];
      }
    }
  });
}

/**
 * Drop every reference to a deleted image across the project's sources —
 * picker fields fall back to their first option, World cells clear — so no
 * block asks for a costume the engine cannot find. Pure: returns a new
 * sources object.
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
