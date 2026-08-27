import {describe, expect, it} from 'vitest';

import type {CurriculumChange} from '@code-dot-org/authoring';

import {buildRevertChangeBody} from '../revert';

const stamp = {seq: 1, at: '2026-08-26T00:00:00.000Z', actor: 'author'} as const;

describe('buildRevertChangeBody', () => {
  it('reverts insertExperience with removeExperience for the inserted id', () => {
    const change: CurriculumChange = {
      ...stamp,
      op: 'insertExperience',
      lessonId: 'lesson-1',
      position: 0,
      experience: {id: 'draft-exp-1', origin: 'draft', kind: 'content', markdown: 'hi'},
    };
    expect(buildRevertChangeBody(change)).toEqual({
      op: 'removeExperience',
      lessonId: 'lesson-1',
      experienceId: 'draft-exp-1',
    });
  });

  it('reverts createLevel with removeExperience for the level experience id', () => {
    const change: CurriculumChange = {
      ...stamp,
      op: 'createLevel',
      lessonId: 'lesson-1',
      position: 0,
      level: {
        id: 'draft-exp-2',
        origin: 'draft',
        kind: 'existingLevel',
        levelKey: 'draft:draft-level-2',
        levelType: 'Maze',
        runtime: 'labhost',
        labKey: 'maze',
        levelNumericId: 9,
      },
    };
    expect(buildRevertChangeBody(change)).toEqual({
      op: 'removeExperience',
      lessonId: 'lesson-1',
      experienceId: 'draft-exp-2',
    });
  });

  it('reverts attachExistingLevel with removeExperience for the deterministic lb: id', () => {
    const change: CurriculumChange = {
      ...stamp,
      op: 'attachExistingLevel',
      lessonId: 'lesson-1',
      levelKey: 'Oceans_FishVTrash_2024',
      position: 2,
    };
    expect(buildRevertChangeBody(change)).toEqual({
      op: 'removeExperience',
      lessonId: 'lesson-1',
      experienceId: 'lb:Oceans_FishVTrash_2024',
    });
  });

  it('reverts overrideLevelInstructions by re-applying the captured previous value', () => {
    const change: CurriculumChange = {
      ...stamp,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      patch: {shortInstructions: 'Reworded.'},
      previous: {shortInstructions: 'Original.'},
    };
    expect(buildRevertChangeBody(change)).toEqual({
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      patch: {shortInstructions: 'Original.'},
    });
  });

  it('does not offer a revert for overrideLevelInstructions with no captured previous', () => {
    const change: CurriculumChange = {
      ...stamp,
      op: 'overrideLevelInstructions',
      experienceId: 'lb:some_maze_level',
      patch: {shortInstructions: 'Reworded.'},
    };
    expect(buildRevertChangeBody(change)).toBeUndefined();
  });

  it.each([
    'createCourse',
    'removeCourse',
    'createUnit',
    'createLesson',
    'updateUnit',
    'updateLesson',
    'removeExperience',
    'moveExperience',
    'updateContent',
    'createWidget',
    'updateWidgetMetadata',
    'updateLevel',
  ] as const)('does not offer a revert for %s', op => {
    const change = {...stamp, op} as unknown as CurriculumChange;
    expect(buildRevertChangeBody(change)).toBeUndefined();
  });
});
