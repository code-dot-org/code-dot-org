/**
 * Map-painting support for the in-place visual level editor (Author Mode
 * Pass B). Owns the draft model, the wire-shape serializers, and the
 * per-skin paint-tool palette — everything that needs Cell-subclass
 * knowledge. MazeLab renders the stage overlay that calls into this file;
 * the host (studio) only ever sees the wire-format strings this file
 * produces, never a CellSerialization.
 */

import {appendBlockToProgram} from '@code-dot-org/blockly/xml';

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
import {
  isBeeSkin,
  isCollectorSkin,
  isFarmerSkin,
  isHarvesterSkin,
  isPlanterSkin,
} from './skin';
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

// The legacy per-cell value grid `MazeMap.parseFromOldValues`/
// `Cell.parseFromOldValues` read as their `initialDirt` argument before
// `serialized_maze` existed — a single signed number per cell, bee's sign
// distinguishing flower (positive) from hive (negative) the same way
// `BeeCell.parseFromOldValues` decodes it back. Our own runtime never reads
// this once `serialized_maze` is written (it's preferred whenever present —
// MazeController.loadLevel_), but production's Karel model
// (dashboard/app/models/levels/karel.rb) still serializes it, and nothing
// else in this prototype (or a future publish adapter) should have to
// reverse-derive it from `serialized_maze` itself.
function initialDirtValue(cell: CellSerialization, skinId: string): number {
  const value = cell.value ?? 0;
  if (isBeeSkin(skinId)) {
    const bee = cell as BeeCellSerialization;
    if (bee.featureType === BeeFeatureType.HIVE) {
      return -value;
    }
    if (bee.featureType === BeeFeatureType.FLOWER) {
      return value;
    }
    return 0;
  }
  return value;
}

/** `serialized_maze` (rich), `maze` (its tileType projection), and
 * `initial_dirt` (its legacy per-cell value projection), all as JSON
 * strings — the key set `overrideLevelDefinition`'s patch wants (see
 * docs/prototypes/author-mode-level-editor.md §1.2): writing only
 * `serialized_maze`/`maze` lets `checkImportedMazeLevel`'s `extractGrid` see
 * a stale grid, since it tries `maze` first, and leaves `initial_dirt`
 * — the field other Karel consumers key on — stale behind a painted map. */
export function serializeMapDraft(
  draft: MapDraft,
  skinId: string,
): {
  serialized_maze: string;
  maze: string;
  initial_dirt: string;
} {
  return {
    serialized_maze: JSON.stringify(draft),
    maze: JSON.stringify(draft.map(row => row.map(cell => cell.tileType))),
    initial_dirt: JSON.stringify(
      draft.map(row => row.map(cell => initialDirtValue(cell, skinId))),
    ),
  };
}

/**
 * Applies one paint action to `current` (or, when painting hasn't started
 * yet this editing session, to a fresh draft `fallback` derives from the
 * served levelProperties) and returns the new draft. Pure, so a caller that
 * threads each call's return value back in as the next call's `current`
 * composes correctly across any burst of calls, however tightly spaced —
 * this is the entire state-update MazeLab's paint handler needs, kept here
 * (not inline in the component) so the COMPOSITION itself, not just
 * `paintCell`, is unit-testable without a browser or a React render cycle
 * to race against.
 */
export function applyPaint(
  current: MapDraft | undefined,
  fallback: () => MapDraft | undefined,
  row: number,
  col: number,
  tool: PaintTool,
): MapDraft | undefined {
  const base = current ?? fallback();
  if (!base) {
    return current;
  }
  return paintCell(base, row, col, tool);
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

/**
 * Toolbox composition (Author Mode Pass C) — the chip-tray palette and the
 * wire-format XML it composes/decomposes. A palette entry is a full seeded
 * `<block>` fragment, not a bare type: `blocks.ts`'s field_dropdown blocks
 * (maze_turn, maze_move, ...) render only their first option when the field
 * is unspecified, so turnLeft/turnRight (etc.) are distinct entries, mirroring
 * `TOOLBOX_BLOCK_XML` (apps/authoring-service/src/levels/mazeLevel.ts).
 *
 * Scope: this table covers the structural/loop/conditional primitives every
 * skin shares, plus each skin's own action block(s) (the
 * `SKIN_ACTION_BLOCKS` set mazeLevel.ts already curates for the AI tool).
 * It does not enumerate every skin-specific predicate variant the block
 * library defines (bee_ifOnlyFlower, harvester's per-crop/any-crop
 * conditionals, collector_ifCollectible/whileCollectible, planter's
 * at-soil/at-sprout conditionals) — those stay reachable only on levels that
 * already have them (trayFromToolboxXml below keeps an unrecognised served
 * block as a pass-through chip, never drops it), just not offered as
 * "available blocks" to add fresh. A real gap for a later pass, not a
 * silent one: nothing already in a level's toolbox is lost.
 */
export interface ToolboxPaletteEntry {
  id: string;
  label: string;
  xml: string;
}

const STRUCTURAL_PALETTE: ToolboxPaletteEntry[] = [
  {id: 'moveForward', label: 'Move forward', xml: '<block type="maze_moveForward"/>'},
  {
    id: 'moveBackward',
    label: 'Move backward',
    xml: '<block type="maze_move"><field name="DIR">moveBackward</field></block>',
  },
  {
    id: 'turnLeft',
    label: 'Turn left',
    xml: '<block type="maze_turn"><field name="DIR">turnLeft</field></block>',
  },
  {
    id: 'turnRight',
    label: 'Turn right',
    xml: '<block type="maze_turn"><field name="DIR">turnRight</field></block>',
  },
  {id: 'moveNorth', label: 'Move north', xml: '<block type="maze_moveNorth"/>'},
  {id: 'moveSouth', label: 'Move south', xml: '<block type="maze_moveSouth"/>'},
  {id: 'moveEast', label: 'Move east', xml: '<block type="maze_moveEast"/>'},
  {id: 'moveWest', label: 'Move west', xml: '<block type="maze_moveWest"/>'},
  {
    id: 'repeat',
    label: 'Repeat N times',
    xml: '<block type="controls_repeat_dropdown"><field name="TIMES" config="1-20">3</field></block>',
  },
  {id: 'forever', label: 'Repeat until finish', xml: '<block type="maze_forever"/>'},
  {id: 'untilBlocked', label: 'While path ahead', xml: '<block type="maze_untilBlocked"/>'},
  {
    id: 'ifPathAhead',
    label: 'If path ahead',
    xml: '<block type="maze_if"><field name="DIR">isPathForward</field></block>',
  },
  {
    id: 'ifElsePathAhead',
    label: 'If/else path ahead',
    xml: '<block type="maze_ifElse"><field name="DIR">isPathForward</field></block>',
  },
];

// Farmer's pile/hole predicates are a distinct block family (karel_if/
// karel_ifElse) from the generic path predicates above.
const FARMER_PALETTE: ToolboxPaletteEntry[] = [
  {id: 'fill', label: 'Fill hole', xml: '<block type="maze_fill"/>'},
  {id: 'dig', label: 'Dig pile', xml: '<block type="maze_dig"/>'},
  {
    id: 'ifPilePresent',
    label: 'If there is a pile',
    xml: '<block type="karel_if"><field name="DIR">pilePresent</field></block>',
  },
  {
    id: 'ifElsePilePresent',
    label: 'If/else there is a pile',
    xml: '<block type="karel_ifElse"><field name="DIR">pilePresent</field></block>',
  },
];

const BEE_PALETTE: ToolboxPaletteEntry[] = [
  {id: 'getNectar', label: 'Get nectar', xml: '<block type="maze_nectar"/>'},
  {id: 'makeHoney', label: 'Make honey', xml: '<block type="maze_honey"/>'},
];

const COLLECTOR_PALETTE: ToolboxPaletteEntry[] = [
  {id: 'collect', label: 'Collect', xml: '<block type="collector_collect"/>'},
];

const HARVESTER_PALETTE: ToolboxPaletteEntry[] = [
  {id: 'harvestCorn', label: 'Pick corn', xml: '<block type="harvester_corn"/>'},
  {id: 'harvestPumpkin', label: 'Pick pumpkin', xml: '<block type="harvester_pumpkin"/>'},
  {id: 'harvestLettuce', label: 'Pick lettuce', xml: '<block type="harvester_lettuce"/>'},
];

const PLANTER_PALETTE: ToolboxPaletteEntry[] = [
  {id: 'plant', label: 'Plant', xml: '<block type="planter_plant"/>'},
];

// Block types that open a body (a `<statement name="DO">`) a click-to-add
// stream should be able to nest INTO — the toolbox palette's own seed XML
// (below) never includes the empty statement tag itself (a bare seed is
// also what the served toolboxBlocksXml/flyout wants), so addBlockToProgram
// injects one only on the copy it composes onto the workspace program.
// `maze_ifElse`/`karel_ifElse` are deliberately excluded: they need both a
// DO and an ELSE body, and a click stream has no way to pick which one —
// full two-branch support is a real gap, not a silent one (a click after
// one lands as a `<next>` sibling instead of nesting into either branch).
const CONTAINER_BLOCK_TYPES = new Set([
  'controls_repeat_dropdown',
  'maze_forever',
  'maze_untilBlocked',
  'maze_if',
  'karel_if',
]);

function withEmptyBody(blockXml: string): string {
  const type = /<block type="([^"]+)"/.exec(blockXml)?.[1];
  if (!type || !CONTAINER_BLOCK_TYPES.has(type) || blockXml.includes('<statement')) {
    return blockXml;
  }
  return blockXml.replace('</block>', '<statement name="DO"></statement></block>');
}

/**
 * The maze-aware half of click-to-add (Author Mode gap #7): composes the
 * new program XML for a click on `entry` against `programXml` (the
 * workspace's current content, from resolveWorkspaceOverrideXml), giving
 * a fresh container block (see CONTAINER_BLOCK_TYPES) an empty body first
 * so blockly/xml's appendBlockToProgram can detect it as "open" and nest
 * the next click inside it.
 */
export function addBlockToProgramXml(
  programXml: string,
  entry: ToolboxPaletteEntry | ToolboxTrayEntry,
): string {
  return appendBlockToProgram(programXml, withEmptyBody(entry.xml));
}

/** The blocks this skin's author can add to the student toolbox. */
export function getToolboxPalette(skinId: string): ToolboxPaletteEntry[] {
  if (isFarmerSkin(skinId)) {
    return [...STRUCTURAL_PALETTE, ...FARMER_PALETTE];
  }
  if (isBeeSkin(skinId)) {
    return [...STRUCTURAL_PALETTE, ...BEE_PALETTE];
  }
  if (isCollectorSkin(skinId)) {
    return [...STRUCTURAL_PALETTE, ...COLLECTOR_PALETTE];
  }
  if (isHarvesterSkin(skinId)) {
    return [...STRUCTURAL_PALETTE, ...HARVESTER_PALETTE];
  }
  if (isPlanterSkin(skinId)) {
    return [...STRUCTURAL_PALETTE, ...PLANTER_PALETTE];
  }
  return STRUCTURAL_PALETTE;
}

/** One chip in the student-toolbox tray. `xml` is the block fragment as it
 * will be written to `toolboxBlocksXml` — for a palette match this is the
 * palette's canonical seed; for a block already on the level that the
 * palette does not recognise, it is that block's own served fragment
 * (verbatim, `limit=` and all), so nothing already authored is lost. */
export interface ToolboxTrayEntry {
  id: string;
  label: string;
  xml: string;
}

let trayEntrySeq = 0;

// Match a served `<block>` element against the palette by type, and by DIR
// field value when the palette disambiguates on it (turnLeft vs turnRight,
// etc.) — the same field the palette itself seeds.
function matchPaletteEntry(
  blockEl: Element,
  palette: ToolboxPaletteEntry[],
): ToolboxPaletteEntry | undefined {
  const type = blockEl.getAttribute('type');
  const dirField = Array.from(blockEl.children).find(
    el => (el.tagName === 'field' || el.tagName === 'title') &&
      el.getAttribute('name') === 'DIR',
  )?.textContent;
  return palette.find(entry => {
    const entryDoc = new DOMParser().parseFromString(entry.xml, 'text/xml');
    const entryEl = entryDoc.documentElement;
    if (entryEl.getAttribute('type') !== type) {
      return false;
    }
    const entryDir = Array.from(entryEl.children).find(
      el => el.tagName === 'field' && el.getAttribute('name') === 'DIR',
    )?.textContent;
    return entryDir === undefined ? dirField === undefined : entryDir === dirField;
  });
}

/** Parses a served `toolboxBlocksXml` into the tray's ordered chip list,
 * seeding the panel with the level's current student toolbox. Blocks the
 * palette does not recognise become pass-through chips (see
 * ToolboxTrayEntry) rather than being silently dropped. */
export function trayFromToolboxXml(
  xmlString: string,
  skinId: string,
): ToolboxTrayEntry[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  const palette = getToolboxPalette(skinId);
  const serializer = new XMLSerializer();
  return Array.from(xml.documentElement.children)
    .filter(el => el.tagName === 'block')
    .map(el => {
      const match = matchPaletteEntry(el, palette);
      return {
        id: match?.id ?? `custom-${el.getAttribute('type')}-${trayEntrySeq++}`,
        label: match?.label ?? el.getAttribute('type') ?? 'block',
        xml: serializer.serializeToString(el),
      };
    });
}

/** Composes the tray's ordered chip list back into `toolboxBlocksXml` — the
 * inverse of trayFromToolboxXml, and what drives both the Save patch and
 * (via convertBlocklyXmlToToolbox) the live flyout during editing. */
export function toolboxXmlFromTray(entries: ToolboxTrayEntry[]): string {
  return `<xml>${entries.map(entry => entry.xml).join('')}</xml>`;
}

export interface GoalField {
  key: 'nectar_goal' | 'honey_goal' | 'min_collected';
  label: string;
}

/**
 * Karel-family goal fields this skin's author can set. Read-only as far as
 * the ported engine goes — `Validator.succeeded` only ever compares
 * Pegman's position to the grid's finish tile; no skin's win condition
 * reads these (see apps/authoring-service/src/levels/mazeLevel.ts's module
 * header) — but they're real fields production Karel serializes
 * (dashboard/app/models/levels/karel.rb: nectar_goal/honey_goal;
 * grid.rb#update_maze: min_collected, checked against every skin's total
 * painted item value on save) and the one thing `checkImportedMazeLevel`
 * can validate a goal-based grid against once it has no finish tile to
 * simulate a run toward.
 */
export function getGoalFields(skinId: string): GoalField[] {
  const fields: GoalField[] = [];
  if (isBeeSkin(skinId)) {
    fields.push(
      {key: 'nectar_goal', label: 'Nectar goal'},
      {key: 'honey_goal', label: 'Honey goal'},
    );
  }
  if (
    isFarmerSkin(skinId) ||
    isBeeSkin(skinId) ||
    isCollectorSkin(skinId) ||
    isHarvesterSkin(skinId) ||
    isPlanterSkin(skinId)
  ) {
    fields.push({key: 'min_collected', label: 'Minimum to collect'});
  }
  return fields;
}
