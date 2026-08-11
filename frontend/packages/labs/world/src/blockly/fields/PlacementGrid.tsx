// The map, as a field editor.
//
// A grid of the world's tiles. Click an empty cell and this block places one
// there; click a cell it already placed in and that one goes. That is the whole
// interaction — no palette (the block's dropdown says which actor), no
// inspector, no camera. What it is FOR is arranging twenty of something without
// twenty blocks, and for that a window is more than it needs.
//
// Everything else in the world is drawn behind, dimmed and not clickable: the
// other `create actor in map` blocks' placements. A coin's place is worth
// judging against the ground under it, but only this block's are this popup's
// to change.

import {useMemo} from 'react';

import type {Blockly} from '@code-dot-org/blockly';

import {TILE_SIZE} from '../../runtime/viewport';
import {actorThumbnail} from '../actorThumbnails';
import {localActorFor} from '../localActors';
import {
  cellOf,
  placementAt,
  toggleCell,
  type Cell,
  type MapPlacement,
} from '../mapPlacements';

import {mapGridSize} from './mapGridSize';
import styles from './placementGrid.module.css';

export interface PlacementGridProps {
  value: MapPlacement[];
  onChange: (value: MapPlacement[]) => void;
  sourceBlock: Blockly.BlockSvg | null;
}

/** One drawn thing in a cell: what it is, and whether this block owns it. */
interface Occupant {
  type: string;
  mine: boolean;
}

/** The actor type a `create actor in map` block places, as a placed one carries it. */
const typeOf = (block: Blockly.Block): string | undefined => {
  const value = block.getFieldValue('ACTOR');
  if (!value) {
    return undefined;
  }
  return localActorFor(block, value)?.type ?? value;
};

const key = (cell: Cell) => `${cell.column},${cell.row}`;

export const PlacementGrid = ({
  value,
  onChange,
  sourceBlock,
}: PlacementGridProps) => {
  const tile = TILE_SIZE;
  const ownType = sourceBlock ? typeOf(sourceBlock) : undefined;

  // The rest of the world, by cell. Read straight off the workspace: the other
  // blocks are right there, and asking them is cheaper than keeping a copy of
  // their state anywhere else.
  const occupied = useMemo(() => {
    const cells = new Map<string, Occupant>();
    const workspace = sourceBlock?.workspace;
    for (const block of workspace?.getBlocksByType(
      'world_create_in_map',
      false,
    ) ?? []) {
      if (block.id === sourceBlock?.id) {
        continue;
      }
      const type = typeOf(block);
      if (!type) {
        continue;
      }
      const theirs =
        (block.getFieldValue('PLACEMENTS') as MapPlacement[] | null) ?? [];
      for (const placement of theirs) {
        const at = cellOf(placement, tile);
        if (at) {
          cells.set(key(at), {type, mine: false});
        }
      }
    }
    // Ours last, so a cell this block placed in reads as this block's.
    for (const placement of value) {
      const at = cellOf(placement, tile);
      if (at && ownType) {
        cells.set(key(at), {type: ownType, mine: true});
      }
    }
    return cells;
  }, [sourceBlock, value, ownType, tile]);

  // As big as the world says it is (./mapGridSize), which for a world that
  // says nothing is one screen — the size this grid always used to be.
  const grid = mapGridSize(sourceBlock);
  // Cells shrink to fit a wide map, down to a floor a finger can still hit;
  // past that the strip scrolls (placementGrid.module.css).
  const cellSize = Math.max(12, Math.min(22, Math.floor(560 / grid.columns)));
  const rows = Array.from({length: grid.rows}, (_, row) => row);
  const columns = Array.from({length: grid.columns}, (_, column) => column);

  return (
    <div>
      <div className={styles.caption}>
        <span>Click to place, click again to remove</span>
        <span className={styles.count}>{value.length}</span>
      </div>
      <div className={styles.scroller}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${grid.columns}, auto)`,
            ['--placement-cell' as string]: `${cellSize}px`,
          }}
          role="grid"
          aria-label="Map placements"
        >
          {rows.map(row =>
            columns.map(column => {
              const cell = {column, row};
              const occupant = occupied.get(key(cell));
              const thumbnail = occupant && actorThumbnail(occupant.type);
              const mine = Boolean(placementAt(value, cell, tile));
              return (
                <button
                  key={key(cell)}
                  type="button"
                  className={styles.cell}
                  // Column and row, so the announcement is a place on the map;
                  // `aria-pressed` says whether this block has one there, which is
                  // exactly what the click toggles.
                  aria-label={`Column ${column + 1}, row ${row + 1}`}
                  aria-pressed={mine}
                  onClick={() => onChange(toggleCell(value, cell, tile))}
                >
                  {occupant &&
                    (thumbnail ? (
                      <img
                        className={
                          occupant.mine
                            ? styles.mine
                            : `${styles.mine} ${styles.other}`
                        }
                        src={thumbnail}
                        alt=""
                      />
                    ) : (
                      <span
                        className={
                          occupant.mine
                            ? styles.marker
                            : `${styles.marker} ${styles.other}`
                        }
                      />
                    ))}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacementGrid;
