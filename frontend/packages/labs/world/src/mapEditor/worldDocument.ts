// A world's file as the map editor reads it: the main map, beside the blocks.
//
// The map editor edits a MapDoc; what it reads that from and writes it back
// to is the document's business (`MapDocumentAdapter`). A `.map` is the
// document; a `.world` holds one under `map` and its workspace under `blocks`,
// and a write must carry the blocks through untouched
// (specs/MAIN_MAP_PLAN.md). A `.screen` is a map document with the game's
// values beside it as keys, and a write must carry those through
// (specs/SCREEN_MAP_PLAN.md, step 4).

import {MAIN_SCREEN_PATH} from '../mainWorld';

import {mapFromRaw, parseMap, type MapDoc} from './mapModel';
import {
  addScreenProperty,
  readScreenHeader,
  writeScreenBackgroundColor,
  writeScreenName,
  writeScreenPropertyDefault,
  writeScreenRuleValue,
  writeScreenTheme,
} from './screenProperties';
import {
  readWorldHeader,
  writeWorldBackgroundColor,
  writeWorldTheme,
  writeWorldRuleValue,
  writeWorldName,
  writeWorldPropertyDefault,
  type WorldHeader,
  type WorldRuleProperty,
} from './worldProperties';

export interface MapDocumentAdapter {
  /** The map the file holds. */
  read(contents: string): MapDoc;
  /** The file with `doc` as its map, and everything else as it was. */
  write(contents: string, doc: MapDoc): string;
  /** The module the map's scripts belong to, from the file's path. */
  modulePath(path: string): string;
  /**
   * Whether the map has a workspace of its own to open. A `.map` does; a
   * world's is the world's workspace, reached another way.
   */
  hasMapScript: boolean;
  /**
   * What the document's own workspace is, when it has one: a map's, or a
   * screen's, which holds the game's hats rather than the map hats.
   */
  scriptKind?: 'map' | 'screen';
  /**
   * Whether the world's own cameras are edited here. A world's are, on its
   * main map; a screen has none, since a camera belongs to the Viewport
   * that looks through it (specs/SIMPLE_INTERFACE.md).
   */
  hasWorldCameras?: boolean;
  /**
   * The world the document is, for the inspector with nothing selected: its
   * name and properties, and the two edits. Only a `.world` has one.
   */
  world?: {
    read(
      contents: string,
      ruleProperties?: readonly WorldRuleProperty[],
    ): WorldHeader | undefined;
    writeName(contents: string, name: string): string;
    writeDefault(contents: string, property: string, value: string): string;
    /** …and a RULE's, which is a `set` row rather than a DEFAULT field. */
    writeRuleValue(
      contents: string,
      property: WorldRuleProperty,
      value: string,
    ): string;
    /** …and the color behind the background, a `set background color` row. */
    writeBackgroundColor(contents: string, color: string): string;
    /** …and the theme it is painted in, a `use theme` row. */
    writeTheme(contents: string, theme: string | undefined): string;
    /** What the inspector's head calls it. */
    title: string;
    /**
     * A new value of the game's own, where the document declares them as
     * data. A world's are `define property` rows, made in its code.
     */
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

/** A `.world` file: the map is one key of a document that is mostly blocks. */
export const worldFileDocument: MapDocumentAdapter = {
  read: contents => {
    try {
      const parsed = JSON.parse(contents) as {map?: unknown};
      return mapFromRaw(
        parsed && typeof parsed === 'object' && parsed.map
          ? (parsed.map as Partial<MapDoc>)
          : {},
      );
    } catch {
      return mapFromRaw({});
    }
  },
  write: (contents, doc) => {
    let parsed: Record<string, unknown> = {};
    try {
      const held = JSON.parse(contents) as unknown;
      if (held && typeof held === 'object' && !Array.isArray(held)) {
        parsed = held as Record<string, unknown>;
      }
    } catch {
      // A world that will not parse has no blocks to keep.
    }
    return JSON.stringify({...parsed, map: doc}, null, 2);
  },
  modulePath: path => path.replace(/\.world$/, ''),
  hasMapScript: false,
  hasWorldCameras: true,
  world: {
    title: 'World',
    read: readWorldHeader,
    writeName: writeWorldName,
    writeDefault: writeWorldPropertyDefault,
    writeRuleValue: writeWorldRuleValue,
    writeBackgroundColor: writeWorldBackgroundColor,
    writeTheme: writeWorldTheme,
  },
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
