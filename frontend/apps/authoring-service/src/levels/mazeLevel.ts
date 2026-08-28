import {z} from 'zod';

import type {ParsedLevel} from '../authoring/model.js';
import {buildMazeLevelProperties} from '../boot/levelCatalog.js';

/**
 * AI level authoring for MAZE-type levels. An agent describes a puzzle as a
 * grid plus a typed block program (never hand-written Blockly XML); this
 * module gates that description behind a machine-verified solvability check,
 * then serializes it into the exact wire shapes real Maze levels use —
 * legacy Blockly XML for the block fields (`buildCourse.ts`'s comment on
 * `buildMazeLevelProperties` explains why: the XML->JSON conversion needs a
 * browser DOMParser, which the maze-lab studio adapter already does at mount
 * time) and a JSON-stringified `number[][]` for the `maze` grid property
 * (`modules/labs/maze/index.tsx`'s `parseJsonOr(properties.maze)`).
 *
 * The gate itself does not run the ported `@code-dot-org/maze-lab` engine.
 * That package's orchestration (`Maze.ts`/`MazeController.reset()`) touches
 * `document`/SVG unconditionally — even a headless construction would need a
 * jsdom-equivalent. But the AUTHORITATIVE gameplay logic (`api.ts`'s
 * move/turn/isPath, `Validator.succeeded`, `Subtype.initStartFinish`) is
 * plain arithmetic over `MazeController` getters/setters and `MazeMap`
 * lookups — no DOM anywhere in that call graph. `simulate` below is a
 * byte-for-byte port of that logic (verified by direct reading of
 * packages/labs/maze/src/{api,Validator,Subtype,tiles}.ts), covering plain
 * movement (forward, left/right turns, counted repeats) plus a subset of the
 * Karel-family skins' action blocks.
 *
 * Win condition, for a GENERATED level (this module's own gate): a finish
 * tile is still required here, even though the ported engine's `Bee`/
 * `Farmer` now also win by goal (nectar/honey collected, dirt cleared —
 * `Subtype.succeeded()`, called from `Validator.succeeded()` whenever
 * `subtype.finish` is unset). Requiring one keeps this gate simple: any
 * skin-specific action block (fill/dig/nectar/honey/collect) is provably a
 * simulation no-op for *reaching the finish*: read
 * packages/labs/maze/src/api.ts — none of them moves Pegman, turns Pegman,
 * or calls `executionInfo.terminateWithValue`. That's what makes it sound
 * to add them to the palette without modeling dirt/nectar/gem state at
 * all. `simulateGoalBasedMazeProgram` below is the counterpart for a
 * goal-based grid — used only by `checkImportedMazeLevel`, gating a real,
 * already-authored level, never this module's own generation gate.
 *
 * Karel skins actually enabled here — moveForward/turnLeft/turnRight/repeat
 * plus:
 *   - farmer:    fill, dig            (maze_fill, maze_dig)
 *   - bee:       getNectar, makeHoney (maze_nectar, maze_honey)
 *   - collector: collect              (collector_collect)
 *
 * Harvester (getCorn/getPumpkin/getLettuce) and Planter (plant) are
 * deliberately NOT enabled: those actions call `HarvesterCell`/
 * `PlanterCell`-specific methods (`featureType()`) on whatever cell the map
 * loader built, but `Cell.parseFromOldValues` — the loader
 * `buildMazeLevelWireProperties`'s plain `number[][]` `maze` grid takes,
 * since this module never emits the richer `serialized_maze` format — is
 * hardcoded to `new Cell(...)`, not `new this(...)`, for any subtype whose
 * Cell subclass doesn't override that static method itself.  HarvesterCell
 * and PlanterCell don't (BeeCell does — see the regression test on
 * `buildMazeLevelWireProperties` pinning exactly this class of bug for Bee).
 * Enabling those two blocks would crash the lab the moment the generated
 * solution runs them, not just fail an "unsolvable" check — worse than the
 * gate's promise, so they stay out of the palette until that shared-package
 * gap is fixed.
 *
 * `checkImportedMazeLevel` (importedLevelCheck.ts) reuses `simulateMazeProgram`
 * below to gate real, human-authored levels the same way — see that file for
 * the palette-only fallback when a real level's blocks (conditionals,
 * compass moves, Bee/Harvester/Planter predicates, ...) go beyond what this
 * module simulates.
 */

// tiles.ts's SquareType/Direction enums, copied rather than imported: pulling
// in @code-dot-org/maze-lab here would pull in its whole module graph
// (Blockly, React, audio) for two integer maps.
const SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3,
  OBSTACLE: 4,
  STARTANDFINISH: 5,
} as const;

const Direction = {NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3} as const;

const MAX_GRID_DIMENSION = 20;
const MIN_GRID_DIMENSION = 2;
const MAX_REPEAT_TIMES = 20;
const MAX_PROGRAM_DEPTH = 4;
const BLOCK_COUNT_TOLERANCE = 2;

export const MAZE_BLOCK_TYPES = [
  'moveForward',
  'turnLeft',
  'turnRight',
  'repeat',
  // Karel-family action blocks — see the module header for which skin each
  // requires and why Harvester/Planter aren't here.
  'fill',
  'dig',
  'getNectar',
  'makeHoney',
  'collect',
] as const;
export type MazeBlockType = (typeof MAZE_BLOCK_TYPES)[number];

/** Skin-action block types, each valid only when `definition.skin` matches. */
const SKIN_ACTION_BLOCKS: Partial<Record<MazeBlockType, string>> = {
  fill: 'farmer',
  dig: 'farmer',
  getNectar: 'bee',
  makeHoney: 'bee',
  collect: 'collector',
};

export interface MazeMoveNode {
  type: 'moveForward';
}
export interface MazeTurnNode {
  type: 'turnLeft' | 'turnRight';
}
export interface MazeRepeatNode {
  type: 'repeat';
  times: number;
  children: MazeBlockNode[];
}
/** A skin action block — fires an animation/state change that never moves,
 * turns, or terminates Pegman (see the module header); simulated as a
 * position-preserving no-op. */
export interface MazeActionNode {
  type: 'fill' | 'dig' | 'getNectar' | 'makeHoney' | 'collect';
}
export type MazeBlockNode =
  | MazeMoveNode
  | MazeTurnNode
  | MazeRepeatNode
  | MazeActionNode;

const MazeBlockNodeSchema: z.ZodType<MazeBlockNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({type: z.literal('moveForward')}),
    z.object({type: z.literal('turnLeft')}),
    z.object({type: z.literal('turnRight')}),
    z.object({type: z.literal('fill')}),
    z.object({type: z.literal('dig')}),
    z.object({type: z.literal('getNectar')}),
    z.object({type: z.literal('makeHoney')}),
    z.object({type: z.literal('collect')}),
    z.object({
      type: z.literal('repeat'),
      times: z.number().int().min(1).max(MAX_REPEAT_TIMES),
      children: z.array(MazeBlockNodeSchema).min(1),
    }),
  ]),
);

export const MazeLevelDefinitionSchema = z.object({
  grid: z
    .array(z.array(z.number().int().min(0).max(5)).min(MIN_GRID_DIMENSION))
    .min(MIN_GRID_DIMENSION)
    .max(MAX_GRID_DIMENSION),
  startDirection: z.number().int().min(0).max(3),
  skin: z.string().min(1).default('birds'),
  shortInstructions: z.string().min(1),
  longInstructions: z.string().optional(),
  idealBlockCount: z.number().int().min(1).max(50),
  toolbox: z.array(z.enum(MAZE_BLOCK_TYPES)).min(1),
  solution: z.array(MazeBlockNodeSchema).min(1),
  // Set by AuthoringState when overrideLevelDefinition (the visual level
  // editor) touches a draft level. update_level refuses to write a draft
  // level once this is set — see ClaudeAgentRunner.ts's update_level: a
  // visually edited grid/block set no longer round-trips to this typed
  // definition, so rebuilding the wire entry from it would silently discard
  // the edit.
  visuallyEdited: z.boolean().optional(),
});
export type MazeLevelDefinition = z.infer<typeof MazeLevelDefinitionSchema>;

export const MazeLevelDefinitionPatchSchema =
  MazeLevelDefinitionSchema.partial();
export type MazeLevelDefinitionPatch = z.infer<
  typeof MazeLevelDefinitionPatchSchema
>;

export type GateResult = {ok: true} | {ok: false; reason: string};

function mod4(d: number): number {
  return ((d % 4) + 4) % 4;
}

function directionDelta(d: number): {dx: number; dy: number} {
  switch (mod4(d)) {
    case Direction.NORTH:
      return {dx: 0, dy: -1};
    case Direction.EAST:
      return {dx: 1, dy: 0};
    case Direction.SOUTH:
      return {dx: 0, dy: 1};
    default:
      return {dx: -1, dy: 0}; // WEST
  }
}

function tileAt(grid: number[][], x: number, y: number): number | undefined {
  return grid[y]?.[x];
}

// Mirrors api.ts's isPath(): a wall AND an obstacle both block movement.
function isBlockingTile(tile: number | undefined): boolean {
  return (
    tile === undefined ||
    tile === SquareType.WALL ||
    tile === SquareType.OBSTACLE
  );
}

interface GridInfo {
  start: {x: number; y: number};
  finish: {x: number; y: number};
}

/** Grid shape/content checks that don't depend on any particular program. */
function inspectGrid(grid: number[][]): GridInfo | string {
  const width = grid[0]?.length ?? 0;
  if (width < MIN_GRID_DIMENSION) {
    return 'grid rows must have at least 2 columns.';
  }
  if (grid.some(row => row.length !== width)) {
    return 'grid rows must all be the same length (a rectangular grid).';
  }

  let start: {x: number; y: number} | undefined;
  let finish: {x: number; y: number} | undefined;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < width; x++) {
      const tile = grid[y][x];
      if (tile === SquareType.START) {
        if (start) return 'grid has more than one start tile (value 2).';
        start = {x, y};
      } else if (tile === SquareType.FINISH) {
        if (finish) return 'grid has more than one finish tile (value 3).';
        finish = {x, y};
      } else if (tile === SquareType.STARTANDFINISH) {
        if (start || finish) {
          return 'grid mixes a combined start/finish tile (5) with a separate start (2) or finish (3) tile.';
        }
        start = {x, y};
        finish = {x, y};
      }
    }
  }
  if (!start) {
    return 'grid must contain exactly one start tile (value 2), or one combined start/finish tile (value 5).';
  }
  if (!finish) {
    return 'grid must contain exactly one finish tile (value 3), or one combined start/finish tile (value 5).';
  }
  return {start, finish};
}

/** Is the finish reachable at all, independent of any specific program? */
function isReachable(
  grid: number[][],
  start: {x: number; y: number},
  finish: {x: number; y: number},
): boolean {
  const visited = new Set<string>([`${start.x},${start.y}`]);
  const queue: {x: number; y: number}[] = [start];
  while (queue.length > 0) {
    const {x, y} = queue.shift()!;
    if (x === finish.x && y === finish.y) return true;
    for (const {dx, dy} of [
      {dx: 0, dy: -1},
      {dx: 0, dy: 1},
      {dx: 1, dy: 0},
      {dx: -1, dy: 0},
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      if (isBlockingTile(tileAt(grid, nx, ny))) continue;
      visited.add(key);
      queue.push({x: nx, y: ny});
    }
  }
  return false;
}

function countBlocks(program: MazeBlockNode[]): number {
  return program.reduce(
    (sum, node) =>
      sum + 1 + (node.type === 'repeat' ? countBlocks(node.children) : 0),
    0,
  );
}

function programDepth(program: MazeBlockNode[]): number {
  return program.reduce(
    (max, node) =>
      Math.max(
        max,
        node.type === 'repeat' ? 1 + programDepth(node.children) : 1,
      ),
    0,
  );
}

function usedBlockTypes(program: MazeBlockNode[], out: Set<MazeBlockType>) {
  for (const node of program) {
    out.add(node.type);
    if (node.type === 'repeat') usedBlockTypes(node.children, out);
  }
}

interface SimState {
  x: number;
  y: number;
  d: number;
  terminated: boolean;
  succeeded: boolean;
  wallHitAt?: {x: number; y: number; direction: number};
  // Execution counts for the Bee/Collector action blocks — a goal-based
  // level (checkGoalConsistency's no-finish-tile branch) checks these
  // against nectar_goal/honey_goal/min_collected. Zero for the finish-tile
  // path, which never reads them.
  nectarCollected: number;
  honeyMade: number;
  // `collect` (Collector skin) previously fell into the shared no-op branch
  // uncounted, so a level whose bug is "the traversal is right but the
  // collect blocks are missing" could never be proven to fail — the most
  // common Course D debug shape. Counted the same way as nectar/honey.
  collected: number;
  // Bumped once per executed leaf block (not per `repeat` container, whose
  // children are what actually run) — turns a pass/fail verdict into a
  // narratable "stops at block N".
  blocksExecuted: number;
}

// Mirrors api.ts's move(): fails (and freezes further movement, matching
// API_FUNCTION's isTerminated() gate on every subsequent call) rather than
// throwing, so a wall hit reads as "never reached the goal" — exactly what
// the real engine's checkSuccess-after-every-move produces.
function simulateMoveForward(
  grid: number[][],
  finish: {x: number; y: number},
  state: SimState,
): void {
  if (state.terminated) return;
  const {dx, dy} = directionDelta(state.d);
  const targetTile = tileAt(grid, state.x + dx, state.y + dy);
  if (isBlockingTile(targetTile)) {
    state.terminated = true;
    state.wallHitAt = {x: state.x, y: state.y, direction: state.d};
    return;
  }
  state.x += dx;
  state.y += dy;
  if (state.x === finish.x && state.y === finish.y) {
    state.succeeded = true;
    state.terminated = true;
  }
}

function simulateTurn(state: SimState, delta: -1 | 1): void {
  if (state.terminated) return;
  state.d = mod4(state.d + delta);
}

function runProgram(
  grid: number[][],
  finish: {x: number; y: number},
  program: MazeBlockNode[],
  state: SimState,
): void {
  for (const node of program) {
    if (state.terminated) return;
    switch (node.type) {
      case 'moveForward':
        state.blocksExecuted++;
        simulateMoveForward(grid, finish, state);
        break;
      case 'turnLeft':
        state.blocksExecuted++;
        simulateTurn(state, -1);
        break;
      case 'turnRight':
        state.blocksExecuted++;
        simulateTurn(state, 1);
        break;
      case 'repeat':
        for (let i = 0; i < node.times && !state.terminated; i++) {
          runProgram(grid, finish, node.children, state);
        }
        break;
      case 'getNectar':
        // Verified against api.ts to never move/turn/terminate — a sound
        // no-op for the reach-the-finish win condition (finish-tile path);
        // counted for the goal-based path (simulateGoalBasedMazeProgram).
        state.blocksExecuted++;
        state.nectarCollected++;
        break;
      case 'makeHoney':
        state.blocksExecuted++;
        state.honeyMade++;
        break;
      case 'collect':
        // Same no-op guarantee as getNectar/makeHoney; counted toward
        // min_collected the same way (see the collected field's comment).
        state.blocksExecuted++;
        state.collected++;
        break;
      case 'fill':
      case 'dig':
        // Farmer skin has no goal-based win condition in this gate's scope
        // (§module header) — position-preserving no-op, counted only as an
        // executed block for narration.
        state.blocksExecuted++;
        break;
    }
  }
}

const DIRECTION_NAME: Record<number, string> = {
  0: 'north',
  1: 'east',
  2: 'south',
  3: 'west',
};

/**
 * The structured result of running a program against a finish-tile grid —
 * the primitive underneath `simulateMazeProgram`'s prose. Every clause of
 * the debugging gate (planned: the inverted "the start program must NOT
 * solve it" check, and the misconception assertion) needs the outcome as
 * data, not a formatted sentence: which cell it stopped at, which way it
 * was facing, how many blocks actually ran before it stopped.
 */
export type MazeRunOutcome =
  | {kind: 'solved'; blocksExecuted: number}
  | {
      kind: 'wall';
      at: {row: number; col: number};
      facing: number;
      blocksExecuted: number;
    }
  | {
      kind: 'stopped';
      at: {row: number; col: number};
      facing: number;
      goal: {row: number; col: number};
      blocksExecuted: number;
    }
  | {kind: 'gridInvalid'; reason: string}
  | {
      kind: 'goalUnreachable';
      start: {row: number; col: number};
      goal: {row: number; col: number};
    };

/**
 * Runs `program` against `grid` from `startDirection` and reports what
 * happened, independent of any authoring-time budget (toolbox coverage,
 * block-count, ...) or prose formatting — see `simulateMazeProgram` for the
 * sentence form every existing caller still gets.
 */
export function runMazeProgram(
  grid: number[][],
  startDirection: number,
  program: MazeBlockNode[],
): MazeRunOutcome {
  const gridInfo = inspectGrid(grid);
  if (typeof gridInfo === 'string') {
    return {kind: 'gridInvalid', reason: gridInfo};
  }
  const {start, finish} = gridInfo;

  if (!isReachable(grid, start, finish)) {
    return {
      kind: 'goalUnreachable',
      start: {row: start.y, col: start.x},
      goal: {row: finish.y, col: finish.x},
    };
  }

  const state: SimState = {
    x: start.x,
    y: start.y,
    d: startDirection,
    terminated: false,
    succeeded: false,
    nectarCollected: 0,
    honeyMade: 0,
    collected: 0,
    blocksExecuted: 0,
  };
  runProgram(grid, finish, program, state);
  if (!state.terminated) {
    // Mirrors Maze.execute()'s final fallback: a program that runs to
    // completion without terminating (e.g. it ends on a turn while already
    // standing on the goal) still gets one last success check.
    state.succeeded = state.x === finish.x && state.y === finish.y;
  }

  if (state.succeeded) {
    return {kind: 'solved', blocksExecuted: state.blocksExecuted};
  }
  if (state.wallHitAt) {
    return {
      kind: 'wall',
      at: {row: state.wallHitAt.y, col: state.wallHitAt.x},
      facing: state.wallHitAt.direction,
      blocksExecuted: state.blocksExecuted,
    };
  }
  return {
    kind: 'stopped',
    at: {row: state.y, col: state.x},
    facing: state.d,
    goal: {row: finish.y, col: finish.x},
    blocksExecuted: state.blocksExecuted,
  };
}

/**
 * The core simulation: proves `program` actually solves `grid` from
 * `startDirection`, independent of any authoring-time budget (toolbox
 * coverage, block-count, ...). Shared by `verifyMazeLevelSolvable` (AI
 * authoring, which adds those budget checks on top) and
 * `checkImportedMazeLevel` (importedLevelCheck.ts, gating a real,
 * human-authored level, which has no such budget). A formatter over
 * `runMazeProgram` — unchanged public behavior/return type.
 */
export function simulateMazeProgram(
  grid: number[][],
  startDirection: number,
  program: MazeBlockNode[],
): GateResult {
  const outcome = runMazeProgram(grid, startDirection, program);
  switch (outcome.kind) {
    case 'solved':
      return {ok: true};
    case 'gridInvalid':
      return {ok: false, reason: outcome.reason};
    case 'goalUnreachable':
      return {
        ok: false,
        reason:
          `the goal is not reachable from the start on this grid — no ` +
          `sequence of moves can solve it. Check for walls (0) blocking every ` +
          `path from the start (2, at row ${outcome.start.row} col ${outcome.start.col}) to the ` +
          `finish (3, at row ${outcome.goal.row} col ${outcome.goal.col}).`,
      };
    case 'wall':
      return {
        ok: false,
        reason:
          `running the solution program: the character hits a wall at row ` +
          `${outcome.at.row} col ${outcome.at.col} while facing ` +
          `${DIRECTION_NAME[outcome.facing]} and stops there — it never ` +
          `reaches the goal.`,
      };
    case 'stopped':
      return {
        ok: false,
        reason:
          `running the solution program lands the character at row ${outcome.at.row} ` +
          `col ${outcome.at.col} facing ${DIRECTION_NAME[outcome.facing]}; the goal is at ` +
          `row ${outcome.goal.row} col ${outcome.goal.col}. It never reaches the goal.`,
      };
  }
}

/**
 * Goal declared for a goal-based (no finish tile) Karel level —
 * nectar_goal/honey_goal/min_collected, dashboard/app/models/levels/
 * karel.rb — checked against `simulateGoalBasedMazeProgram`'s counted
 * getNectar/makeHoney/collect executions, not the map's static item totals
 * (that's `checkGoalConsistency`'s separate, complementary check in
 * importedLevelCheck.ts).
 */
export interface MazeGoalRequirements {
  nectarGoal?: number;
  honeyGoal?: number;
  minCollected?: number;
}

/**
 * Simulates `program` against a goal-based grid (no finish tile — a real
 * Bee level's ordinary shape; see mazeLevel.ts's module header for why the
 * finish-tile-only `simulateMazeProgram` above can't gate these) and checks
 * the resulting nectar/honey/total counts against `goals`. Reuses
 * `runProgram`'s move/turn/repeat/getNectar/makeHoney/collect walk
 * verbatim — the only difference from `simulateMazeProgram` is the win
 * check itself: no finish tile to reach, so `finish` is a coordinate the
 * grid can never contain (position never doubles as a win condition here),
 * and success is judged from `state.nectarCollected`/`honeyMade`/`collected`
 * once the walk completes cleanly (no wall hit).
 */
export function simulateGoalBasedMazeProgram(
  grid: number[][],
  startDirection: number,
  program: MazeBlockNode[],
  goals: MazeGoalRequirements,
): GateResult {
  const width = grid[0]?.length ?? 0;
  if (width < MIN_GRID_DIMENSION || grid.some(row => row.length !== width)) {
    return {
      ok: false,
      reason: 'grid rows must all be the same length (a rectangular grid).',
    };
  }

  let start: {x: number; y: number} | undefined;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === SquareType.START) {
        if (start) {
          return {
            ok: false,
            reason: 'grid has more than one start tile (value 2).',
          };
        }
        start = {x, y};
      }
    }
  }
  if (!start) {
    return {
      ok: false,
      reason:
        'grid must contain a start tile (value 2) for a goal-based level.',
    };
  }

  // No cell on a MIN_GRID_DIMENSION-or-larger grid can be (-1, -1) — a
  // sentinel `finish` runProgram's shared move logic will never reach, so
  // this walk's only way to end is running off the program or hitting a
  // wall, never an early "reached the goal" position check.
  const UNREACHABLE = {x: -1, y: -1};
  const state: SimState = {
    x: start.x,
    y: start.y,
    d: startDirection,
    terminated: false,
    succeeded: false,
    nectarCollected: 0,
    honeyMade: 0,
    collected: 0,
    blocksExecuted: 0,
  };
  runProgram(grid, UNREACHABLE, program, state);

  if (state.wallHitAt) {
    return {
      ok: false,
      reason:
        `running the solution program: the character hits a wall at row ` +
        `${state.wallHitAt.y} col ${state.wallHitAt.x} while facing ` +
        `${DIRECTION_NAME[state.wallHitAt.direction]} and stops there.`,
    };
  }

  const reasons: string[] = [];
  if (goals.nectarGoal !== undefined && state.nectarCollected < goals.nectarGoal) {
    reasons.push(
      `nectar_goal is ${goals.nectarGoal} but the solution only collects ` +
        `${state.nectarCollected} nectar.`,
    );
  }
  if (goals.honeyGoal !== undefined && state.honeyMade < goals.honeyGoal) {
    reasons.push(
      `honey_goal is ${goals.honeyGoal} but the solution only makes ` +
        `${state.honeyMade} honey.`,
    );
  }
  const totalCollected = state.nectarCollected + state.honeyMade + state.collected;
  if (goals.minCollected !== undefined && totalCollected < goals.minCollected) {
    reasons.push(
      `min_collected is ${goals.minCollected} but the solution only ` +
        `collects ${totalCollected} total.`,
    );
  }
  return reasons.length > 0 ? {ok: false, reason: reasons.join(' ')} : {ok: true};
}

/**
 * The solvability gate: proves `definition.solution` actually solves
 * `definition.grid` before a level is accepted, plus the surrounding
 * authoring constraints (skin/block compatibility, toolbox coverage,
 * block-count budget). Every rejection names the specific, correctable
 * problem.
 */
export function verifyMazeLevelSolvable(
  definition: MazeLevelDefinition,
): GateResult {
  const skinMismatch = definition.toolbox.find(
    type => SKIN_ACTION_BLOCKS[type] && SKIN_ACTION_BLOCKS[type] !== definition.skin,
  );
  if (skinMismatch) {
    return {
      ok: false,
      reason:
        `toolbox block type "${skinMismatch}" is only valid on skin ` +
        `"${SKIN_ACTION_BLOCKS[skinMismatch]}" levels; this level's skin is ` +
        `"${definition.skin}".`,
    };
  }

  const usedTypes = new Set<MazeBlockType>();
  usedBlockTypes(definition.solution, usedTypes);
  const offToolbox = [...usedTypes].filter(
    type => !definition.toolbox.includes(type),
  );
  if (offToolbox.length > 0) {
    return {
      ok: false,
      reason:
        `solution uses block type(s) ${offToolbox.join(', ')} which are ` +
        `not included in toolbox [${definition.toolbox.join(', ')}]. Add ` +
        `them to toolbox or rewrite the solution using only toolbox blocks.`,
    };
  }

  const depth = programDepth(definition.solution);
  if (depth > MAX_PROGRAM_DEPTH) {
    return {
      ok: false,
      reason: `solution nests repeat blocks ${depth} levels deep; max is ${MAX_PROGRAM_DEPTH}.`,
    };
  }

  const blockCount = countBlocks(definition.solution);
  const maxAllowed = definition.idealBlockCount + BLOCK_COUNT_TOLERANCE;
  if (blockCount > maxAllowed) {
    return {
      ok: false,
      reason:
        `solution uses ${blockCount} blocks; idealBlockCount is ` +
        `${definition.idealBlockCount} (max allowed ${maxAllowed}). Simplify ` +
        `the solution or raise idealBlockCount to match its real difficulty.`,
    };
  }

  return simulateMazeProgram(
    definition.grid,
    definition.startDirection,
    definition.solution,
  );
}

// The manual "New maze level" affordance's skin picker — deliberately NOT
// the full Karel.skins() list. Harvester and Planter are excluded here for
// the same reason the module header excludes them from the AI toolbox:
// HarvesterCell/PlanterCell don't override Cell.parseFromOldValues, so a
// template level with the legacy `maze`-only grid this builder emits (no
// serialized_maze until the author's first Save) would mis-load as a plain
// Cell and crash the moment its action block runs.
export const CREATABLE_MAZE_SKINS = ['birds', 'farmer', 'bee', 'collector'] as const;
export type CreatableMazeSkin = (typeof CREATABLE_MAZE_SKINS)[number];

/**
 * A minimal, trivially-solvable Maze level: start and finish adjacent, one
 * moveForward block. The "New maze level" affordance's whole point is a
 * blank canvas the author paints from scratch — createMazeLevel's gate
 * (verifyMazeLevelSolvable, same as the AI's create_level tool) still runs
 * against it, so it has to pass honestly rather than being waved through;
 * this shape is the smallest definition that does.
 */
export function buildBlankMazeLevelDefinition(params: {
  skin?: CreatableMazeSkin;
  rows?: number;
  cols?: number;
}): MazeLevelDefinition {
  const clampDimension = (value: number | undefined, fallback: number) =>
    Math.min(
      MAX_GRID_DIMENSION,
      Math.max(MIN_GRID_DIMENSION, Math.trunc(value ?? fallback)),
    );
  const rows = clampDimension(params.rows, 8);
  const cols = clampDimension(params.cols, 8);
  const skin = params.skin ?? 'birds';

  const grid: number[][] = Array.from({length: rows}, (_, y) =>
    Array.from({length: cols}, (_, x) => {
      if (y === 0 && x === 0) return SquareType.START;
      if (y === 0 && x === 1) return SquareType.FINISH;
      return SquareType.OPEN;
    }),
  );

  return {
    grid,
    startDirection: Direction.EAST,
    skin,
    shortInstructions: 'Move forward to reach the goal.',
    idealBlockCount: 1,
    toolbox: ['moveForward'],
    solution: [{type: 'moveForward'}],
  };
}

// --- Legacy Blockly XML serialization -------------------------------------
//
// The XML dialect below was reverse-engineered from real levels, e.g.
// dashboard/config/levels/custom/maze/courseD_maze_ramp6.level: a `when_run`
// root (deletable="false" movable="false"), `<next>` sibling chains, and
// `controls_repeat_dropdown`'s body in `<statement name="DO">`.

function blockXml(node: MazeBlockNode, next?: string): string {
  const nextXml = next ? `<next>${next}</next>` : '';
  switch (node.type) {
    case 'moveForward':
      return `<block type="maze_moveForward">${nextXml}</block>`;
    case 'turnLeft':
      return `<block type="maze_turn"><title name="DIR">turnLeft</title>${nextXml}</block>`;
    case 'turnRight':
      return `<block type="maze_turn"><title name="DIR">turnRight</title>${nextXml}</block>`;
    case 'fill':
      return `<block type="maze_fill">${nextXml}</block>`;
    case 'dig':
      return `<block type="maze_dig">${nextXml}</block>`;
    case 'getNectar':
      return `<block type="maze_nectar">${nextXml}</block>`;
    case 'makeHoney':
      return `<block type="maze_honey">${nextXml}</block>`;
    case 'collect':
      return `<block type="collector_collect">${nextXml}</block>`;
    case 'repeat': {
      const body = chainXml(node.children);
      const statement = body ? `<statement name="DO">${body}</statement>` : '';
      return (
        `<block type="controls_repeat_dropdown">` +
        `<title name="TIMES" config="1-20">${node.times}</title>` +
        `${statement}${nextXml}</block>`
      );
    }
  }
}

/** Chains a sibling list via nested `<next>`, innermost (last) block first. */
function chainXml(program: MazeBlockNode[]): string {
  let xml: string | undefined;
  for (let i = program.length - 1; i >= 0; i--) {
    xml = blockXml(program[i], xml);
  }
  return xml ?? '';
}

export function buildStartBlocksXml(): string {
  return '<xml><block type="when_run" deletable="false" movable="false"></block></xml>';
}

const TOOLBOX_BLOCK_XML: Record<MazeBlockType, string> = {
  moveForward: '<block type="maze_moveForward"/>',
  turnLeft:
    '<block type="maze_turn"><title name="DIR">turnLeft</title></block>',
  turnRight:
    '<block type="maze_turn"><title name="DIR">turnRight</title></block>',
  repeat:
    '<block type="controls_repeat_dropdown"><title name="TIMES" config="1-20">3</title></block>',
  fill: '<block type="maze_fill"/>',
  dig: '<block type="maze_dig"/>',
  getNectar: '<block type="maze_nectar"/>',
  makeHoney: '<block type="maze_honey"/>',
  collect: '<block type="collector_collect"/>',
};

export function buildToolboxBlocksXml(toolbox: MazeBlockType[]): string {
  return `<xml>${toolbox.map(type => TOOLBOX_BLOCK_XML[type]).join('')}</xml>`;
}

export function buildSolutionBlocksXml(program: MazeBlockNode[]): string {
  const body = chainXml(program);
  const next = body ? `<next>${body}</next>` : '';
  return (
    `<xml><block type="when_run" deletable="false" movable="false">` +
    `${next}</block></xml>`
  );
}

/**
 * The full LevelProperties wire shape a draft Maze level registers under its
 * synthetic numeric id — built by feeding a real-level-shaped `properties`
 * object through the exact same `buildMazeLevelProperties` the importer and
 * the lazy attach-existing-level path use, so a draft level and an imported
 * one are indistinguishable to `<Lab>`.
 */
export function buildMazeLevelWireProperties(
  numericId: number,
  levelKey: string,
  definition: MazeLevelDefinition,
): Record<string, unknown> {
  const properties = {
    maze: JSON.stringify(definition.grid),
    skin: definition.skin,
    short_instructions: definition.shortInstructions,
    long_instructions: definition.longInstructions,
    start_direction: String(definition.startDirection),
    ideal: String(definition.idealBlockCount),
  };
  const parsed: ParsedLevel = {
    levelType: 'Maze',
    properties,
    startBlocksXml: buildStartBlocksXml(),
    toolboxBlocksXml: buildToolboxBlocksXml(definition.toolbox),
    solutionBlocksXml: buildSolutionBlocksXml(definition.solution),
  };
  return buildMazeLevelProperties(numericId, levelKey, 'Maze', parsed);
}
