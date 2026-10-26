import {describe, expect, it} from 'vitest';

import {LessonGroupSchema} from '../courses.schemata';

describe('LessonGroupSchema', () => {
  it('parses a LessonGroup#summarize and camelcases it', () => {
    expect(
      LessonGroupSchema.parse({
        id: 7,
        key: 'lg-1',
        display_name: 'Getting Started',
        description: null,
        big_questions: 'Why?',
        user_facing: true,
        position: 1,
      }),
    ).toEqual({
      id: 7,
      key: 'lg-1',
      displayName: 'Getting Started',
      description: null,
      bigQuestions: 'Why?',
      userFacing: true,
      position: 1,
    });
  });
});
