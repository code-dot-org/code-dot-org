// Copying a stock map into the learner's project, with the actors it places.
//
// `importStockActor`'s sibling one level further out: a map names actor
// kinds, and a kind the project lacks is a placement the world cannot make
// (`World.loadMap` throws on an unregistered type). So the actors come first,
// each walking its own rules and pictures, and the map is written last — and
// never over an existing one, which is the promise every import makes.
//
// …AND THE GAME'S EVENTS, which is the one place an import writes into a file
// the learner already had. A map raises the game's events and declares none
// itself, so the Pause Menu's Quit button raises nothing until the Main Screen
// declares `quit`; the import declares it (`declareScreenEvents`), and does
// even for a map the project already holds, because the reason to run the
// import again is that something is missing (specs/MAP_EVENTS_PLAN.md).

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {MAIN_SCREEN_PATH} from '../mainWorld';
import {fileIdAt} from '../runtime/projectFiles';

import {declareScreenEvents} from './declareEvents';
import type {StockMap} from './stock';

const MAPS_FOLDER = 'maps';
/** …and a stock SCREEN's, which the game shows (specs/SCREEN_STACK_PLAN.md). */
const SCREENS_FOLDER = 'screens';

export interface ImportedMap {
  source: MultiFileSource;
  /** The extension-less path the map was written to — `maps/pauseMenu`. */
  path: string;
}

/** A top-level folder's id, creating the folder if the project lacks one. */
function topFolder(
  source: MultiFileSource,
  name: string,
): {
  source: MultiFileSource;
  folderId: string;
} {
  const existing = Object.values(source.folders).find(
    folder => folder.name === name && folder.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, name);
  const created = Object.values(next.folders).find(
    folder => folder.name === name && folder.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

const alreadyImported = (
  source: MultiFileSource,
  folderId: string,
  name: string,
): boolean =>
  Object.values(source.files).some(
    file => file.name === name && file.folderId === folderId,
  );

/** The project's Main Screen's file id, if it is in that shape. */
const mainScreenId = (source: MultiFileSource): string | undefined =>
  fileIdAt(source, `${MAIN_SCREEN_PATH}.screen`);

/**
 * The project with the map's events declared on its Main Screen. A project
 * with none gets its files and no declarations, which the load-time check
 * reports rather than the import guessing.
 */
function withDeclaredEvents(
  source: MultiFileSource,
  map: StockMap,
): MultiFileSource {
  if (!map.raises?.length) {
    return source;
  }
  const id = mainScreenId(source);
  const screen = id === undefined ? undefined : source.files[id];
  if (!screen) {
    return source;
  }
  const contents = declareScreenEvents(screen.contents ?? '', map.raises);
  if (contents === screen.contents) {
    return source;
  }
  return {
    ...source,
    files: {...source.files, [screen.id]: {...screen, contents}},
  };
}

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
  current = withDeclaredEvents(current, map);
  const folder = map.screen ? SCREENS_FOLDER : MAPS_FOLDER;
  const extension = map.screen ? 'screen' : 'map';
  const placed = topFolder(current, folder);
  current = placed.source;
  const path = `${folder}/${map.id}`;
  if (alreadyImported(current, placed.folderId, `${map.id}.${extension}`)) {
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
          name: `${map.id}.${extension}`,
          language: extension,
          contents: map.contents,
          folderId: placed.folderId,
        },
      },
    },
    path,
  };
}
