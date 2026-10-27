// A file as the map editor reads it.
//
// The map editor edits a MapDoc; what it reads that from and writes it back
// to is the document's business (`MapDocumentAdapter`). A `.map` is the
// document. A `.screen` is a map document with the game's values beside it as
// keys, and a write must carry those through (specs/SCREEN_MAP_PLAN.md,
// step 4).

import {MAIN_SCREEN_PATH} from '../mainWorld';

import {parseMap, type MapDoc} from './mapModel';
import {
  addScreenProperty,
  readScreenHeader,
  writeScreenBackgroundColor,
  writeScreenName,
  writeScreenPropertyDefault,
  writeScreenRuleValue,
  writeScreenTheme,
} from './screenProperties';
import type {WorldHeader, WorldRuleProperty} from './worldProperties';

export interface MapDocumentAdapter {
  /** The map the file holds. */
  read(contents: string): MapDoc;
  /** The file with `doc` as its map, and everything else as it was. */
  write(contents: string, doc: MapDoc): string;
  /** The module the map's scripts belong to, from the file's path. */
  modulePath(path: string): string;
  /** Whether the map has a workspace of its own to open. */
  hasMapScript: boolean;
  /**
   * What the document's own workspace is, when it has one: a map's, or a
   * screen's, which holds the game's hats rather than the map hats.
   */
  scriptKind?: 'map' | 'screen';
  /**
   * The game the document is, for the inspector with nothing selected: its
   * name and properties, and their edits. Only the Main Screen has one.
   */
  world?: {
    read(
      contents: string,
      ruleProperties?: readonly WorldRuleProperty[],
    ): WorldHeader | undefined;
    writeName(contents: string, name: string): string;
    writeDefault(contents: string, property: string, value: string): string;
    /** …and a RULE's setting. */
    writeRuleValue(
      contents: string,
      property: WorldRuleProperty,
      value: string,
    ): string;
    /** …and the color behind the background. */
    writeBackgroundColor(contents: string, color: string): string;
    /** …and the theme it is painted in. */
    writeTheme(contents: string, theme: string | undefined): string;
    /** What the inspector's head calls it. */
    title: string;
    /** A new value of the game's own. */
    addProperty?(contents: string, name: string, type: string): string;
  };
}

/** A `.map` file: the document is the map. */
export const mapFileDocument: MapDocumentAdapter = {
  read: parseMap,
  write: (_contents, doc) => JSON.stringify(doc, null, 2),
  modulePath: path => path.replace(/\.map$/, ''),
  hasMapScript: true,
};

/** The keys of a screen that are not its map's, kept through a map edit. */
const SCREEN_KEYS = [
  'name',
  'properties',
  'events',
  'rules',
  'backgroundColor',
] as const;

/**
 * The Main Screen's file: the document is the map, with the game's values
 * beside it, which its inspector shows.
 */
export const screenFileDocument: MapDocumentAdapter = {
  read: parseMap,
  write: (contents, doc) => {
    let kept: Record<string, unknown> = {};
    try {
      const held = JSON.parse(contents) as Record<string, unknown>;
      kept = Object.fromEntries(
        SCREEN_KEYS.filter(key => held?.[key] !== undefined).map(key => [
          key,
          held[key],
        ]),
      );
    } catch {
      // A screen that will not parse has nothing to keep.
    }
    return JSON.stringify({...kept, ...doc}, null, 2);
  },
  modulePath: path => path.replace(/\.screen$/, ''),
  hasMapScript: true,
  scriptKind: 'screen',
  world: {
    title: 'Main Screen',
    read: readScreenHeader,
    writeName: writeScreenName,
    writeDefault: writeScreenPropertyDefault,
    writeRuleValue: writeScreenRuleValue,
    writeBackgroundColor: writeScreenBackgroundColor,
    writeTheme: writeScreenTheme,
    addProperty: addScreenProperty,
  },
};

/**
 * The adapter for a `.screen` at `path`. The Main Screen is the game, and
 * shows the game's values; any other screen is a map the game loads.
 */
export const screenDocumentFor = (path: string): MapDocumentAdapter =>
  path === `${MAIN_SCREEN_PATH}.screen`
    ? screenFileDocument
    : {...mapFileDocument, modulePath: screenFileDocument.modulePath};
