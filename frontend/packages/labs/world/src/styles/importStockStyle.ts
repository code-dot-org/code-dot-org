// Copying a stock theme into the learner's project.
//
// The simplest of the importers, because a theme names nothing: an `.actor`
// drags its rules and pictures along and a `.map` drags its actors, and a
// `.style` is a leaf — tokens and styles and no references out of the file.
//
// What it does share with the others is the promise every import makes: it
// never writes over a theme the project already has. A learner who has been
// editing `modern.style` and clicks Modern again keeps their edits.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {STOCK_STYLES, type StockStyle} from './stock';

const STYLES_FOLDER = 'styles';

export interface ImportedStyle {
  source: MultiFileSource;
  /** The extension-less path it was written to — `styles/modern`. */
  path: string;
}

/** The `styles/` folder id, creating the folder if the project lacks one. */
function stylesFolder(source: MultiFileSource): {
  source: MultiFileSource;
  folderId: string;
} {
  const existing = Object.values(source.folders).find(
    folder => folder.name === STYLES_FOLDER && folder.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, STYLES_FOLDER);
  const created = Object.values(next.folders).find(
    folder => folder.name === STYLES_FOLDER && folder.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

const alreadyImported = (source: MultiFileSource, id: string): boolean =>
  Object.values(source.files).some(file => file.name === `${id}.style`);

export function importStockStyle(
  source: MultiFileSource,
  style: StockStyle,
): ImportedStyle {
  const placed = stylesFolder(source);
  const current = placed.source;
  const path = `${STYLES_FOLDER}/${style.id}`;
  if (alreadyImported(current, style.id)) {
    return {source: current, path};
  }
  const fileId = getNextFileId(Object.values(current.files));
  return {
    source: {
      ...current,
      files: {
        ...current.files,
        [fileId]: {
          id: fileId,
          name: `${style.id}.style`,
          // JSON, like an `.effect`: authored as data, read by the engine,
          // never compiled. The editor for it is the step after this one.
          language: 'style',
          contents: style.contents,
          folderId: placed.folderId,
        },
      },
    },
    path,
  };
}

/** One stock theme by its id, for a caller that has only the name. */
export const stockStyleById = (id: string) =>
  STOCK_STYLES.find(style => style.id === id);
