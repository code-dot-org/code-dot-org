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
