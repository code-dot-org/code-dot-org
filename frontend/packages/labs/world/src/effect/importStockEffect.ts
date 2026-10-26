// Copying a stock effect into the learner's project.
//
// A pure transform of the project source, deliberately: the interesting parts
// are naming and placement, and both are much easier to get right — and to keep
// right — when they can be tested without a React tree or a Blockly workspace.
// The dialog and the dropdown are thin wrappers around this.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {serializeEffectDocument} from './model';
import type {StockEffect} from './stock';

/** Where effects live, by the lab's directory convention (GLOSSARY.md). */
const EFFECTS_FOLDER = 'effects';

/** The result of an import: the new project, and what to call the effect. */
export interface ImportedEffect {
  source: MultiFileSource;
  /**
   * The extension-less module path — `effects/ripple` — which is what a block's
   * EFFECT field stores and what the generated code imports.
   */
  path: string;
}

/** The `effects/` folder id, creating the folder if the project lacks one. */
function effectsFolder(source: MultiFileSource): {
  source: MultiFileSource;
  folderId: string;
} {
  const existing = Object.values(source.folders).find(
    folder => folder.name === EFFECTS_FOLDER && folder.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  // A project that has never held an effect has no folder to put one in.
  const next = createNewFolder(source, EFFECTS_FOLDER);
  const created = Object.values(next.folders).find(
    folder => folder.name === EFFECTS_FOLDER && folder.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

/**
 * A file stem not already taken in `effects/`.
 *
 * Importing Ripple twice gives `ripple` and `ripple-2` rather than one
 * overwriting the other. Overwriting would be the worse failure by far: the
 * second import would silently discard whatever the learner had changed in the
 * first, and they would have no way to notice until their game looked wrong.
 */
function freeStem(
  source: MultiFileSource,
  folderId: string,
  wanted: string,
): string {
  const taken = new Set(
    Object.values(source.files)
      .filter(file => file.folderId === folderId)
      .map(file => file.name.replace(/\.effect$/, '')),
  );
  if (!taken.has(wanted)) {
    return wanted;
  }
  for (let suffix = 2; ; suffix++) {
    const candidate = `${wanted}-${suffix}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
}

/**
 * Copy a stock effect into the project.
 *
 * The file is added but NOT made the active tab. An import is started from a
 * block's dropdown, and the point of it is to get back to that block with the
 * effect selected — opening the effect editor instead would leave the learner
 * looking at a graph while the change they asked for happened somewhere they
 * cannot see. (`createNewFile` in Codebridge activates, which is right for the
 * file browser's own New File and wrong here, so the file is added directly.)
 */
export function importStockEffect(
  source: MultiFileSource,
  effect: StockEffect,
): ImportedEffect {
  const placed = effectsFolder(source);
  const stem = freeStem(placed.source, placed.folderId, effect.id);
  const fileId = getNextFileId(Object.values(placed.source.files));

  return {
    source: {
      ...placed.source,
      files: {
        ...placed.source.files,
        [fileId]: {
          id: fileId,
          name: `${stem}.effect`,
          language: 'effect',
          contents: serializeEffectDocument(effect.document),
          folderId: placed.folderId,
        },
      },
    },
    path: `${EFFECTS_FOLDER}/${stem}`,
  };
}
