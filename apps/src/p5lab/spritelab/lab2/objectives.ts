// A level's checklist (the objectives level property): what each item asks
// the student to do, read against the project and the running game.

import {ImageType} from './ai/images/types';
import {ImageCounts} from './projectCounts';
import {Tab} from './redux/spriteLab2Redux';
import {WorldCell} from './world';

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
    }
  | {kind: 'scene'; id: string}
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
  /** Scenes a jump has landed on. */
  scenesLanded: ReadonlySet<string>;
}

/** Which of the running game's reports the checklist reads. */
export interface RuntimeNeeds {
  seconds: boolean;
  touch: boolean;
  height: boolean;
}

export function runtimeNeeds(objectives: Objectives | undefined): RuntimeNeeds {
  const needs = {seconds: false, touch: false, height: false};
  objectives?.items?.forEach(({check}) => {
    if (check.kind === 'play' && check.seconds !== undefined) {
      needs.seconds = true;
    } else if (check.kind === 'reach') {
      needs.touch ||= check.role !== undefined;
      needs.height ||= check.height !== undefined;
    }
  });
  return needs;
}

export const EMPTY_RUNTIME: RuntimeProgress = {
  longestRunSeconds: 0,
  touched: new Set(),
  highest: 0,
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
  source?: WorkspaceSource;
  activeTab: Tab;
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

function matchesBlock(
  block: BlockState,
  check: Extract<ObjectiveCheck, {kind: 'block'}>
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
  return true;
}

function hasBlock(
  source: WorkspaceSource | undefined,
  check: Extract<ObjectiveCheck, {kind: 'block'}>
): boolean {
  const tops = (source?.blocks?.blocks ?? []).filter(
    top =>
      (check.under === undefined || top.type === check.under) &&
      (check.data === undefined || top.data === check.data)
  );
  return tops.some(top =>
    [...realBlocks(top)].some(block => matchesBlock(block, check))
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
      return hasBlock(inputs.source, check);
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
      return (
        check.height !== undefined && inputs.runtime.highest >= check.height
      );
    }
    case 'scene':
      return inputs.runtime.scenesLanded.has(check.id);
    case 'tab':
      return inputs.activeTab === check.name;
  }
}
