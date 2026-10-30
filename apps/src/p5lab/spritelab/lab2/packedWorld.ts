// A world as the start sources of a level with no project may write it: rows
// of characters with a legend, in place of the dense grid a project stores.
// The lab expands it when it takes those sources in and packs it again when
// levelbuilder saves them, so nothing in between sees the packed form.

import {Scene, Sources} from './types';
import {World, WorldCell} from './world';

export interface PackedWorld {
  /** Cells per side of the grid. */
  size: number;
  /** One string per row from the top. A row left off, or a row shorter
      than the size, is empty where nothing is written. */
  rows: string[];
  /** The cell each character draws. A character not listed is empty, so a
      world with nothing in it needs no legend. */
  legend?: Record<string, WorldCell>;
}

// The characters a legend is written with, in the order they are handed out.
const LEGEND_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function isPackedWorld(world: unknown): world is PackedWorld {
  const packed = world as PackedWorld | null | undefined;
  return (
    !!packed &&
    typeof packed === 'object' &&
    Array.isArray(packed.rows) &&
    typeof packed.size === 'number'
  );
}

export function unpackWorld(packed: PackedWorld): World {
  const {size, rows, legend = {}} = packed;
  const grid = Array.from({length: size}, (_, row) =>
    Array.from({length: size}, (_, col) => {
      const cell = legend[rows[row]?.[col] ?? ''];
      return cell ? {...cell} : null;
    })
  );
  return {grid};
}

/** The packed form of a world: one legend character per distinct cell, in
    order of first appearance, with empty cells and rows trimmed from the
    ends. A grid that is not square, or has more distinct cells than there
    are characters, stays a grid. */
export function packWorld(world: World): PackedWorld | World {
  const size = world.grid.length;
  if (world.grid.some(row => row.length !== size)) {
    return world;
  }
  const legend: Record<string, WorldCell> = {};
  const charFor = new Map<string, string>();
  for (const cell of world.grid.flat()) {
    const key = cell && `${cell.kind}:${cell.image}`;
    if (key && !charFor.has(key)) {
      const char = LEGEND_CHARS[charFor.size];
      if (!char) {
        return world;
      }
      charFor.set(key, char);
      legend[char] = {image: cell.image, kind: cell.kind};
    }
  }
  const rows = world.grid.map(row =>
    row
      .map(cell => (cell ? charFor.get(`${cell.kind}:${cell.image}`) : '.'))
      .join('')
      .replace(/\.+$/, '')
  );
  while (rows.length && rows[rows.length - 1] === '') {
    rows.pop();
  }
  return {size, rows, legend};
}

/** The sources with every packed world expanded; the same object when none
    is packed, so memoized readers keep their identity. */
export function unpackSources<T extends Sources>(sources: T): T {
  const scenes = sources.scenes;
  if (!scenes?.some(scene => isPackedWorld(scene.world))) {
    return sources;
  }
  const unpacked: Scene[] = scenes.map(scene =>
    isPackedWorld(scene.world)
      ? {...scene, world: unpackWorld(scene.world)}
      : scene
  );
  return {...sources, scenes: unpacked};
}

/** The sources with every scene's world packed, for writing into a level. */
export function packSources<T extends Sources>(sources: T): T {
  if (!sources.scenes?.some(scene => scene.world?.grid)) {
    return sources;
  }
  const packed = sources.scenes.map(scene =>
    scene.world?.grid
      ? {...scene, world: packWorld(scene.world) as World}
      : scene
  );
  return {...sources, scenes: packed};
}
