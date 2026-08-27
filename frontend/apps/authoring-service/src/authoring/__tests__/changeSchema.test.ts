import {describe, expect, it} from 'vitest';

import {CurriculumChangeBodySchema} from '../changeSchema.js';

describe('overrideLevelInstructions', () => {
  it('accepts a patch with either or both instruction fields', () => {
    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {shortInstructions: 'Reworded for 2nd grade.'},
      }).success,
    ).toBe(true);

    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {},
      }).success,
    ).toBe(true);

    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelInstructions',
        experienceId: 'lb:some_maze_level',
        patch: {
          shortInstructions: 'short',
          longInstructions: 'long',
        },
      }).success,
    ).toBe(true);
  });

  it('rejects a missing experienceId', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'overrideLevelInstructions',
      patch: {shortInstructions: 'x'},
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-string instructions field', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      patch: {shortInstructions: 42},
    });
    expect(result.success).toBe(false);
  });
});

describe('overrideLevelDefinition', () => {
  it('accepts a patch with one or more definition fields', () => {
    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: '2'},
      }).success,
    ).toBe(true);

    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {},
      }).success,
    ).toBe(true);

    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {
          serialized_maze: '[[{"tileType":0}]]',
          maze: '[[0]]',
          startBlocksXml: '<xml></xml>',
          toolboxBlocksXml: '<xml></xml>',
          solutionBlocksXml: '<xml></xml>',
          startDirection: '1',
          ideal: '3',
        },
      }).success,
    ).toBe(true);
  });

  it('accepts null as an explicit delete-this-key signal', () => {
    expect(
      CurriculumChangeBodySchema.safeParse({
        op: 'overrideLevelDefinition',
        experienceId: 'lb:some_maze_level',
        patch: {startDirection: null},
      }).success,
    ).toBe(true);
  });

  it('rejects a missing experienceId', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'overrideLevelDefinition',
      patch: {startDirection: '1'},
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-string, non-null definition field', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'overrideLevelDefinition',
      experienceId: 'lb:some_maze_level',
      patch: {startDirection: 2},
    });
    expect(result.success).toBe(false);
  });

  it('strips an unknown key rather than accepting it verbatim', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'overrideLevelDefinition',
      experienceId: 'lb:some_maze_level',
      patch: {startDirection: '1', notARealField: 'x'},
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    const data = result.data as {
      op: 'overrideLevelDefinition';
      patch: Record<string, unknown>;
    };
    expect(data).toMatchObject({patch: {startDirection: '1'}});
    expect(data.patch.notARealField).toBeUndefined();
  });
});
