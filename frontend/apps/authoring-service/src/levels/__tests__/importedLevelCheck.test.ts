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

  // Pins the §1.2 trap the map-editing Pass B patch must avoid: extractGrid
  // tries `maze` FIRST. The editor writes both `serialized_maze` (rich) and
  // `maze` (its tileType projection) together, always in agreement — this
  // is what "in agreement" looks like when Check reads the level.
  it('checks the same grid whether maze or serialized_maze wins, when both are present and agree', () => {
    const grid = [
      [0, 0, 0, 0],
      [0, 2, 1, 0],
      [0, 1, 3, 0],
      [0, 0, 0, 0],
    ];
    const result = checkImportedMazeLevel(
      input({
        maze: JSON.stringify(grid),
        serialized_maze: JSON.stringify(
          grid.map(row => row.map(tileType => ({tileType}))),
        ),
      }),
    );
    expect(result).toEqual({ok: true, mode: 'simulated', reasons: []});
  });

  // The trap itself, made concrete: a `maze` that's gone stale relative to
  // `serialized_maze` (e.g. a caller that wrote only one of the two keys)
  // is checked against the STALE grid, not the fresh one — extractGrid
  // tries `maze` first and never falls through when it parses. This is
  // exactly why serializeMapDraft always emits both keys in agreement.
  it('prefers the (possibly stale) maze field when both are present and disagree', () => {
    const staleMaze = [
      [0, 0, 0, 0],
      [0, 2, 1, 0],
      [0, 1, 3, 0],
      [0, 0, 0, 0],
    ];
    const freshSerializedMaze = [
      [0, 0, 0, 0],
      [0, 0, 2, 0], // start moved one column right of what `maze` still says
      [0, 1, 3, 0],
      [0, 0, 0, 0],
    ];
    const result = checkImportedMazeLevel(
      input({
        maze: JSON.stringify(staleMaze),
        serialized_maze: JSON.stringify(
          freshSerializedMaze.map(row => row.map(tileType => ({tileType}))),
        ),
      }),
    );
    // Simulated against the STALE grid — still solvable there too, so this
    // only demonstrates precedence, not a failure.
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
  // what the solution does. Real bee/farmer/etc. levels routinely have no
  // finish tile at all — completion is goal-driven, not position-driven —
  // so a missing finish tile must not be treated as a hard rejection (that
  // was this test's original assertion; see git history). It's routed to
  // the goal-consistency check instead: this particular level declares no
  // nectar_goal/honey_goal/min_collected, so there's nothing to check it
  // against either, and the honest report is "not attempted" (ok: true,
  // with a note saying so) — never a silent, unverified pass.
  it("reports 20hr_farmer_stage9_2 (dirt-fill win condition, no goal field declared) as not attempted, not rejected", () => {
    const result = checkImportedMazeLevel({
      properties: readLevel(
        'dashboard/config/levels/custom/maze/20hr_farmer_stage9_2.level',
      ),
    });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('palette');
    expect(result.note).toMatch(/no finish tile/);
    expect(result.note).toMatch(/not attempted/);
  });

  // Real Course D Bee content — a goal-based (no finish tile) level using
  // the maze_move/controls_repeat spelling rather than
  // maze_moveForward/controls_repeat_dropdown. Pins the SIMULATABLE_REAL_TYPES
  // extension: before it, this level's whole solution ("maze_move,
  // controls_repeat not simulated") fell to a palette-only "not attempted"
  // note despite being fully modelable — and it's exactly the shape get_level
  // needs to decode to describe a real level's solution accurately.
  it('fully simulates courseD_bee_nestedLoops1a_2024 (maze_move/controls_repeat spelling)', () => {
    const result = checkImportedMazeLevel({
      properties: readLevel(
        'dashboard/config/levels/custom/maze/courseD_bee_nestedLoops1a_2024.level',
      ),
    });
    expect(result).toEqual({
      ok: true,
      mode: 'simulated',
      reasons: [],
      note: expect.stringMatching(/no finish tile.*nectar_goal.*meets them/s),
    });
  });
});

describe('checkImportedMazeLevel — goal-based levels with no finish tile', () => {
  const grid = [
    [0, 0, 0, 0],
    [0, 2, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ];
  // Start (1,1) faces east onto the flower at (2,1); back west to (1,1),
  // then south to the hive at (1,2) — see simulateGoalBasedMazeProgram's
  // doc comment for the coordinate convention. Three getNectar plus two
  // makeHoney actually meets nectar_goal:'3'/honey_goal:'2' below, not just
  // the map's static capacity — this pins the fix for Author Mode gate #2:
  // a solution that only visited the map without collecting anything used
  // to still pass this check (it only ever verified the MAP could satisfy
  // the goal, never that the SOLUTION did).
  const beeSolution = [
    {type: 'moveForward'},
    {type: 'getNectar'},
    {type: 'getNectar'},
    {type: 'getNectar'},
    {type: 'turnRight'},
    {type: 'turnRight'},
    {type: 'moveForward'},
    {type: 'turnLeft'},
    {type: 'moveForward'},
    {type: 'makeHoney'},
    {type: 'makeHoney'},
  ] as const;

  const beeInput = (
    overrides: Partial<ImportedLevelCheckInput['properties']> = {},
  ): ImportedLevelCheckInput =>
    input({
      maze: JSON.stringify(grid),
      serialized_maze: JSON.stringify([
        [{tileType: 0}, {tileType: 0}, {tileType: 0}, {tileType: 0}],
        [
          {tileType: 0},
          {tileType: 2},
          {tileType: 1, featureType: 1, value: 3},
          {tileType: 0},
        ],
        [
          {tileType: 0},
          {tileType: 1, featureType: 0, value: 2},
          {tileType: 1},
          {tileType: 0},
        ],
        [{tileType: 0}, {tileType: 0}, {tileType: 0}, {tileType: 0}],
      ]),
      toolboxBlocksXml: buildToolboxBlocksXml([
        'moveForward',
        'turnLeft',
        'turnRight',
        'getNectar',
        'makeHoney',
      ]),
      solutionBlocksXml: buildSolutionBlocksXml([...beeSolution]),
      nectar_goal: '3',
      honey_goal: '2',
      ...overrides,
    });

  it('simulates the solution once the map can satisfy the declared goals, and passes when it actually collects enough', () => {
    const result = checkImportedMazeLevel(beeInput());
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('simulated');
    expect(result.note).toMatch(/nectar_goal.*honey_goal.*min_collected/);
  });

  it('fails when the map is consistent but the solution never collects enough', () => {
    const result = checkImportedMazeLevel(
      beeInput({solutionBlocksXml: buildSolutionBlocksXml([{type: 'moveForward'}])}),
    );
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('simulated');
    expect(result.reasons[0]).toMatch(/nectar_goal is 3.*collects 0 nectar/);
  });

  it('fails when the map has less nectar than nectar_goal declares', () => {
    const result = checkImportedMazeLevel(beeInput({nectar_goal: '10'}));
    expect(result.ok).toBe(false);
    expect(result.mode).toBe('palette');
    expect(result.reasons[0]).toMatch(/nectar_goal is 10.*only has 3 nectar/);
  });

  it('fails when the map has less honey than honey_goal declares', () => {
    const result = checkImportedMazeLevel(beeInput({honey_goal: '10'}));
    expect(result.ok).toBe(false);
    expect(result.reasons[0]).toMatch(/honey_goal is 10.*only has 2 honey/);
  });

  it('fails when the map has less total value than min_collected declares', () => {
    const result = checkImportedMazeLevel(
      beeInput({
        nectar_goal: undefined,
        honey_goal: undefined,
        min_collected: '100',
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.reasons[0]).toMatch(/min_collected is 100/);
  });

  it('rejects a goal-based grid with no start tile at all', () => {
    const result = checkImportedMazeLevel(
      beeInput({
        maze: JSON.stringify([
          [0, 0],
          [0, 0],
        ]),
        serialized_maze: undefined,
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.reasons[0]).toMatch(/no start tile/);
  });

  // Bee.succeeded() (Bee.ts) unconditionally requires checkedAllPurple() —
  // every purple (or default-colored) flower must be queried via the
  // 'nectar remaining' check block before a run counts as solved, wholly
  // apart from whether the nectar/honey/min_collected totals are met. This
  // is the runtime rule checkGoalConsistency/simulateGoalBasedMazeProgram
  // don't model (they only count totals) — these three cases pin the fix:
  // a bee level's checker result must never say "solved" when the runtime
  // would refuse the same run.
  describe('flower-color / nectar-remaining-check agreement (bee)', () => {
    it('passes (simulated) for redWithNectar flowers with no check block — red never needs checking', () => {
      const result = checkImportedMazeLevel(
        beeInput({skin: 'bee', flowerType: 'redWithNectar'}),
      );
      expect(result).toEqual({
        ok: true,
        mode: 'simulated',
        reasons: [],
        note: expect.stringMatching(/nectar_goal.*honey_goal.*min_collected/),
      });
    });

    it("fails when flowers are purple (default) and the toolbox doesn't offer the check block at all", () => {
      // Snake key — how a real .level file's raw properties (and a served
      // wire entry before buildMazeLevelProperties' camel copy) name it.
      const result = checkImportedMazeLevel(
        beeInput({skin: 'bee', flower_type: 'purpleNectarHidden'}),
      );
      expect(result.ok).toBe(false);
      expect(result.mode).toBe('palette');
      expect(result.reasons[0]).toMatch(
        /not solvable as toolboxed.*nectar remaining.*toolbox does not offer/,
      );
    });

    it('fails when flowers are purple and the toolbox offers the check block but the solution never uses it', () => {
      const toolboxWithCheckBlock =
        buildToolboxBlocksXml([
          'moveForward',
          'turnLeft',
          'turnRight',
          'getNectar',
          'makeHoney',
        ]).replace(
          '</xml>',
          '<block type="bee_ifNectarAmount"></block></xml>',
        );
      const result = checkImportedMazeLevel(
        beeInput({
          skin: 'bee',
          // flowerType omitted — Bee.ts defaults to purple whenever it
          // isn't exactly 'redWithNectar'.
          toolboxBlocksXml: toolboxWithCheckBlock,
        }),
      );
      expect(result.ok).toBe(false);
      expect(result.mode).toBe('palette');
      expect(result.reasons[0]).toMatch(
        /solution never uses the 'nectar remaining' check block/,
      );
    });
  });
});
