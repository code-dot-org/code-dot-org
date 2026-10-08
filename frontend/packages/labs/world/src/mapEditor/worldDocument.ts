// A world's file as the map editor reads it: the main map, beside the blocks.
//
// The map editor edits a MapDoc; what it reads that from and writes it back
// to is the document's business (`MapDocumentAdapter`). A `.map` is the
// document; a `.world` holds one under `map` and its workspace under `blocks`,
// and a write must carry the blocks through untouched
// (specs/MAIN_MAP_PLAN.md).

import {mapFromRaw, parseMap, type MapDoc} from './mapModel';
import {
  readWorldHeader,
  writeWorldBackgroundColor,
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
  world: {
    read: readWorldHeader,
    writeName: writeWorldName,
    writeDefault: writeWorldPropertyDefault,
    writeRuleValue: writeWorldRuleValue,
    writeBackgroundColor: writeWorldBackgroundColor,
  },
};
