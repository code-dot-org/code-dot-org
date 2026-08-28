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

  // G1 regression: flower_type was absent from the schema, so a real save
  // from the visualization panel got silently stripped exactly like
  // notARealField above — the service recorded `patch: {}` while the UI
  // claimed success.
  it('accepts flower_type rather than stripping it', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'overrideLevelDefinition',
      experienceId: 'lb:some_maze_level',
      patch: {flower_type: 'redWithNectar'},
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    const data = result.data as {
      op: 'overrideLevelDefinition';
      patch: Record<string, unknown>;
    };
    expect(data.patch.flower_type).toBe('redWithNectar');
  });
});

describe('updateGenericLevelData', () => {
  it('accepts a whole video variant', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'updateGenericLevelData',
      experienceId: 'lb:some_video',
      data: {
        type: 'video',
        videoKey: 'elementary_machine_learning',
        youtubeCode: 'dQw4w9WgXcQ',
        displayName: 'Elementary Machine Learning',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a whole multi variant, including its answers array', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'updateGenericLevelData',
      experienceId: 'lb:some_multi',
      data: {
        type: 'multi',
        question: 'Which is a loop?',
        answers: [
          {text: 'repeat', correct: true},
          {text: 'if', correct: false},
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing experienceId', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'updateGenericLevelData',
      data: {type: 'video', videoKey: 'x'},
    });
    expect(result.success).toBe(false);
  });

  it('rejects data with no matching variant', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'updateGenericLevelData',
      experienceId: 'lb:some_video',
      data: {type: 'video'}, // missing required videoKey
    });
    expect(result.success).toBe(false);
  });

  // Same discipline as overrideLevelInstructions/overrideLevelDefinition:
  // `previous` is server-captured (AuthoringState.applyCurriculumChange),
  // never accepted from the client, so it isn't in this schema at all — a
  // client-supplied one is silently stripped by zod's object parsing.
  it('strips a client-supplied `previous`', () => {
    const result = CurriculumChangeBodySchema.safeParse({
      op: 'updateGenericLevelData',
      experienceId: 'lb:some_video',
      data: {type: 'video', videoKey: 'x'},
      previous: {type: 'video', videoKey: 'attacker-supplied-lie'},
    });
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect((result.data as Record<string, unknown>).previous).toBeUndefined();
  });
});
