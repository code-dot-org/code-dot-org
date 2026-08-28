import {describe, expect, it} from 'vitest';

import {checkImportedMazeLevel} from '../importedLevelCheck.js';
import {
  buildBlankMazeLevelDefinition,
  buildMazeLevelWireProperties,
  buildSolutionBlocksXml,
  buildStartBlocksXml,
  buildToolboxBlocksXml,
  CREATABLE_MAZE_SKINS,
  MazeLevelDefinitionSchema,
  runMazeProgram,
  simulateGoalBasedMazeProgram,
  verifyDebugMazeLevel,
  verifyMazeLevelSolvable,
  type MazeBlockNode,
  type MazeLevelDefinition,
} from '../mazeLevel.js';

// 4x4, wall border, one open row: (1,1)=start, (2,1)=open, (1,3)=finish is
// unreachable by design in some tests below.
function baseDefinition(
  overrides: Partial<MazeLevelDefinition> = {},
): MazeLevelDefinition {
  return {
    grid: [
      [0, 0, 0, 0],
      [0, 2, 1, 0],
      [0, 1, 3, 0],
      [0, 0, 0, 0],
    ],
    startDirection: 1, // east
    skin: 'birds',
    shortInstructions: 'Move to the goal.',
    longInstructions: 'Move to the goal.',
    idealBlockCount: 2,
    toolbox: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
    solution: [
      {type: 'moveForward'},
      {type: 'turnRight'},
      {type: 'moveForward'},
    ],
    ...overrides,
  };
}

describe('MazeLevelDefinitionSchema', () => {
  it('accepts a well-formed definition', () => {
    expect(MazeLevelDefinitionSchema.safeParse(baseDefinition()).success).toBe(
      true,
    );
  });

  it('rejects a repeat with times out of range', () => {
    const result = MazeLevelDefinitionSchema.safeParse(
      baseDefinition({
        solution: [
          {type: 'repeat', times: 999, children: [{type: 'moveForward'}]},
        ],
      }),
    );
    expect(result.success).toBe(false);
  });
});

describe('verifyMazeLevelSolvable', () => {
  it('accepts a solution that actually solves the grid', () => {
    const result = verifyMazeLevelSolvable(baseDefinition());
    expect(result).toEqual({ok: true});
  });

  it('rejects a grid with no reachable path from start to finish (known-unsolvable grid)', () => {
    const walledOff = baseDefinition({
      grid: [
        [0, 0, 0, 0, 0],
        [0, 2, 0, 3, 0],
        [0, 0, 0, 0, 0],
      ],
      solution: [{type: 'moveForward'}],
      idealBlockCount: 1,
    });
    expect(verifyMazeLevelSolvable(walledOff)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/not reachable/),
    });
  });

  it('rejects a solution using a block type not in the toolbox (off-palette solution)', () => {
    const offPalette = baseDefinition({
      toolbox: ['moveForward'], // turnRight not offered
    });
    expect(verifyMazeLevelSolvable(offPalette)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/turnRight.*not included in toolbox/s),
    });
  });

  it('rejects a solution that runs into a wall before reaching the goal', () => {
    const wrongTurn = baseDefinition({
      solution: [{type: 'moveForward'}, {type: 'moveForward'}],
    });
    expect(verifyMazeLevelSolvable(wrongTurn)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/hits a wall/),
    });
  });

  it('rejects a solution that never reaches the goal (no wall hit, just wrong)', () => {
    const missesGoal = baseDefinition({
      solution: [{type: 'turnLeft'}],
      toolbox: ['moveForward', 'turnLeft', 'turnRight'],
    });
    expect(verifyMazeLevelSolvable(missesGoal)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/never reaches the goal/),
    });
  });

  it('rejects a solution far over the ideal block-count budget', () => {
    const bloated = baseDefinition({
      idealBlockCount: 1,
      solution: [
        {type: 'moveForward'},
        {type: 'turnRight'},
        {type: 'moveForward'},
        {type: 'turnLeft'},
        {type: 'turnRight'},
        {type: 'turnLeft'},
      ],
    });
    expect(verifyMazeLevelSolvable(bloated)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/blocks; idealBlockCount is/),
    });
  });

  it('accepts a repeat-loop solution and counts the loop body once, not multiplied', () => {
    const grid = [
      [0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 3, 0],
      [0, 0, 0, 0, 0, 0],
    ];
    const withRepeat = baseDefinition({
      grid,
      startDirection: 1, // east
      idealBlockCount: 2,
      toolbox: ['moveForward', 'repeat'],
      solution: [{type: 'repeat', times: 3, children: [{type: 'moveForward'}]}],
    });
    expect(verifyMazeLevelSolvable(withRepeat)).toEqual({ok: true});
  });

  it('accepts a combined start/finish tile (5) solved by an empty-equivalent program', () => {
    const trivial = baseDefinition({
      grid: [
        [0, 0, 0],
        [0, 5, 0],
        [0, 0, 0],
      ],
      idealBlockCount: 1,
      toolbox: ['turnLeft'],
      solution: [{type: 'turnLeft'}],
    });
    expect(verifyMazeLevelSolvable(trivial)).toEqual({ok: true});
  });

  it('rejects a grid missing a finish tile', () => {
    const result = verifyMazeLevelSolvable(
      baseDefinition({
        grid: [
          [0, 0, 0],
          [0, 2, 0],
          [0, 0, 0],
        ],
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/finish tile/),
    });
  });

  it('rejects a non-rectangular grid', () => {
    const result = verifyMazeLevelSolvable(
      baseDefinition({
        grid: [
          [0, 0, 0],
          [0, 2, 3],
          [0, 0],
        ],
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/same length/),
    });
  });

  // Keeps systemPrompt.ts's "Worked example" honest: that text is prose the
  // agent reads, not code the type checker or this suite otherwise touches.
  it('accepts the worked example quoted in the agent system prompt', () => {
    const workedExample = baseDefinition({
      grid: [
        [0, 0, 0, 0],
        [0, 2, 3, 0],
        [0, 0, 0, 0],
      ],
      startDirection: 0, // north, into a wall
      toolbox: ['moveForward', 'turnLeft', 'turnRight'],
      solution: [{type: 'turnRight'}, {type: 'moveForward'}],
      idealBlockCount: 2,
    });
    expect(verifyMazeLevelSolvable(workedExample)).toEqual({ok: true});
  });

  it('treats an obstacle tile as blocking, same as a wall (regression)', () => {
    // Obstacle (4) tiles block movement exactly like walls (0) — see
    // packages/labs/maze/src/api.ts's isPath. An obstacle directly between
    // start and finish, with no way around it, must be reported the same
    // way a wall would be: unreachable.
    const obstacleBlocksOnlyPath = baseDefinition({
      grid: [
        [0, 0, 0, 0, 0],
        [0, 2, 4, 3, 0],
        [0, 0, 0, 0, 0],
      ],
      startDirection: 1, // east
      toolbox: ['moveForward'],
      solution: [{type: 'moveForward'}, {type: 'moveForward'}],
      idealBlockCount: 2,
    });
    expect(verifyMazeLevelSolvable(obstacleBlocksOnlyPath)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/not reachable/),
    });
  });

  it('stops a solution at an obstacle tile even when the goal is reachable another way', () => {
    // Here the obstacle isn't the only path (isReachable's BFS finds finish
    // via the row below), so this exercises simulateMoveForward's own
    // obstacle check, not just the pre-check BFS.
    const obstacleInChosenPath = baseDefinition({
      grid: [
        [0, 0, 0, 0, 0],
        [0, 2, 4, 3, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ],
      startDirection: 1, // east
      toolbox: ['moveForward'],
      solution: [{type: 'moveForward'}, {type: 'moveForward'}],
      idealBlockCount: 2,
    });
    expect(verifyMazeLevelSolvable(obstacleInChosenPath)).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/hits a wall/),
    });
  });

  describe('Karel-family skin action blocks', () => {
    it('accepts a farmer-skin solution using fill/dig (simulated as no-ops)', () => {
      const farmer = baseDefinition({
        skin: 'farmer',
        toolbox: ['moveForward', 'turnRight', 'fill', 'dig'],
        solution: [
          {type: 'fill'},
          {type: 'moveForward'},
          {type: 'dig'},
          {type: 'turnRight'},
          {type: 'moveForward'},
        ],
        idealBlockCount: 5,
      });
      expect(verifyMazeLevelSolvable(farmer)).toEqual({ok: true});
    });

    it('accepts a bee-skin solution using getNectar/makeHoney (simulated as no-ops)', () => {
      const bee = baseDefinition({
        skin: 'bee',
        toolbox: ['moveForward', 'turnRight', 'getNectar', 'makeHoney'],
        solution: [
          {type: 'getNectar'},
          {type: 'moveForward'},
          {type: 'makeHoney'},
          {type: 'turnRight'},
          {type: 'moveForward'},
        ],
        idealBlockCount: 5,
      });
      expect(verifyMazeLevelSolvable(bee)).toEqual({ok: true});
    });

    it('accepts a collector-skin solution using collect (simulated as a no-op)', () => {
      const collector = baseDefinition({
        skin: 'collector',
        toolbox: ['moveForward', 'turnRight', 'collect'],
        solution: [
          {type: 'collect'},
          {type: 'moveForward'},
          {type: 'turnRight'},
          {type: 'moveForward'},
        ],
        idealBlockCount: 4,
      });
      expect(verifyMazeLevelSolvable(collector)).toEqual({ok: true});
    });

    it('rejects a toolbox offering a skin action block on the wrong skin', () => {
      const wrongSkin = baseDefinition({
        skin: 'birds',
        toolbox: ['moveForward', 'turnRight', 'fill'],
      });
      expect(verifyMazeLevelSolvable(wrongSkin)).toMatchObject({
        ok: false,
        reason: expect.stringMatching(
          /"fill" is only valid on skin "farmer"/,
        ),
      });
    });

    it('rejects a solution using getNectar when the toolbox/skin is farmer, not bee', () => {
      const mismatched = baseDefinition({
        skin: 'farmer',
        toolbox: ['moveForward', 'getNectar'],
      });
      expect(verifyMazeLevelSolvable(mismatched)).toMatchObject({
        ok: false,
        reason: expect.stringMatching(
          /"getNectar" is only valid on skin "bee"/,
        ),
      });
    });
  });
});

describe('XML serialization', () => {
  it('serializes an empty when_run for start blocks', () => {
    expect(buildStartBlocksXml()).toBe(
      '<xml><block type="when_run" deletable="false" movable="false"></block></xml>',
    );
  });

  it('serializes a toolbox listing each requested block type', () => {
    const xml = buildToolboxBlocksXml(['moveForward', 'turnLeft', 'turnRight']);
    expect(xml).toContain('<block type="maze_moveForward"/>');
    expect(xml).toContain(
      '<block type="maze_turn"><title name="DIR">turnLeft</title></block>',
    );
    expect(xml).toContain(
      '<block type="maze_turn"><title name="DIR">turnRight</title></block>',
    );
  });

  it('serializes a solution with next-chaining and a repeat statement body', () => {
    const xml = buildSolutionBlocksXml([
      {type: 'turnLeft'},
      {type: 'repeat', times: 3, children: [{type: 'moveForward'}]},
    ]);
    expect(xml).toContain(
      '<block type="when_run" deletable="false" movable="false">',
    );
    expect(xml).toContain(
      '<block type="maze_turn"><title name="DIR">turnLeft</title><next>',
    );
    expect(xml).toContain('<block type="controls_repeat_dropdown">');
    expect(xml).toContain('<title name="TIMES" config="1-20">3</title>');
    expect(xml).toContain(
      '<statement name="DO"><block type="maze_moveForward">',
    );
  });

  it('serializes each Karel-family skin action block to its real block type', () => {
    const toolboxXml = buildToolboxBlocksXml([
      'fill',
      'dig',
      'getNectar',
      'makeHoney',
      'collect',
    ]);
    expect(toolboxXml).toContain('<block type="maze_fill"/>');
    expect(toolboxXml).toContain('<block type="maze_dig"/>');
    expect(toolboxXml).toContain('<block type="maze_nectar"/>');
    expect(toolboxXml).toContain('<block type="maze_honey"/>');
    expect(toolboxXml).toContain('<block type="collector_collect"/>');

    const solutionXml = buildSolutionBlocksXml([
      {type: 'fill'},
      {type: 'dig'},
      {type: 'getNectar'},
      {type: 'makeHoney'},
      {type: 'collect'},
    ]);
    expect(solutionXml).toContain('<block type="maze_fill"><next>');
    expect(solutionXml).toContain('<block type="maze_dig"><next>');
    expect(solutionXml).toContain('<block type="maze_nectar"><next>');
    expect(solutionXml).toContain('<block type="maze_honey"><next>');
    expect(solutionXml).toContain('<block type="collector_collect">');
  });
});

describe('buildMazeLevelWireProperties', () => {
  it('produces the LevelProperties wire shape <Lab> consumes', () => {
    const definition = baseDefinition();
    const props = buildMazeLevelWireProperties(42, 'draft:abc123', definition);
    expect(props.id).toBe(42);
    expect(props.appName).toBe('maze');
    expect(props.type).toBe('Maze');
    expect(props.name).toBe('draft:abc123');
    expect(props.skin).toBe('birds');
    expect(props.startDirection).toBe('1');
    expect(props.ideal).toBe('2');
    expect(props.maze).toBe(JSON.stringify(definition.grid));
    expect(props.startBlocksXml).toBe(buildStartBlocksXml());
    expect(props.toolboxBlocksXml).toBe(
      buildToolboxBlocksXml(definition.toolbox),
    );
    expect(props.solutionBlocksXml).toBe(
      buildSolutionBlocksXml(definition.solution),
    );
  });

  // Pins the data-contract half of a real regression: a generated level
  // never carries initial_dirt (there's no such field in
  // MazeLevelDefinition, and none is synthesized here), so any bee-skinned
  // generated level reaches the client with initialDirtCell === undefined
  // for every cell. packages/labs/maze/src/BeeCell.ts's parseFromOldValues
  // used to call .toString() on that unconditionally and crash the lab on
  // mount; it now guards for undefined the same way Cell.parseFromOldValues
  // already did. This package can't import maze-lab (browser-only
  // React/Blockly), so the regression is pinned at this end of the
  // contract: the wire shape must never claim dirt data it doesn't have.
  it('never includes initial_dirt, even for a bee-skinned level (see BeeCell.parseFromOldValues)', () => {
    const beeSkinned = baseDefinition({skin: 'bees'});
    const props = buildMazeLevelWireProperties(42, 'draft:abc123', beeSkinned);
    expect(props).not.toHaveProperty('initial_dirt');
    expect(props).not.toHaveProperty('initialDirt');
  });
});

describe('buildBlankMazeLevelDefinition', () => {
  it('passes verifyMazeLevelSolvable by construction, for every creatable skin', () => {
    for (const skin of CREATABLE_MAZE_SKINS) {
      const definition = buildBlankMazeLevelDefinition({skin});
      expect(verifyMazeLevelSolvable(definition)).toEqual({ok: true});
    }
  });

  it('defaults to an 8x8 grid', () => {
    const definition = buildBlankMazeLevelDefinition({});
    expect(definition.grid).toHaveLength(8);
    expect(definition.grid[0]).toHaveLength(8);
  });

  it('honours an explicit grid size', () => {
    const definition = buildBlankMazeLevelDefinition({rows: 5, cols: 12});
    expect(definition.grid).toHaveLength(5);
    expect(definition.grid[0]).toHaveLength(12);
    expect(verifyMazeLevelSolvable(definition)).toEqual({ok: true});
  });

  it('clamps an out-of-range grid size into the schema-valid window', () => {
    const definition = buildBlankMazeLevelDefinition({rows: 1, cols: 999});
    const parsed = MazeLevelDefinitionSchema.safeParse(definition);
    expect(parsed.success).toBe(true);
  });
});

describe('simulateGoalBasedMazeProgram', () => {
  // No finish tile (value 3) anywhere — a real Bee level's ordinary shape,
  // Author Mode gate #2. Start (1,1) faces east onto an open cell (2,1);
  // there's nothing to collect there, so the goal check is what actually
  // gates success, independent of position.
  const grid = [
    [0, 0, 0, 0],
    [0, 2, 1, 0],
    [0, 0, 0, 0],
  ];

  it('succeeds once the program collects at least the declared goal(s)', () => {
    const program: MazeBlockNode[] = [
      {type: 'getNectar'},
      {type: 'getNectar'},
    ];
    expect(
      simulateGoalBasedMazeProgram(grid, 1, program, {nectarGoal: 2}),
    ).toEqual({ok: true});
  });

  it('fails when the program collects less than the declared goal', () => {
    const program: MazeBlockNode[] = [{type: 'getNectar'}];
    const result = simulateGoalBasedMazeProgram(grid, 1, program, {
      nectarGoal: 2,
    });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(
      /nectar_goal is 2 but the solution only collects 1 nectar/,
    );
  });

  it('checks honeyGoal and minCollected independently of nectarGoal', () => {
    const program: MazeBlockNode[] = [
      {type: 'getNectar'},
      {type: 'makeHoney'},
    ];
    expect(
      simulateGoalBasedMazeProgram(grid, 1, program, {
        nectarGoal: 1,
        honeyGoal: 1,
        minCollected: 2,
      }),
    ).toEqual({ok: true});
    expect(
      simulateGoalBasedMazeProgram(grid, 1, program, {honeyGoal: 2}).ok,
    ).toBe(false);
    expect(
      simulateGoalBasedMazeProgram(grid, 1, program, {minCollected: 3}).ok,
    ).toBe(false);
  });

  it('fails on a wall hit, same as the finish-tile simulator', () => {
    const program: MazeBlockNode[] = [
      {type: 'moveForward'},
      {type: 'moveForward'},
      {type: 'moveForward'},
    ];
    const result = simulateGoalBasedMazeProgram(grid, 1, program, {
      nectarGoal: 0,
    });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/hits a wall/);
  });

  it('rejects a grid with no start tile', () => {
    const result = simulateGoalBasedMazeProgram(
      [
        [0, 0],
        [0, 0],
      ],
      1,
      [],
      {nectarGoal: 0},
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/must contain a start tile/);
  });

  it('counts collect toward minCollected (the Collector debug-level unlock)', () => {
    const program: MazeBlockNode[] = [{type: 'collect'}, {type: 'collect'}];
    expect(
      simulateGoalBasedMazeProgram(grid, 1, program, {minCollected: 2}),
    ).toEqual({ok: true});
    expect(
      simulateGoalBasedMazeProgram(grid, 1, program, {minCollected: 3}).ok,
    ).toBe(false);
  });
});

describe('runMazeProgram (structured outcome)', () => {
  const grid = [
    [0, 0, 0, 0],
    [0, 2, 1, 0],
    [0, 1, 3, 0],
    [0, 0, 0, 0],
  ];

  it('reports solved with the executed block count', () => {
    const program: MazeBlockNode[] = [
      {type: 'moveForward'},
      {type: 'turnRight'},
      {type: 'moveForward'},
    ];
    expect(runMazeProgram(grid, 1, program)).toEqual({
      kind: 'solved',
      blocksExecuted: 3,
    });
  });

  it('reports a wall hit with position, facing, and blocks executed so far', () => {
    const program: MazeBlockNode[] = [
      {type: 'moveForward'},
      {type: 'moveForward'},
    ];
    expect(runMazeProgram(grid, 1, program)).toEqual({
      kind: 'wall',
      at: {row: 1, col: 2},
      facing: 1,
      blocksExecuted: 2,
    });
  });

  it('reports stopped when the program ends short of the goal with no wall hit', () => {
    const program: MazeBlockNode[] = [{type: 'turnRight'}];
    expect(runMazeProgram(grid, 1, program)).toEqual({
      kind: 'stopped',
      at: {row: 1, col: 1},
      facing: 2,
      goal: {row: 2, col: 2},
      blocksExecuted: 1,
    });
  });

  it('reports gridInvalid for a malformed grid', () => {
    const outcome = runMazeProgram(
      [
        [0, 2],
        [0, 0],
      ],
      1,
      [],
    );
    expect(outcome.kind).toBe('gridInvalid');
    expect(outcome.kind === 'gridInvalid' && outcome.reason).toMatch(
      /finish tile/,
    );
  });

  it('reports goalUnreachable when no path connects start to finish', () => {
    const walledOff = [
      [0, 0, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 3, 0],
      [0, 0, 0, 0],
    ];
    expect(runMazeProgram(walledOff, 1, [])).toEqual({
      kind: 'goalUnreachable',
      start: {row: 1, col: 1},
      goal: {row: 2, col: 2},
    });
  });
});

describe('verifyDebugMazeLevel', () => {
  // The dropdown-swap archetype (§4.3 archetype 4) on baseDefinition's own
  // 3-block solution: turnRight -> turnLeft sends Pegman into the wall
  // instead of the goal. Same block count as the solution (near-miss
  // clause 4 with countDelta 0, multisetDelta 2 — turnLeft +1/turnRight -1).
  const swappedTurn: MazeBlockNode[] = [
    {type: 'moveForward'},
    {type: 'turnLeft'},
    {type: 'moveForward'},
  ];

  it('accepts a near-miss buggy start and returns both verified outcomes', () => {
    const definition = baseDefinition({startProgram: swappedTurn});
    const result = verifyDebugMazeLevel(
      definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.startOutcome).toEqual({
      kind: 'wall',
      at: {row: 1, col: 2},
      facing: 0,
      blocksExecuted: 3,
    });
    expect(result.solutionOutcome).toEqual({kind: 'solved', blocksExecuted: 3});
    expect(result.narrative).toMatch(/buggy start verified:.*hits the wall/);
    expect(result.narrative).toMatch(/solution verified: solves in 3 block/);
  });

  it('clause 1: rejects when the solution itself does not solve the grid', () => {
    const definition = baseDefinition({
      startProgram: swappedTurn,
      solution: [{type: 'turnLeft'}], // never reaches the goal
    });
    const result = verifyDebugMazeLevel(
      definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/never reaches the goal/),
    });
  });

  it('clause 2: rejects a start program that already solves the grid', () => {
    const definition = baseDefinition({
      startProgram: [{type: 'moveForward'}, {type: 'turnRight'}, {type: 'moveForward'}],
    });
    const result = verifyDebugMazeLevel(
      definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/already reaches the goal/),
    });
  });

  it('clause 3: rejects a start program using a block type off the toolbox', () => {
    const definition = baseDefinition({
      toolbox: ['moveForward', 'turnRight', 'repeat'], // no turnLeft
      startProgram: swappedTurn,
    });
    const result = verifyDebugMazeLevel(
      definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/turnLeft.*not in toolbox/s),
    });
  });

  it('clause 4: rejects a start program that is not a near-miss of the solution', () => {
    const definition = baseDefinition({
      startProgram: [{type: 'turnLeft'}], // unrelated to the 3-block solution
    });
    const result = verifyDebugMazeLevel(
      definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/isn't a near-miss/),
    });
  });

  describe('clause 5: expectedFailure', () => {
    it('accepts when the asserted failure matches the actual outcome', () => {
      const definition = baseDefinition({
        startProgram: swappedTurn,
        expectedFailure: {kind: 'wall', at: {row: 1, col: 2}, facing: 0},
      });
      const result = verifyDebugMazeLevel(
        definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
      );
      expect(result.ok).toBe(true);
    });

    it('rejects when the asserted kind does not match', () => {
      const definition = baseDefinition({
        startProgram: swappedTurn,
        expectedFailure: {kind: 'stopped'},
      });
      const result = verifyDebugMazeLevel(
        definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
      );
      expect(result).toMatchObject({
        ok: false,
        reason: expect.stringMatching(/expectedFailure\.kind is 'stopped'/),
      });
    });

    it('rejects when the asserted cell does not match', () => {
      const definition = baseDefinition({
        startProgram: swappedTurn,
        expectedFailure: {kind: 'wall', at: {row: 0, col: 0}},
      });
      const result = verifyDebugMazeLevel(
        definition as MazeLevelDefinition & {startProgram: MazeBlockNode[]},
      );
      expect(result).toMatchObject({
        ok: false,
        reason: expect.stringMatching(/expectedFailure\.at is row 0 col 0/),
      });
    });
  });
});

describe('locked blocks (XML round-trip)', () => {
  it('emits deletable="false" for a locked block and leaves others editable', () => {
    const xml = buildStartBlocksXml([
      {type: 'moveForward', locked: true},
      {type: 'moveForward'},
    ]);
    expect(xml).toContain('<block type="maze_moveForward" deletable="false" id="callMe">');
    // The second, unlocked block carries no attributes at all.
    expect(xml).toContain('<block type="maze_moveForward"></block>');
  });

  it('tags only the first locked block with id="callMe", in document order', () => {
    const xml = buildStartBlocksXml([
      {type: 'moveForward'},
      {type: 'turnRight', locked: true},
      {type: 'moveForward', locked: true},
    ]);
    expect(xml.match(/id="callMe"/g)).toHaveLength(1);
    expect(xml).toContain(
      '<block type="maze_turn" deletable="false" id="callMe"><title name="DIR">turnRight</title>',
    );
  });

  it('locks a repeat wrapper the same way as a leaf block', () => {
    const xml = buildStartBlocksXml([
      {type: 'repeat', times: 2, locked: true, children: [{type: 'moveForward'}]},
    ]);
    expect(xml).toContain('<block type="controls_repeat_dropdown" deletable="false" id="callMe">');
  });

  it('is unchanged for a program with no locked blocks (no stray attributes)', () => {
    const xml = buildStartBlocksXml([{type: 'moveForward'}]);
    expect(xml).toBe(buildSolutionBlocksXml([{type: 'moveForward'}]));
  });
});

describe('buildMazeLevelWireProperties — debug-level fields', () => {
  const definition = baseDefinition({
    startProgram: [
      {type: 'moveForward', locked: true},
      {type: 'turnLeft'},
      {type: 'moveForward'},
    ],
  });

  it('defaults step_mode to "1" whenever startProgram is set', () => {
    const props = buildMazeLevelWireProperties(1, 'draft:x', definition);
    expect(props.step_mode).toBe('1');
  });

  it('honors an explicit stepMode over the startProgram default', () => {
    const props = buildMazeLevelWireProperties(1, 'draft:x', {
      ...definition,
      stepMode: '2',
    });
    expect(props.step_mode).toBe('2');
  });

  it('omits step_mode entirely for an ordinary (non-debug) level', () => {
    const props = buildMazeLevelWireProperties(1, 'draft:x', baseDefinition());
    expect(props).not.toHaveProperty('step_mode');
  });

  it('passes level_concept_difficulty through verbatim', () => {
    const props = buildMazeLevelWireProperties(1, 'draft:x', {
      ...definition,
      conceptDifficulty: {sequencing: 2, debugging: 1, repeat_loops: 1},
    });
    expect(props.level_concept_difficulty).toEqual({
      sequencing: 2,
      debugging: 1,
      repeat_loops: 1,
    });
  });

  it('emits callout_json anchored at #callMe only when lockedBlocksCallout is set', () => {
    const withoutCallout = buildMazeLevelWireProperties(1, 'draft:x', definition);
    expect(withoutCallout).not.toHaveProperty('callout_json');

    const withCallout = buildMazeLevelWireProperties(1, 'draft:x', {
      ...definition,
      lockedBlocksCallout: 'These blocks are locked and cannot be deleted!',
    });
    const callout = JSON.parse(withCallout.callout_json as string);
    expect(callout).toEqual([
      expect.objectContaining({
        callout_text: 'These blocks are locked and cannot be deleted!',
        element_id: '#callMe',
      }),
    ]);
  });

  it('omits callout_json when lockedBlocksCallout is set but nothing is locked', () => {
    const props = buildMazeLevelWireProperties(1, 'draft:x', {
      ...baseDefinition(),
      startProgram: [{type: 'moveForward'}], // no locked block
      lockedBlocksCallout: 'unused',
    });
    expect(props).not.toHaveProperty('callout_json');
  });

  // §8 risk 10: close the loop by running the generated level's OWN wire
  // properties back through the real-level checker, rather than trusting
  // the typed definition and the wire builder to agree by construction.
  it('round-trips through checkImportedMazeLevel as a passing simulated level', () => {
    const props = buildMazeLevelWireProperties(1, 'draft:x', definition);
    expect(checkImportedMazeLevel({properties: props})).toMatchObject({
      ok: true,
      mode: 'simulated',
    });
  });
});
