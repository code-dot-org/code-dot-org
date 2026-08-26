import {describe, expect, it} from 'vitest';

import {
  buildMazeLevelWireProperties,
  buildSolutionBlocksXml,
  buildStartBlocksXml,
  buildToolboxBlocksXml,
  MazeLevelDefinitionSchema,
  verifyMazeLevelSolvable,
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
});
