import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {parseLevelXml, type ParsedLevelXml} from '@code-dot-org/authoring';

import {resolveRepoRoot} from '../../boot/paths.js';
import {
  checkImportedMazeLevel,
  type ImportedLevelCheckInput,
} from '../importedLevelCheck.js';
import {buildSolutionBlocksXml, buildToolboxBlocksXml} from '../mazeLevel.js';

/** Flattens a parseLevelXml() result the way buildMazeLevelProperties does:
 * config properties plus the blocks XML at the same top level. */
function propertiesFrom(parsed: ParsedLevelXml): Record<string, unknown> {
  return {
    ...parsed.properties,
    startBlocksXml: parsed.startBlocksXml,
    toolboxBlocksXml: parsed.toolboxBlocksXml,
    solutionBlocksXml: parsed.solutionBlocksXml,
  };
}

function input(
  overrides: Partial<ImportedLevelCheckInput['properties']> = {},
): ImportedLevelCheckInput {
  return {
    properties: {
      maze: JSON.stringify([
        [0, 0, 0, 0],
        [0, 2, 1, 0],
        [0, 1, 3, 0],
        [0, 0, 0, 0],
      ]),
      start_direction: '1', // east
      toolboxBlocksXml: buildToolboxBlocksXml([
        'moveForward',
        'turnLeft',
        'turnRight',
      ]),
      solutionBlocksXml: buildSolutionBlocksXml([
        {type: 'moveForward'},
        {type: 'turnRight'},
        {type: 'moveForward'},
      ]),
      ...overrides,
    },
  };
}

describe('checkImportedMazeLevel', () => {
  it('passes with full simulation for a level matching mazeLevel.ts\'s own generator output', () => {
    expect(checkImportedMazeLevel(input())).toEqual({
      ok: true,
      mode: 'simulated',
      reasons: [],
    });
  });

  it('fails (palette) when the solution uses a block type missing from the toolbox', () => {
    const result = checkImportedMazeLevel(
      input({
        toolboxBlocksXml: buildToolboxBlocksXml(['moveForward']), // no turn
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('palette');
    expect(result.reasons[0]).toMatch(/maze_turn.*not offered by the toolbox/);
  });

  it('fails (simulated) when the solution runs into a wall', () => {
    const result = checkImportedMazeLevel(
      input({
        solutionBlocksXml: buildSolutionBlocksXml([
          {type: 'moveForward'},
          {type: 'moveForward'},
        ]),
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('simulated');
    expect(result.reasons[0]).toMatch(/hits a wall/);
  });

  it('fails (simulated) when the solution never reaches the goal', () => {
    const result = checkImportedMazeLevel(
      input({
        solutionBlocksXml: buildSolutionBlocksXml([{type: 'turnLeft'}]),
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('simulated');
    expect(result.reasons[0]).toMatch(/never reaches the goal/);
  });

  it('passes (simulated) for a farmer-skin solution using fill/dig no-ops', () => {
    const result = checkImportedMazeLevel(
      input({
        toolboxBlocksXml: buildToolboxBlocksXml([
          'moveForward',
          'turnRight',
          'fill',
          'dig',
        ]),
        solutionBlocksXml: buildSolutionBlocksXml([
          {type: 'moveForward'},
          {type: 'fill'},
          {type: 'dig'},
          {type: 'turnRight'},
          {type: 'moveForward'},
        ]),
      }),
    );
    expect(result).toEqual({ok: true, mode: 'simulated', reasons: []});
  });

  it('passes (palette-only, with a note) when the solution uses a block type the simulator does not model', () => {
    const solutionWithConditional =
      '<xml><block type="when_run" deletable="false" movable="false"><next>' +
      '<block type="maze_if"><title name="DIR">isPathForward</title>' +
      '<statement name="DO"><block type="maze_moveForward"/></statement>' +
      '</block></next></block></xml>';
    const result = checkImportedMazeLevel(
      input({
        toolboxBlocksXml:
          '<xml><block type="maze_moveForward"/><block type="maze_if"/></xml>',
        solutionBlocksXml: solutionWithConditional,
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('palette');
    expect(result.note).toMatch(/not attempted.*maze_if/);
  });

  it('treats a start_blocks-pinned block as satisfying the palette check (regression: real levels pin required blocks outside the toolbox)', () => {
    const result = checkImportedMazeLevel(
      input({
        startBlocksXml:
          '<xml><block type="when_run" deletable="false" movable="false"/>' +
          '<block type="maze_fill" deletable="false"/></xml>',
        toolboxBlocksXml: buildToolboxBlocksXml(['moveForward', 'turnRight']),
        solutionBlocksXml: buildSolutionBlocksXml([
          {type: 'fill'},
          {type: 'moveForward'},
          {type: 'turnRight'},
          {type: 'moveForward'},
        ]),
      }),
    );
    expect(result).toEqual({ok: true, mode: 'simulated', reasons: []});
  });

  it('fails (palette) when the level has no solution_blocks', () => {
    const result = checkImportedMazeLevel(
      input({solutionBlocksXml: undefined}),
    );
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('palette');
    expect(result.reasons[0]).toMatch(/no solution_blocks/);
  });

  it('extracts the grid from serialized_maze (tileType cells) when maze is absent', () => {
    const result = checkImportedMazeLevel(
      input({
        maze: undefined,
        serialized_maze: JSON.stringify([
          [{tileType: 0}, {tileType: 0}, {tileType: 0}, {tileType: 0}],
          [{tileType: 0}, {tileType: 2}, {tileType: 1}, {tileType: 0}],
          [{tileType: 0}, {tileType: 1}, {tileType: 3}, {tileType: 0}],
          [{tileType: 0}, {tileType: 0}, {tileType: 0}, {tileType: 0}],
        ]),
      }),
    );
    expect(result).toEqual({ok: true, mode: 'simulated', reasons: []});
  });

  it('passes (palette-only, with a note) when the level has no grid to simulate against', () => {
    const result = checkImportedMazeLevel(
      input({maze: undefined, serialized_maze: undefined}),
    );
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('palette');
    expect(result.note).toMatch(/no maze or serialized_maze grid/);
  });
});

let repoRoot: string | undefined;
try {
  repoRoot = resolveRepoRoot();
} catch {
  repoRoot = undefined;
}

// Real, currently-published .level files — nothing to assert without a full
// checkout, so this block skips cleanly in a sparse one.
describe.skipIf(!repoRoot)('checkImportedMazeLevel against real .level files', () => {
  function readLevel(relativePath: string): Record<string, unknown> {
    const xml = fs.readFileSync(
      path.join(repoRoot as string, relativePath),
      'utf8',
    );
    return propertiesFrom(parseLevelXml(xml));
  }

  // Cited by mazeLevel.ts's own module header as the reverse-engineering
  // source for the XML dialect; its grid includes obstacle (4) tiles the
  // solution must route around — exercises the isBlockingTile fix.
  it('simulates courseD_maze_ramp6 (plain maze, birds skin) as solvable', () => {
    const result = checkImportedMazeLevel({
      properties: readLevel(
        'dashboard/config/levels/custom/maze/courseD_maze_ramp6.level',
      ),
    });
    expect(result).toEqual({ok: true, mode: 'simulated', reasons: []});
  });

  // A real, published Farmer level: its .level file's grid has no finish
  // tile at all (win is meant to be "all holes filled"), but the ported
  // maze-lab engine's single Validator class only ever checks position
  // against subtype.finish (see mazeLevel.ts's module header) — so this
  // level is, today, unwinnable through the ported runtime regardless of
  // what the solution does. The palette check still passes (every solution
  // block is offered by the toolbox); full simulation correctly reports the
  // missing finish tile rather than silently declaring victory.
  it('flags 20hr_farmer_stage9_2 (dirt-fill win condition) as unsolvable by position, not a false pass', () => {
    const result = checkImportedMazeLevel({
      properties: readLevel(
        'dashboard/config/levels/custom/maze/20hr_farmer_stage9_2.level',
      ),
    });
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('simulated');
    expect(result.reasons[0]).toMatch(/finish tile/);
  });
});
