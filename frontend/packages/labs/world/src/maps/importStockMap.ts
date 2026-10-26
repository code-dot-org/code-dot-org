// Copying a stock map into the learner's project, with the actors it places.
//
// `importStockActor`'s sibling one level further out: a map names actor
// kinds, and a kind the project lacks is a placement the world cannot make
// (`World.loadMap` throws on an unregistered type). So the actors come first,
// each walking its own rules and pictures, and the map is written last — and
// never over an existing one, which is the promise every import makes.
//
// …AND THE WORLD'S EVENTS, which is the one place an import writes into a file
// the learner already had. A map raises the world's events and declares none
// itself, so the Pause Menu's Quit button raises nothing until the world says
// `define event ⟨quit⟩`; the import says it (`declareEvents`), and says it
// even for a map the project already holds, because the reason to run the
// import again is that something is missing (specs/MAP_EVENTS_PLAN.md).

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {pathSlug} from '../blockly/ruleRegistry';
import {MAIN_SCREEN_PATH, MAIN_WORLD_PATH} from '../mainWorld';
import {fileIdAt} from '../runtime/projectFiles';

import {declareEvents, declareScreenEvents} from './declareEvents';
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

/**
 * A stock map's contents with the world's events named as the Main Screen's.
 *
 * An `emit` or a hat is minted from the module the event is declared in, and
 * a stock map is written against `worlds/main` (`stock/workspace`). In a
 * project whose game is a Main Screen the same events are declared there,
 * so the block types are renamed to match — `world_emit_WorldsMain_QuitEvent`
 * becomes `world_emit_ScreensMain_QuitEvent`.
 */
export const raisedOnTheScreen = (contents: string): string => {
  const world = pathSlug(MAIN_WORLD_PATH);
  const screen = pathSlug(MAIN_SCREEN_PATH);
  return contents.replace(
    new RegExp(`"world_(emit|on)_${world}_`, 'g'),
    `"world_$1_${screen}_`,
  );
};

const alreadyImported = (source: MultiFileSource, id: string): boolean =>
  Object.values(source.files).some(file => file.name === `${id}.map`);

/** The project's Main Screen's file id, if it is in that shape. */
const mainScreenId = (source: MultiFileSource): string | undefined =>
  fileIdAt(source, `${MAIN_SCREEN_PATH}.screen`);

/**
 * The project with the map's events declared in its world, or in its Main
 * Screen's data when it has one (`entryFileOf`).
 *
 * The world is found by PATH rather than by extension: a project has one, at
 * `worlds/main.world`, and that is the same fact a stock map's `emit` block is
 * minted against (`mainWorld`). A project whose world has been moved or
 * renamed gets its files and no declarations, which the load-time check
 * reports rather than the import guessing.
 */
function withDeclaredEvents(
  source: MultiFileSource,
  map: StockMap,
): MultiFileSource {
  if (!map.raises?.length) {
    return source;
  }
  const screen = mainScreenId(source);
  const id = screen ?? fileIdAt(source, `${MAIN_WORLD_PATH}.world`);
  const world = id === undefined ? undefined : source.files[id];
  if (!world) {
    return source;
  }
  const contents = (screen ? declareScreenEvents : declareEvents)(
    world.contents ?? '',
    map.raises,
  );
  if (contents === world.contents) {
    return source;
  }
  return {
    ...source,
    files: {...source.files, [world.id]: {...world, contents}},
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
          contents: mainScreenId(current)
            ? raisedOnTheScreen(map.contents)
            : map.contents,
          folderId: placed.folderId,
        },
      },
    },
    path,
  };
}
