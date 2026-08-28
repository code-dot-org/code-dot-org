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

// `locked` (WOW plan §4.4): the mechanic that makes a debugging level teach
// "find and fix the bug" rather than "clear the workspace and start over" —
// 44% of real debug levels carry it on the correct scaffold blocks of
// startProgram. Shared across every node shape rather than added only to
// leaf blocks: a real level locks a `repeat` wrapper as often as a leaf
// (see the module's `blockXml` for the `deletable="false"` it emits).
interface MazeBlockNodeBase {
  locked?: boolean;
}
export interface MazeMoveNode extends MazeBlockNodeBase {
  type: 'moveForward';
}
export interface MazeTurnNode extends MazeBlockNodeBase {
  type: 'turnLeft' | 'turnRight';
}
export interface MazeRepeatNode extends MazeBlockNodeBase {
  type: 'repeat';
  times: number;
  children: MazeBlockNode[];
}
/** A skin action block — fires an animation/state change that never moves,
 * turns, or terminates Pegman (see the module header); simulated as a
 * position-preserving no-op. */
export interface MazeActionNode extends MazeBlockNodeBase {
  type: 'fill' | 'dig' | 'getNectar' | 'makeHoney' | 'collect';
}
export type MazeBlockNode =
  | MazeMoveNode
  | MazeTurnNode
  | MazeRepeatNode
  | MazeActionNode;

const MazeBlockNodeSchema: z.ZodType<MazeBlockNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({type: z.literal('moveForward'), locked: z.boolean().optional()}),
    z.object({type: z.literal('turnLeft'), locked: z.boolean().optional()}),
    z.object({type: z.literal('turnRight'), locked: z.boolean().optional()}),
    z.object({type: z.literal('fill'), locked: z.boolean().optional()}),
    z.object({type: z.literal('dig'), locked: z.boolean().optional()}),
    z.object({type: z.literal('getNectar'), locked: z.boolean().optional()}),
    z.object({type: z.literal('makeHoney'), locked: z.boolean().optional()}),
    z.object({type: z.literal('collect'), locked: z.boolean().optional()}),
    z.object({
      type: z.literal('repeat'),
      times: z.number().int().min(1).max(MAX_REPEAT_TIMES),
      children: z.array(MazeBlockNodeSchema).min(1),
      locked: z.boolean().optional(),
    }),
  ]),
);

/**
 * The misconception assertion (WOW plan §2.4) — deliberately small.
 * `blocksExecuted` is reportable (MazeRunOutcome) but never assertable here:
 * an agent can't reliably predict a step index, and an over-specific
 * assertion turns the gate into a rejection treadmill.
 */
const MazeExpectedFailureSchema = z.object({
  kind: z.enum(['wall', 'stopped']),
  at: z.object({row: z.number().int(), col: z.number().int()}).optional(),
  facing: z.number().int().min(0).max(3).optional(),
});
export type MazeExpectedFailure = z.infer<typeof MazeExpectedFailureSchema>;

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
  // The learner's starting program (WOW plan §1.5/§4) — same friendly JSON
  // shape as `solution`, compiled to `start_blocks` XML by
  // buildMazeLevelWireProperties. Absent (the common case) means the
  // learner starts from an empty when_run, same as before this field
  // existed. Present, it makes this a debugging level and is gated by
  // verifyDebugMazeLevel's five clauses rather than nodded through.
  startProgram: z.array(MazeBlockNodeSchema).optional(),
  // The misconception the agent asserts the buggy startProgram teaches
  // (§2.4) — optional; verifyDebugMazeLevel checks it only when given.
  expectedFailure: MazeExpectedFailureSchema.optional(),
  // Levelbuilder's `step_mode` (maze.rb: 0 Run Button Only / 1 Run and Step
  // / 2 Step Button Only) — real debug levels are "1" almost universally
  // (§4.2). Defaults to '1' by buildMazeLevelWireProperties whenever
  // startProgram is set; an author-given value here overrides that default.
  stepMode: z.enum(['0', '1', '2']).optional(),
  // `level_concept_difficulty` — analytics only, no player effect (§4.2).
  conceptDifficulty: z
    .object({
      sequencing: z.number().int().min(1).max(3).optional(),
      debugging: z.number().int().min(1).max(3).optional(),
      repeat_loops: z.number().int().min(1).max(3).optional(),
    })
    .optional(),
  // Callout text anchored to the first locked start-program block (§4.4) —
  // real convention is `id="callMe"` plus a `callout_json` entry pointing
  // `#callMe` at this text. No-op when startProgram has no locked block.
  lockedBlocksCallout: z.string().optional(),
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

/** Per-type block counts, recursing into `repeat` bodies — the near-miss
 * proxy of verifyDebugMazeLevel's clause 4 needs "how many of each type",
 * not just the total countBlocks gives. */
function blockTypeCounts(program: MazeBlockNode[]): Map<MazeBlockType, number> {
  const counts = new Map<MazeBlockType, number>();
  for (const node of program) {
    counts.set(node.type, (counts.get(node.type) ?? 0) + 1);
    if (node.type === 'repeat') {
      for (const [type, count] of blockTypeCounts(node.children)) {
        counts.set(type, (counts.get(type) ?? 0) + count);
      }
    }
  }
  return counts;
}

/** Sum of |count difference| over every block type either program uses —
 * zero for identical multisets, growing with each block that would need to
 * be added/removed/retyped to turn one program into the other. */
function blockTypeMultisetDelta(
  a: Map<MazeBlockType, number>,
  b: Map<MazeBlockType, number>,
): number {
  let delta = 0;
  for (const type of new Set([...a.keys(), ...b.keys()])) {
    delta += Math.abs((a.get(type) ?? 0) - (b.get(type) ?? 0));
  }
  return delta;
}

/** First `locked` node in document order (depth-first, into `repeat`
 * bodies) — the block real debug levels give `id="callMe"` so
 * `lockedBlocksCallout`'s callout_json can anchor to it. Reference
 * equality, not a value match, so buildStartBlocksXml's serialization pass
 * can tag the exact node instance without a separate counting pass. */
function findFirstLockedNode(program: MazeBlockNode[]): MazeBlockNode | undefined {
  for (const node of program) {
    if (node.locked) return node;
    if (node.type === 'repeat') {
      const found = findFirstLockedNode(node.children);
      if (found) return found;
    }
  }
  return undefined;
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

export type DebugGateResult =
  | {
      ok: true;
      /** One-line, machine-derived summary of both outcomes — WOW plan
       * §2.5's "failure narrative": the actual WOW moment. Compact by
       * design (§8 risk 6) — never a full reasons list, never the grid. */
      narrative: string;
      startOutcome: MazeRunOutcome;
      solutionOutcome: MazeRunOutcome;
    }
  | {ok: false; reason: string};

/**
 * The debugging-level gate (WOW plan §2.2): five clauses, each failing with
 * its own correctable message. Only meaningful when `definition.startProgram`
 * is set — a level with no starting program is an ordinary puzzle and
 * verifyMazeLevelSolvable above is the whole gate for it.
 *
 * 1. The solution passes the existing solvability gate (verifyMazeLevelSolvable).
 * 2. The start program does NOT solve the grid — the honesty clause: a
 *    "debugging level" whose start already works has no bug to find.
 * 3. Every start-program block type is offered by the toolbox — the learner
 *    has to be able to rebuild whatever they delete.
 * 4. The start program is a near-miss of the solution, not an unrelated
 *    wrong program — §2.2's cheap proxy: block-count delta and block-type
 *    multiset delta both within BLOCK_COUNT_TOLERANCE.
 * 5. When the agent asserts an expectedFailure, the start program's actual
 *    outcome matches it.
 */
export function verifyDebugMazeLevel(
  definition: MazeLevelDefinition & {startProgram: MazeBlockNode[]},
): DebugGateResult {
  const solvable = verifyMazeLevelSolvable(definition);
  if (!solvable.ok) {
    return {ok: false, reason: solvable.reason};
  }

  const {startProgram, toolbox, grid, startDirection, solution} = definition;

  const startTypes = new Set<MazeBlockType>();
  usedBlockTypes(startProgram, startTypes);
  const offToolbox = [...startTypes].filter(type => !toolbox.includes(type));
  if (offToolbox.length > 0) {
    return {
      ok: false,
      reason:
        `start program uses block type(s) ${offToolbox.join(', ')} which ` +
        `are not in toolbox [${toolbox.join(', ')}] — the learner couldn't ` +
        `rebuild what they'd delete. Add them to the toolbox or change the bug.`,
    };
  }

  const startCount = countBlocks(startProgram);
  const solutionCount = countBlocks(solution);
  const countDelta = Math.abs(startCount - solutionCount);
  const multisetDelta = blockTypeMultisetDelta(
    blockTypeCounts(startProgram),
    blockTypeCounts(solution),
  );
  if (countDelta > BLOCK_COUNT_TOLERANCE || multisetDelta > BLOCK_COUNT_TOLERANCE) {
    return {
      ok: false,
      reason:
        `start program (${startCount} blocks) isn't a near-miss of the ` +
        `solution (${solutionCount} blocks): block-count delta is ` +
        `${countDelta}, block-type-multiset delta is ${multisetDelta} — both ` +
        `must be ≤ ${BLOCK_COUNT_TOLERANCE}. A debugging level presents an ` +
        `almost-right program (drop/add/swap/reorder a couple of blocks), not ` +
        `an unrelated one.`,
    };
  }

  const startOutcome = runMazeProgram(grid, startDirection, startProgram);
  if (startOutcome.kind === 'solved') {
    return {
      ok: false,
      reason:
        'the starting program already reaches the goal — there is no bug ' +
        'for the learner to find. Change the start program (or plant the ' +
        'bug more strongly) so it actually fails.',
    };
  }

  if (definition.expectedFailure) {
    const mismatch = matchExpectedFailure(definition.expectedFailure, startOutcome);
    if (mismatch) {
      return {ok: false, reason: mismatch};
    }
  }

  // Clause 1 already proved this solves — re-running it here (rather than
  // trusting a bare {ok:true}) is what gives the narrative its solved-in-N
  // block count.
  const solutionOutcome = runMazeProgram(grid, startDirection, solution);
  return {
    ok: true,
    narrative: buildDebugNarrative(startOutcome, solutionOutcome),
    startOutcome,
    solutionOutcome,
  };
}

/** Clause 5: does the start program's actual outcome match the agent's
 * asserted misconception? Only 'wall'/'stopped' can reach here — clause 2
 * already rejected 'solved', and clause 1's simulateMazeProgram already
 * proved the grid valid and the goal reachable, so 'gridInvalid'/
 * 'goalUnreachable' can't occur either; handled anyway for an honest
 * message if that invariant is ever violated by a future caller. */
function matchExpectedFailure(
  expected: MazeExpectedFailure,
  outcome: MazeRunOutcome,
): string | undefined {
  if (outcome.kind !== expected.kind) {
    return (
      `expectedFailure.kind is '${expected.kind}' but the start program ` +
      `actually ${describeOutcomeKind(outcome)}.`
    );
  }
  if (outcome.kind !== 'wall' && outcome.kind !== 'stopped') {
    return `expectedFailure given but the start program ${describeOutcomeKind(outcome)}, not a position/facing this can be checked against.`;
  }
  if (expected.at && (outcome.at.row !== expected.at.row || outcome.at.col !== expected.at.col)) {
    return (
      `expectedFailure.at is row ${expected.at.row} col ${expected.at.col} but ` +
      `the start program actually stops at row ${outcome.at.row} col ${outcome.at.col}.`
    );
  }
  if (expected.facing !== undefined && outcome.facing !== expected.facing) {
    return (
      `expectedFailure.facing is ${DIRECTION_NAME[expected.facing]} but the ` +
      `start program actually ends facing ${DIRECTION_NAME[outcome.facing]}.`
    );
  }
  return undefined;
}

function describeOutcomeKind(outcome: MazeRunOutcome): string {
  switch (outcome.kind) {
    case 'solved':
      return 'reaches the goal';
    case 'wall':
      return `hits a wall at row ${outcome.at.row} col ${outcome.at.col}`;
    case 'stopped':
      return `runs out of program at row ${outcome.at.row} col ${outcome.at.col}, short of the goal`;
    case 'gridInvalid':
      return `runs against an invalid grid (${outcome.reason})`;
    case 'goalUnreachable':
      return 'runs against a grid where the goal is unreachable';
  }
}

/** The failure narrative (WOW plan §2.5) — one compact line the agent is
 * expected to relay honestly in the author's language, never a reformatting
 * the agent has to invent from raw coordinates. */
function buildDebugNarrative(
  startOutcome: MazeRunOutcome,
  solutionOutcome: MazeRunOutcome,
): string {
  const startPart =
    startOutcome.kind === 'wall'
      ? `hits the wall at row ${startOutcome.at.row} col ${startOutcome.at.col} ` +
        `facing ${DIRECTION_NAME[startOutcome.facing]} after ${startOutcome.blocksExecuted} block(s)`
      : startOutcome.kind === 'stopped'
        ? `runs out of program at row ${startOutcome.at.row} col ${startOutcome.at.col} ` +
          `facing ${DIRECTION_NAME[startOutcome.facing]}, short of the goal, after ` +
          `${startOutcome.blocksExecuted} block(s)`
        : describeOutcomeKind(startOutcome);
  const solutionPart =
    solutionOutcome.kind === 'solved'
      ? `solves in ${solutionOutcome.blocksExecuted} block(s)`
      : describeOutcomeKind(solutionOutcome);
  return `buggy start verified: ${startPart}; solution verified: ${solutionPart}.`;
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

// `firstLockedNode` (reference equality, not a value match — a program can
// repeat identical-looking nodes) is the one node in the whole tree that
// gets `id="callMe"`, real curriculum's anchor for `callout_json`'s
// `element_id: "#callMe"` (§4.4). Undefined whenever the definition has no
// lockedBlocksCallout — see buildStartBlocksXml.
function blockXml(
  node: MazeBlockNode,
  next: string | undefined,
  firstLockedNode: MazeBlockNode | undefined,
): string {
  const nextXml = next ? `<next>${next}</next>` : '';
  const lockedAttr = node.locked ? ' deletable="false"' : '';
  const idAttr = node === firstLockedNode ? ' id="callMe"' : '';
  const attrs = `${lockedAttr}${idAttr}`;
  switch (node.type) {
    case 'moveForward':
      return `<block type="maze_moveForward"${attrs}>${nextXml}</block>`;
    case 'turnLeft':
      return `<block type="maze_turn"${attrs}><title name="DIR">turnLeft</title>${nextXml}</block>`;
    case 'turnRight':
      return `<block type="maze_turn"${attrs}><title name="DIR">turnRight</title>${nextXml}</block>`;
    case 'fill':
      return `<block type="maze_fill"${attrs}>${nextXml}</block>`;
    case 'dig':
      return `<block type="maze_dig"${attrs}>${nextXml}</block>`;
    case 'getNectar':
      return `<block type="maze_nectar"${attrs}>${nextXml}</block>`;
    case 'makeHoney':
      return `<block type="maze_honey"${attrs}>${nextXml}</block>`;
    case 'collect':
      return `<block type="collector_collect"${attrs}>${nextXml}</block>`;
    case 'repeat': {
      const body = chainXml(node.children, firstLockedNode);
      const statement = body ? `<statement name="DO">${body}</statement>` : '';
      return (
        `<block type="controls_repeat_dropdown"${attrs}>` +
        `<title name="TIMES" config="1-20">${node.times}</title>` +
        `${statement}${nextXml}</block>`
      );
    }
  }
}

/** Chains a sibling list via nested `<next>`, innermost (last) block first. */
function chainXml(
  program: MazeBlockNode[],
  firstLockedNode?: MazeBlockNode,
): string {
  let xml: string | undefined;
  for (let i = program.length - 1; i >= 0; i--) {
    xml = blockXml(program[i], xml, firstLockedNode);
  }
  return xml ?? '';
}

/** Every real block program is wrapped in a fixed, undeletable `when_run`
 * root — shared by start_blocks and solution_blocks alike. */
function wrapWhenRunXml(
  program: MazeBlockNode[],
  firstLockedNode?: MazeBlockNode,
): string {
  const body = chainXml(program, firstLockedNode);
  const next = body ? `<next>${body}</next>` : '';
  return `<xml><block type="when_run" deletable="false" movable="false">${next}</block></xml>`;
}

/**
 * The learner's starting program (WOW plan §1.5) — empty by default (the
 * behavior every existing caller relied on before this field existed). A
 * locked block (§4.4) gets its real-curriculum `id="callMe"` anchor so a
 * `lockedBlocksCallout` can point `callout_json` at it.
 */
export function buildStartBlocksXml(program: MazeBlockNode[] = []): string {
  return wrapWhenRunXml(program, findFirstLockedNode(program));
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
  return wrapWhenRunXml(program);
}

/**
 * `callout_json` anchored at the first locked start-program block (§4.4) —
 * real shape reverse-engineered from
 * dashboard/config/levels/custom/maze/courseC_maze_debugging5_2025.level.
 * Undefined (nothing to emit) unless the definition both asks for a callout
 * AND actually locked a block for it to point at.
 */
function buildCalloutJson(
  startProgram: MazeBlockNode[] | undefined,
  calloutText: string | undefined,
): string | undefined {
  if (!calloutText || !startProgram || !findFirstLockedNode(startProgram)) {
    return undefined;
  }
  return JSON.stringify([
    {
      localization_key: 'debug_locked_blocks',
      callout_text: calloutText,
      element_id: '#callMe',
      on: '',
      qtip_config: {
        codeStudio: {canReappear: true, dropletPaletteCategory: ''},
        style: {classes: ''},
        position: {my: 'left top', at: 'left center', adjust: {x: 0, y: 0}},
      },
    },
  ]);
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
  // The Step button is the debugging affordance (§4.2: 94% of real debug
  // levels set it) — default it on whenever there's a starting program to
  // step through, unless the agent gave its own stepMode.
  const stepMode =
    definition.stepMode ?? (definition.startProgram ? '1' : undefined);
  const calloutJson = buildCalloutJson(
    definition.startProgram,
    definition.lockedBlocksCallout,
  );
  const properties = {
    maze: JSON.stringify(definition.grid),
    skin: definition.skin,
    short_instructions: definition.shortInstructions,
    long_instructions: definition.longInstructions,
    start_direction: String(definition.startDirection),
    ideal: String(definition.idealBlockCount),
    ...(stepMode !== undefined ? {step_mode: stepMode} : {}),
    ...(definition.conceptDifficulty
      ? {level_concept_difficulty: definition.conceptDifficulty}
      : {}),
    ...(calloutJson !== undefined ? {callout_json: calloutJson} : {}),
  };
  const parsed: ParsedLevel = {
    levelType: 'Maze',
    properties,
    startBlocksXml: buildStartBlocksXml(definition.startProgram ?? []),
    toolboxBlocksXml: buildToolboxBlocksXml(definition.toolbox),
    solutionBlocksXml: buildSolutionBlocksXml(definition.solution),
  };
  return buildMazeLevelProperties(numericId, levelKey, 'Maze', parsed);
}
