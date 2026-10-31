// A level's checklist (the objectives level property): what each item asks
// the student to do, read against the project and the running game.

import {ImageType} from './ai/images/types';
import {ImageCounts} from './projectCounts';
import {cellSize, DEFAULT_SCENE_GRID_SIZE, WorldCell} from './world';

/** One kind of thing a level can ask for. */
export type ObjectiveCheck =
  /** An image of the type was made on this level. */
  | {kind: 'image'; imageType: ImageType}
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
    }
  | {
      kind: 'world';
      /** A cell showing an image that carries this role. With neither this
          nor `changed` set, any cell at all counts. */
      role?: string;
      /** Any difference from the grid the level opened with. */
      changed?: boolean;
    }
  /** The student pressed Play. */
  | {kind: 'play'}
  | {
      kind: 'reach';
      /** The player touched a sprite whose image carries this role. */
      role?: string;
      /** The player ran a cell sideways or left the ground. */
      moved?: boolean;
    }
  /** A jump landed on the scene. */
  | {kind: 'scene'; id: string}
  /** The student answered the question about a generated picture. */
  | {kind: 'rated'};

export interface Objective {
  /** Names the item to the lab's hover and click handling. */
  id?: string;
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
  /** Image names of sprites the player has touched. */
  touched: ReadonlySet<string>;
  /** The farthest the player has run from where a run started, in px. */
  farthest: number;
  /** The most the feet have risen above a run's lowest point, 0 to 1. */
  risen: number;
  /** Scenes a jump has landed on. */
  scenesLanded: ReadonlySet<string>;
}

/** Which of the running game's reports the checklist reads. */
export interface RuntimeNeeds {
  touch: boolean;
  move: boolean;
}

export function runtimeNeeds(objectives: Objectives | undefined): RuntimeNeeds {
  const needs = {touch: false, move: false};
  objectives?.items?.forEach(({check}) => {
    if (check.kind === 'reach') {
      needs.touch ||= check.role !== undefined;
      needs.move ||= check.moved === true;
    }
  });
  return needs;
}

/** A run of one default-grid cell counts as having moved. */
export const MOVED_PX = cellSize(DEFAULT_SCENE_GRID_SIZE);
/** A rise of a tenth of the view counts as a jump. */
export const JUMPED_RISE = 0.1;

export const EMPTY_RUNTIME: RuntimeProgress = {
  touched: new Set(),
  farthest: 0,
  risen: 0,
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
  /** Image names by role: a student can make a role's image more than
      once, and every one counts. */
  imagesForRole: Record<string, readonly string[] | undefined>;
  source?: WorkspaceSource;
  everPlayed: boolean;
  rated: boolean;
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

function inRole(inputs: ObjectiveInputs, role: string, image: string): boolean {
  return !!inputs.imagesForRole[role]?.includes(image);
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
    const role = check.role;
    return cells.some(cell => inRole(inputs, role, cell.image));
  }
  return cells.length > 0;
}

/** Whether one check holds right now. */
export function checkObjective(
  check: ObjectiveCheck,
  inputs: ObjectiveInputs
): boolean {
  switch (check.kind) {
    case 'image':
      return inputs.images[check.imageType] >= 1;
    case 'block':
      return hasBlock(check, inputs);
    case 'world':
      return worldHolds(check, inputs);
    case 'play':
      return inputs.everPlayed;
    case 'reach': {
      if (check.role !== undefined) {
        const role = check.role;
        return [...inputs.runtime.touched].some(image =>
          inRole(inputs, role, image)
        );
      }
      return (
        !!check.moved &&
        (inputs.runtime.farthest >= MOVED_PX ||
          inputs.runtime.risen >= JUMPED_RISE)
      );
    }
    case 'scene':
      return inputs.runtime.scenesLanded.has(check.id);
    case 'rated':
      return inputs.rated;
  }
}
