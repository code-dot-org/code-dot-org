import {describe, it, expect} from 'vitest';

import {
  draftCourseId,
  draftExperienceId,
  draftLessonId,
  draftUnitId,
} from '../api';

// Mirrors the server's draftId(prefix) convention (ClaudeAgentRunner) —
// `draft-<prefix>-<8 hex chars>` — so a manually created course/unit/lesson
// carries an id shaped exactly like one the AI would have minted.
describe('draft id helpers', () => {
  it.each([
    ['draftCourseId', draftCourseId, 'course'],
    ['draftUnitId', draftUnitId, 'unit'],
    ['draftLessonId', draftLessonId, 'lesson'],
    ['draftExperienceId', draftExperienceId, 'exp'],
  ] as const)('%s produces draft-%s-<8 hex chars>', (_name, fn, prefix) => {
    expect(fn()).toMatch(new RegExp(`^draft-${prefix}-[0-9a-f]{8}$`));
  });

  it('generates a distinct id on each call', () => {
    expect(draftCourseId()).not.toBe(draftCourseId());
  });
});
