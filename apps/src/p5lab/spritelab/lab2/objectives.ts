// A level's checklist (the objectives level property): what each item asks
// the student to do, read against the project and the running game.

import {ImageType} from './ai/images/types';
import {ImageCounts} from './projectCounts';
import {Tab} from './redux/spriteLab2Redux';
import {cellSize, DEFAULT_SCENE_GRID_SIZE, WorldCell} from './world';

/** One kind of thing a level can ask for. */
export type ObjectiveCheck =
  | {
      kind: 'image';
      imageType: ImageType;
      /** Images of the type made on this level; 1 when omitted. */
      count?: number;
    }
  | {
      kind: 'block';
      /** The block type a real (not shadow) block must have, or any of
          several. */
      type: string | string[];
      /** Only under a top block of this type (the hat it hangs from). */
      under?: string;
      /** Only under the top block carrying this `data` tag (add_blocks). */
      data?: string;
      /** Field values the block must carry. */
      fields?: Record<string, string>;
      /** A block type that must sit inside the block (an input). */
      contains?: string;
      /** A field that must name an image the project has. */
      namesImage?: string;
      /** The block's SPRITE input must name the image carrying this role. */
      spriteRole?: string;
    }
  | {
      kind: 'world';
      /** A cell showing the image that carries this role. */
      role?: string;
      /** At least this many cells of this kind. */
      cellKind?: WorldCell['kind'];
      count?: number;
      /** Any difference from the grid the level opened with. */
      changed?: boolean;
    }
  | {
      kind: 'play';
      /** The game ran this long in one go. */
      seconds?: number;
    }
  | {
      kind: 'reach';
      /** The player touched the sprite whose image carries this role. */
      role?: string;
      /** The player's feet rose this far up the view, 0 at the floor to 1. */
      height?: number;
      /** The player ran a cell sideways or left the ground. */
      moved?: boolean;
      /** The player's center got this far across the view, 0 to 1. */
      across?: number;
    }
  | {
      kind: 'scene';
      id: string;
      /** The student opened the scene in the editor, rather than a jump
          landing on it. */
      opened?: boolean;
    }
  | {kind: 'tab'; name: Tab};

export interface Objective {
  /** Markdown. */
  text: string;
  check: ObjectiveCheck;
}

export interface Objectives {
  /** Markdown, shown above the list, or alone when there is no list. */
  title?: string;
  /** None means nothing to do: Continue from the start. */
  items?: Objective[];
  /** A short line the collapsed Guide keeps. */
  collapsedText?: string;
}

/** What the running game has done so far on this level. */
export interface RuntimeProgress {
  /** Seconds the game has run in one go, at its longest. */
  longestRunSeconds: number;
  /** Image names of sprites the player has touched. */
  touched: ReadonlySet<string>;
  /** The highest the player's feet have been, 0 at the floor to 1. */
  highest: number;
  /** The farthest the player has run from where a run started, in px. */
  farthest: number;
  /** The most the feet have risen above a run's lowest point, 0 to 1. */
  risen: number;
  /** The farthest right the player's center has been, 0 to 1. */
  rightmost: number;
  /** Scenes a jump has landed on. */
  scenesLanded: ReadonlySet<string>;
}

/** Which of the running game's reports the checklist reads. */
export interface RuntimeNeeds {
  seconds: boolean;
  touch: boolean;
  height: boolean;
  move: boolean;
  across: boolean;
}

export function runtimeNeeds(objectives: Objectives | undefined): RuntimeNeeds {
  const needs = {
    seconds: false,
    touch: false,
    height: false,
    move: false,
    across: false,
  };
  objectives?.items?.forEach(({check}) => {
    if (check.kind === 'play' && check.seconds !== undefined) {
      needs.seconds = true;
    } else if (check.kind === 'reach') {
      needs.touch ||= check.role !== undefined;
      needs.height ||= check.height !== undefined;
      needs.move ||= check.moved === true;
      needs.across ||= check.across !== undefined;
    }
  });
  return needs;
}

/** A run of one default-grid cell counts as having moved. */
export const MOVED_PX = cellSize(DEFAULT_SCENE_GRID_SIZE);
/** A rise of a tenth of the view counts as a jump. */
export const JUMPED_RISE = 0.1;

export const EMPTY_RUNTIME: RuntimeProgress = {
  longestRunSeconds: 0,
  touched: new Set(),
  highest: 0,
  farthest: 0,
  risen: 0,
  rightmost: 0,
  scenesLanded: new Set(),
};

/** A Blockly block as the workspace serializes it. */
export interface BlockState {
  type: string;
  data?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, {block?: BlockState; shadow?: BlockState}>;
  next?: {block?: BlockState; shadow?: BlockState};
  disabledReasons?: string[];
}

export interface WorkspaceSource {
  blocks?: {blocks?: BlockState[]};
}

export interface ObjectiveInputs {
  /** Images made on this level, by type. */
  images: ImageCounts;
  grid?: (WorldCell | null)[][];
  /** The grid the level opened with. */
  baselineGrid?: (WorldCell | null)[][];
  /** Image name by role. */
  imageForRole: Record<string, string | undefined>;
  /** Every image the project has. */
  imageNames: ReadonlySet<string>;
  source?: WorkspaceSource;
  activeTab: Tab;
  activeSceneId?: string;
  everPlayed: boolean;
  runtime: RuntimeProgress;
}

// A field saved as "<field name="X">value</field>" or as the bare value;
// the legacy form also quotes a name.
export function fieldValue(raw: unknown): string | undefined {
  if (typeof raw !== 'string') {
    return raw === undefined || raw === null ? undefined : String(raw);
  }
  const inner = /^<field[^>]*>([\s\S]*)<\/field>$/.exec(raw)?.[1] ?? raw;
  return inner.replace(/^"(.*)"$/, '$1');
}

/** Every real block in a tree, in reading order: the chain and every input,
    but not shadows. */
export function* realBlocks(
  block: BlockState | undefined
): Generator<BlockState> {
  if (!block) {
    return;
  }
  yield block;
  for (const input of Object.values(block.inputs ?? {})) {
    yield* realBlocks(input.block);
  }
  yield* realBlocks(block.next?.block);
}

// The image a sprite input names: its block's, else its shadow's.
function spriteImageOf(block: BlockState): string | undefined {
  const input = block.inputs?.SPRITE;
  const picker = input?.block ?? input?.shadow;
  return fieldValue(picker?.fields?.ANIMATION);
}

function matchesBlock(
  block: BlockState,
  check: Extract<ObjectiveCheck, {kind: 'block'}>,
  inputs: ObjectiveInputs
): boolean {
  const types = Array.isArray(check.type) ? check.type : [check.type];
  if (!types.includes(block.type) || block.disabledReasons?.length) {
    return false;
  }
  for (const [name, wanted] of Object.entries(check.fields ?? {})) {
    if (fieldValue(block.fields?.[name]) !== wanted) {
      return false;
    }
  }
  if (check.contains) {
    const inside = [...realBlocks(block)].slice(1);
    if (!inside.some(b => b.type === check.contains)) {
      return false;
    }
  }
  if (check.namesImage) {
    const name = fieldValue(block.fields?.[check.namesImage]);
    if (name === undefined || !inputs.imageNames.has(name)) {
      return false;
    }
  }
  if (check.spriteRole !== undefined) {
    const image = inputs.imageForRole[check.spriteRole];
    if (image === undefined || spriteImageOf(block) !== image) {
      return false;
    }
  }
  return true;
}

function hasBlock(
  check: Extract<ObjectiveCheck, {kind: 'block'}>,
  inputs: ObjectiveInputs
): boolean {
  const {source} = inputs;
  const tops = (source?.blocks?.blocks ?? []).filter(
    top =>
      (check.under === undefined || top.type === check.under) &&
      (check.data === undefined || top.data === check.data)
  );
  return tops.some(top =>
    [...realBlocks(top)].some(block => matchesBlock(block, check, inputs))
  );
}

function cellsOf(grid: (WorldCell | null)[][] | undefined): WorldCell[] {
  const cells: WorldCell[] = [];
  grid?.forEach(row => row?.forEach(cell => cell && cells.push(cell)));
  return cells;
}

// Grids compare by their occupied cells, so an empty grid and no grid at
// all are the same world.
function sameGrid(
  a: (WorldCell | null)[][] | undefined,
  b: (WorldCell | null)[][] | undefined
): boolean {
  const occupied = (grid: (WorldCell | null)[][] | undefined) =>
    JSON.stringify(
      (grid ?? []).flatMap((row, r) =>
        (row ?? []).flatMap((cell, c) =>
          cell ? [[r, c, cell.kind, cell.image]] : []
        )
      )
    );
  return occupied(a) === occupied(b);
}

function worldHolds(
  check: Extract<ObjectiveCheck, {kind: 'world'}>,
  inputs: ObjectiveInputs
): boolean {
  if (check.changed) {
    return !sameGrid(inputs.grid, inputs.baselineGrid);
  }
  const cells = cellsOf(inputs.grid);
  if (check.role !== undefined) {
    const image = inputs.imageForRole[check.role];
    return image !== undefined && cells.some(cell => cell.image === image);
  }
  const ofKind = check.cellKind
    ? cells.filter(cell => cell.kind === check.cellKind)
    : cells;
  return ofKind.length >= (check.count ?? 1);
}

/** Whether one check holds right now. */
export function checkObjective(
  check: ObjectiveCheck,
  inputs: ObjectiveInputs
): boolean {
  switch (check.kind) {
    case 'image':
      return inputs.images[check.imageType] >= (check.count ?? 1);
    case 'block':
      return hasBlock(check, inputs);
    case 'world':
      return worldHolds(check, inputs);
    case 'play':
      return check.seconds === undefined
        ? inputs.everPlayed
        : inputs.runtime.longestRunSeconds >= check.seconds;
    case 'reach': {
      if (check.role !== undefined) {
        const image = inputs.imageForRole[check.role];
        return image !== undefined && inputs.runtime.touched.has(image);
      }
      if (check.moved) {
        return (
          inputs.runtime.farthest >= MOVED_PX ||
          inputs.runtime.risen >= JUMPED_RISE
        );
      }
      if (check.across !== undefined) {
        return inputs.runtime.rightmost >= check.across;
      }
      return (
        check.height !== undefined && inputs.runtime.highest >= check.height
      );
    }
    case 'scene':
      return check.opened
        ? inputs.activeSceneId === check.id
        : inputs.runtime.scenesLanded.has(check.id);
    case 'tab':
      return inputs.activeTab === check.name;
  }
}
