// A world as a level's start sources may write it: rows of characters with a
// legend, in place of the dense grid a project stores. The lab expands it on
// the way in, so nothing past the sources boundary sees the packed form.

import {Scene, Sources} from './types';
import {World, WorldCell} from './world';

export interface PackedWorld {
  /** Cells per side of the grid. */
  size: number;
  /** One string per row from the top. A row left off, or a row shorter
      than the size, is empty where nothing is written. */
  rows: string[];
  /** The cell each character draws. A character not listed is empty. */
  legend: Record<string, WorldCell>;
}

export function isPackedWorld(world: unknown): world is PackedWorld {
  return (
    !!world &&
    typeof world === 'object' &&
    Array.isArray((world as PackedWorld).rows) &&
    typeof (world as PackedWorld).size === 'number'
  );
}

export function unpackWorld(packed: PackedWorld): World {
  const {size, rows, legend} = packed;
  const grid = Array.from({length: size}, (_, row) =>
    Array.from({length: size}, (_, col) => {
      const cell = legend[rows[row]?.[col] ?? ''];
      return cell ? {...cell} : null;
    })
  );
  return {grid};
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
