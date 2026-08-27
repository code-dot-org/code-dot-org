/**
 * Map-painting support for the in-place visual level editor (Author Mode
 * Pass B). Owns the draft model, the wire-shape serializers, and the
 * per-skin paint-tool palette — everything that needs Cell-subclass
 * knowledge. MazeLab renders the stage overlay that calls into this file;
 * the host (studio) only ever sees the wire-format strings this file
 * produces, never a CellSerialization.
 */

import {
  FeatureType as BeeFeatureType,
  type BeeCellSerialization,
} from './BeeCell';
import type {CellConstructor, CellSerialization} from './Cell';
import {
  FeatureType as HarvesterFeatureType,
  type HarvesterCellSerialization,
} from './HarvesterCell';
import MazeController from './MazeController';
import MazeMap from './MazeMap';
import {
  FeatureType as PlanterFeatureType,
  type PlanterCellSerialization,
} from './PlanterCell';
import {isBeeSkin, isHarvesterSkin, isPlanterSkin} from './skin';
import {SquareType} from './tiles';

/** The draft map, `grid[row][col]`. Never a `MazeMap` — painting is plain
 * array surgery, and a `MazeMap` constructor does variable-grid expansion
 * work this draft has no use for. */
export type MapDraft = CellSerialization[][];

/**
 * `Subtype.getCellClass()` is `this`-independent in every subclass (every
 * override is an unconditional `return XCell`, checked against Bee/
 * Harvester/Planter/Neighborhood) — so it's safe to call off the
 * PROTOTYPE, without constructing a live Subtype (which needs a
 * MazeController and a mounted skin). This is the "duplicate the small
 * getSubtypeForSkin dispatch" option the plan calls out, done via the
 * existing static dispatch table rather than a second copy of it.
 */
export function getCellClassForSkin(skinId: string): CellConstructor {
  const SubtypeClass = MazeController.getSubtypeForSkin(skinId);
  return SubtypeClass.prototype.getCellClass();
}

/**
 * The draft map, read from whichever wire field is present —
 * `serialized_maze` (rich) if set, else `maze` projected through the
 * legacy `MazeMap.parseFromOldValues` path (mirrors
 * `MazeController.loadLevel_`'s own fallback order). `initialDirt` is
 * always absent on the wire (see BeeCell.parseFromOldValues's doc comment
 * and mazeLevel.test.ts's pinned regression) so it is not a parameter
 * here.
 */
export function mapDraftFromLevelProperties(
  map: number[][] | undefined,
  serializedMaze: CellSerialization[][] | undefined,
  skinId: string,
): MapDraft | undefined {
  if (serializedMaze) {
    return serializedMaze;
  }
  if (!map) {
    return undefined;
  }
  const cellClass = getCellClassForSkin(skinId);
  const mazeMap = MazeMap.parseFromOldValues(map, undefined, cellClass);
  return mazeMap.currentStaticGrid.map(row => row.map(cell => cell.serialize()));
}

/** `serialized_maze` (rich) and `maze` (its tileType projection), both as
 * JSON strings — the exact key pair `overrideLevelDefinition`'s patch
 * wants (see docs/prototypes/author-mode-level-editor.md §1.2): writing
 * only one lets `checkImportedMazeLevel`'s `extractGrid` see a stale grid,
 * since it tries `maze` first. */
export function serializeMapDraft(draft: MapDraft): {
  serialized_maze: string;
  maze: string;
} {
  return {
    serialized_maze: JSON.stringify(draft),
    maze: JSON.stringify(draft.map(row => row.map(cell => cell.tileType))),
  };
}

export interface PaintTool {
  id: string;
  label: string;
  /** Factory, not a value — every painted cell needs its own object, and a
   * shared literal would alias between cells that later diverge (e.g. one
   * flower's count changing must not change another's). */
  makeCell: () => CellSerialization;
}

const STRUCTURAL_TOOLS: PaintTool[] = [
  {id: 'wall', label: 'Wall', makeCell: () => ({tileType: SquareType.WALL})},
  {id: 'open', label: 'Open', makeCell: () => ({tileType: SquareType.OPEN})},
  {
    id: 'start',
    label: 'Start',
    makeCell: () => ({tileType: SquareType.START}),
  },
  {
    id: 'finish',
    label: 'Finish',
    makeCell: () => ({tileType: SquareType.FINISH}),
  },
  {
    id: 'obstacle',
    label: 'Obstacle',
    makeCell: () => ({tileType: SquareType.OBSTACLE}),
  },
];

// A fixed default count for skin-specific item tools — the click-paint
// gesture has no numeric input; the plan explicitly scopes count editing
// out of Pass B ("Leave variable/range cells... in the painter for now").
const DEFAULT_ITEM_COUNT = 1;

function beeTools(): PaintTool[] {
  return [
    {
      id: 'flower',
      label: 'Flower (nectar)',
      makeCell: (): BeeCellSerialization => ({
        tileType: SquareType.OPEN,
        featureType: BeeFeatureType.FLOWER,
        value: DEFAULT_ITEM_COUNT,
      }),
    },
    {
      id: 'hive',
      label: 'Hive (honey)',
      makeCell: (): BeeCellSerialization => ({
        tileType: SquareType.OPEN,
        featureType: BeeFeatureType.HIVE,
        value: DEFAULT_ITEM_COUNT,
      }),
    },
  ];
}

function harvesterTools(): PaintTool[] {
  const feature = (
    id: string,
    label: string,
    featureType: number,
  ): PaintTool => ({
    id,
    label,
    makeCell: (): HarvesterCellSerialization => ({
      tileType: SquareType.OPEN,
      value: DEFAULT_ITEM_COUNT,
      possibleFeatures: [featureType],
    }),
  });
  return [
    feature('corn', 'Corn', HarvesterFeatureType.CORN),
    feature('pumpkin', 'Pumpkin', HarvesterFeatureType.PUMPKIN),
    feature('lettuce', 'Lettuce', HarvesterFeatureType.LETTUCE),
  ];
}

function planterTools(): PaintTool[] {
  return [
    {
      id: 'soil',
      label: 'Soil',
      makeCell: (): PlanterCellSerialization => ({
        tileType: SquareType.OPEN,
        featureType: PlanterFeatureType.SOIL,
      }),
    },
    {
      id: 'sprout',
      label: 'Sprout',
      makeCell: (): PlanterCellSerialization => ({
        tileType: SquareType.OPEN,
        featureType: PlanterFeatureType.SPROUT,
      }),
    },
  ];
}

/** The palette this skin's author can paint with — structural tile types
 * every skin gets, plus the skin's own item cells. Respects skin semantics
 * (plan §"Respect skin semantics"): a farmer/collector level never offers
 * a bee flower. */
export function getPaintTools(skinId: string): PaintTool[] {
  if (isBeeSkin(skinId)) {
    return [...STRUCTURAL_TOOLS, ...beeTools()];
  }
  if (isHarvesterSkin(skinId)) {
    return [...STRUCTURAL_TOOLS, ...harvesterTools()];
  }
  if (isPlanterSkin(skinId)) {
    return [...STRUCTURAL_TOOLS, ...planterTools()];
  }
  return STRUCTURAL_TOOLS;
}

function isStartLike(tileType: number): boolean {
  return tileType === SquareType.START || tileType === SquareType.STARTANDFINISH;
}

function isFinishLike(tileType: number): boolean {
  return (
    tileType === SquareType.FINISH || tileType === SquareType.STARTANDFINISH
  );
}

/**
 * Applies one tool to one cell, returning a new draft (immutable — the
 * input `draft` is never mutated). Painting Start clears the previous
 * Start (demoting a STARTANDFINISH cell to FINISH rather than erasing it
 * outright, and vice versa for Finish) — the "singular start/finish"
 * invariant `inspectGrid` enforces on the generated-level side, kept true
 * here too so a painted map is never transiently invalid.
 */
export function paintCell(
  draft: MapDraft,
  row: number,
  col: number,
  tool: PaintTool,
): MapDraft {
  const next = draft.map(r => r.slice());
  const newCell = tool.makeCell();

  if (tool.id === 'start' || tool.id === 'finish') {
    for (let r = 0; r < next.length; r++) {
      for (let c = 0; c < next[r].length; c++) {
        if (r === row && c === col) {
          continue;
        }
        const tileType = next[r][c].tileType;
        if (tool.id === 'start' && isStartLike(tileType)) {
          next[r] = next[r].slice();
          next[r][c] = {
            ...next[r][c],
            tileType:
              tileType === SquareType.STARTANDFINISH
                ? SquareType.FINISH
                : SquareType.OPEN,
          };
        }
        if (tool.id === 'finish' && isFinishLike(tileType)) {
          next[r] = next[r].slice();
          next[r][c] = {
            ...next[r][c],
            tileType:
              tileType === SquareType.STARTANDFINISH
                ? SquareType.START
                : SquareType.OPEN,
          };
        }
      }
    }
    const existingTileType = draft[row][col].tileType;
    if (tool.id === 'start' && isFinishLike(existingTileType)) {
      newCell.tileType = SquareType.STARTANDFINISH;
    }
    if (tool.id === 'finish' && isStartLike(existingTileType)) {
      newCell.tileType = SquareType.STARTANDFINISH;
    }
  }

  next[row][col] = newCell;
  return next;
}
