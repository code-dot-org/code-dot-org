// Copying a stock map into the learner's project, with the actors it places.
//
// `importStockActor`'s sibling one level further out: a map names actor
// kinds, and a kind the project lacks is a placement the world cannot make
// (`World.loadMap` throws on an unregistered type). So the actors come first,
// each walking its own rules and pictures, and the map is written last — and
// never over an existing one, which is the promise every import makes.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';

import type {StockMap} from './stock';

const MAPS_FOLDER = 'maps';

export interface ImportedMap {
  source: MultiFileSource;
  /** The extension-less path the map was written to — `maps/pauseMenu`. */
  path: string;
}

/** The `maps/` folder id, creating the folder if the project lacks one. */
function mapsFolder(source: MultiFileSource): {
  source: MultiFileSource;
  folderId: string;
} {
  const existing = Object.values(source.folders).find(
    folder => folder.name === MAPS_FOLDER && folder.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, MAPS_FOLDER);
  const created = Object.values(next.folders).find(
    folder => folder.name === MAPS_FOLDER && folder.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

const alreadyImported = (source: MultiFileSource, id: string): boolean =>
  Object.values(source.files).some(file => file.name === `${id}.map`);

export function importStockMap(
  source: MultiFileSource,
  map: StockMap,
): ImportedMap {
  let current = source;
  for (const id of map.actors) {
    const actor = stockActorById(id);
    if (actor) {
      current = importStockActor(current, actor).source;
    }
  }
  const placed = mapsFolder(current);
  current = placed.source;
  const path = `${MAPS_FOLDER}/${map.id}`;
  if (alreadyImported(current, map.id)) {
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
          name: `${map.id}.map`,
          language: 'map',
          contents: map.contents,
          folderId: placed.folderId,
        },
      },
    },
    path,
  };
}
