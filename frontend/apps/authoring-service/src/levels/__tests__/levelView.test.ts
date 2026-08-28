import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {parseLevelXml} from '@code-dot-org/authoring';

import type {ExistingLevelExperience} from '../../authoring/model.js';
import {resolveRepoRoot} from '../../boot/paths.js';
import {buildLevelView} from '../levelView.js';
import {buildMazeLevelWireProperties, type MazeLevelDefinition} from '../mazeLevel.js';

function draftExperience(
  overrides: Partial<ExistingLevelExperience> = {},
): ExistingLevelExperience {
  return {
    id: 'draft-exp-1',
    origin: 'draft',
    kind: 'existingLevel',
    title: 'Turn and go',
    levelKey: 'draft:draft-level-1',
    levelType: 'Maze',
    runtime: 'labhost',
    labKey: 'maze',
    levelNumericId: 900,
    ...overrides,
  };
}

const definition: MazeLevelDefinition = {
  grid: [
    [0, 0, 0, 0],
    [0, 2, 1, 0],
    [0, 1, 3, 0],
    [0, 0, 0, 0],
  ],
  startDirection: 1,
  skin: 'birds',
  shortInstructions: 'Turn right, then move forward twice to reach the goal.',
  idealBlockCount: 3,
  toolbox: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
  solution: [
    {type: 'moveForward'},
    {type: 'turnRight'},
    {type: 'moveForward'},
  ],
};

describe('buildLevelView', () => {
  it('decodes the grid as one compact digit-string per row', () => {
    const properties = buildMazeLevelWireProperties(900, 'draft:draft-level-1', definition);
    const view = buildLevelView({
      experience: draftExperience(),
      properties,
      visuallyEdited: false,
    });
    expect(view.grid).toEqual(['0000', '0210', '0130', '0000']);
    expect(view.gridLegend).toMatch(/0=wall/);
  });

  it('decodes toolbox and solution to the friendly create_level JSON shape', () => {
    const properties = buildMazeLevelWireProperties(900, 'draft:draft-level-1', definition);
    const view = buildLevelView({
      experience: draftExperience(),
      properties,
      visuallyEdited: false,
    });
    expect(view.toolbox).toEqual(['moveForward', 'turnLeft', 'turnRight', 'repeat']);
    expect(view.solutionProgram).toEqual([
      {type: 'moveForward'},
      {type: 'turnRight'},
      {type: 'moveForward'},
    ]);
    // buildStartBlocksXml() (no argument, pre-Pass-3b) always emits an empty
    // when_run root — an empty program, not an undecodable one.
    expect(view.startProgram).toEqual([]);
    expect(view.startDirection).toBe(1);
    expect(view.idealBlockCount).toBe(3);
    expect(view.shortInstructions).toMatch(/Turn right/);
  });

  it('marks a draft level editable, and reports the real check verdict', () => {
    const properties = buildMazeLevelWireProperties(900, 'draft:draft-level-1', definition);
    const view = buildLevelView({
      experience: draftExperience(),
      properties,
      visuallyEdited: false,
    });
    expect(view.origin).toBe('draft');
    expect(view.editable).toBe(true);
    expect(view.checkVerdict?.ok).toBe(true);
    expect(view.checkVerdict?.mode).toBe('simulated');
  });

  it('marks a visually-edited draft level not editable', () => {
    const properties = buildMazeLevelWireProperties(900, 'draft:draft-level-1', definition);
    const view = buildLevelView({
      experience: draftExperience(),
      properties,
      visuallyEdited: true,
    });
    expect(view.editable).toBe(false);
  });

  it('reports goals declared on a Bee-style goal-based level', () => {
    const properties = {
      ...buildMazeLevelWireProperties(901, 'draft:draft-level-2', {
        ...definition,
        skin: 'bee',
        toolbox: ['moveForward', 'getNectar'],
        solution: [{type: 'getNectar'}],
      }),
      nectar_goal: '1',
    };
    const view = buildLevelView({
      experience: draftExperience({levelNumericId: 901, levelKey: 'draft:draft-level-2'}),
      properties,
      visuallyEdited: false,
    });
    expect(view.goals?.nectarGoal).toBe(1);
  });

  it('falls back to a note for a non-Maze-family level rather than decoding garbage', () => {
    const view = buildLevelView({
      experience: draftExperience({
        levelType: 'Fish',
        levelKey: 'lb:fish/some_level',
        origin: 'levelbuilder',
      }),
      properties: {short_instructions: 'Sort the fish by color.'},
      visuallyEdited: false,
    });
    expect(view.grid).toBeUndefined();
    expect(view.toolbox).toBeUndefined();
    expect(view.note).toMatch(/Fish level/);
    expect(view.shortInstructions).toBe('Sort the fish by color.');
  });

  it('stays well under a naive raw-JSON dump in size (token-conscious encoding)', () => {
    const properties = buildMazeLevelWireProperties(900, 'draft:draft-level-1', definition);
    const view = buildLevelView({
      experience: draftExperience(),
      properties,
      visuallyEdited: false,
    });
    const compactSize = JSON.stringify(view).length;
    // The same grid as a naive nested-array-of-numbers dump, for comparison —
    // the actual gap widens fast with grid size since every cell costs a
    // comma and (for row nesting) a bracket pair instead of one digit.
    const naiveGridSize = JSON.stringify(definition.grid).length;
    expect(compactSize).toBeLessThan(1500);
    expect(JSON.stringify(view.grid).length).toBeLessThan(naiveGridSize);
  });
});

let repoRoot: string | undefined;
try {
  repoRoot = resolveRepoRoot();
} catch {
  repoRoot = undefined;
}

// The actual live-verification target (WOW plan Pass 1): a real, currently
// published Course D Bee level, decoded the same way get_level would.
describe.skipIf(!repoRoot)('buildLevelView against a real Course D bee .level file', () => {
  it('decodes grid, toolbox, and solution accurately for courseD_bee_nestedLoops1a_2024', () => {
    const xml = fs.readFileSync(
      path.join(
        repoRoot as string,
        'dashboard/config/levels/custom/maze/courseD_bee_nestedLoops1a_2024.level',
      ),
      'utf8',
    );
    const parsed = parseLevelXml(xml);
    const properties = {
      ...parsed.properties,
      startBlocksXml: parsed.startBlocksXml,
      toolboxBlocksXml: parsed.toolboxBlocksXml,
      solutionBlocksXml: parsed.solutionBlocksXml,
    };
    const view = buildLevelView({
      experience: draftExperience({
        origin: 'levelbuilder',
        levelKey: 'lb:courseD_bee_nestedLoops1a_2024',
        levelType: 'Karel',
        title: undefined,
      }),
      properties,
      visuallyEdited: false,
    });

    expect(view.origin).toBe('levelbuilder');
    expect(view.editable).toBe(false);
    expect(view.skin).toBe('bee');
    expect(view.startDirection).toBe(1);
    expect(view.idealBlockCount).toBe(5);
    expect(view.shortInstructions).toBe('Help the bee collect all of the nectar.');
    expect(view.grid).toHaveLength(8);
    expect(view.grid?.every(row => row.length === 8)).toBe(true);
    expect(view.toolbox).toEqual(['moveForward', 'turnRight', 'turnLeft', 'getNectar', 'repeat']);
    expect(view.solutionProgram).toEqual([
      {type: 'moveForward'},
      {
        type: 'repeat',
        times: 2,
        children: [{type: 'moveForward'}, {type: 'getNectar'}],
      },
    ]);
    expect(view.goals?.nectarGoal).toBe(2);
    expect(view.checkVerdict?.ok).toBe(true);
    expect(view.checkVerdict?.mode).toBe('simulated');
    expect(view.note).toBeUndefined();
  });
});
