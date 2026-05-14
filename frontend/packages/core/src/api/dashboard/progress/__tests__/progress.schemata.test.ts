import {describe, expect, it} from 'vitest';

import {
  MilestoneReportSchema,
  OptionalMilestoneDataSchema,
  UnitProgressDefinitionSchema,
  UnitProgressSchema,
  UserProgressResponseDefinitionSchema,
  UserProgressResponseSchema,
} from '../progress.schemata';

describe('UnitProgressDefinitionSchema (wire shape)', () => {
  it('accepts the minimal canonical shape', () => {
    const out = UnitProgressDefinitionSchema.parse({status: 'perfect'});
    expect(out.status).toBe('perfect');
    // All other fields are optional — they should be absent (not coerced
    // to null/undefined slots) so server omissions stay omissions.
    expect(Object.keys(out)).toEqual(['status']);
  });

  it('threads through all optional snake_case fields verbatim', () => {
    const input = {
      status: 'submitted',
      last_progress_at: 1715600000,
      locked: true,
      pages_completed: [100, 0, 20],
      paired: false,
      result: 100,
      teacher_feedback_commented: true,
      teacher_feedback_review_state: 'completed',
      teacher_feedback_new: false,
      time_spent: 600,
    };
    expect(UnitProgressDefinitionSchema.parse(input)).toEqual(input);
  });

  it('rejects when status is missing', () => {
    expect(() => UnitProgressDefinitionSchema.parse({})).toThrow();
  });

  it('rejects pages_completed entries that are not numbers', () => {
    expect(() =>
      UnitProgressDefinitionSchema.parse({
        status: 'perfect',
        pages_completed: ['100', 0],
      }),
    ).toThrow();
  });
});

describe('UnitProgressSchema (camelCase consumer shape)', () => {
  it('renames snake_case fields to camelCase via the transform', () => {
    const out = UnitProgressSchema.parse({
      status: 'submitted',
      last_progress_at: 1715600000,
      pages_completed: [100, 0],
      teacher_feedback_commented: true,
      teacher_feedback_review_state: 'completed',
      teacher_feedback_new: false,
      time_spent: 600,
    });
    expect(out).toEqual({
      status: 'submitted',
      lastProgressAt: 1715600000,
      pagesCompleted: [100, 0],
      teacherFeedbackCommented: true,
      teacherFeedbackReviewState: 'completed',
      teacherFeedbackNew: false,
      timeSpent: 600,
    });
  });

  it('leaves single-word fields untouched', () => {
    const out = UnitProgressSchema.parse({
      status: 'perfect',
      locked: true,
      paired: false,
      result: 100,
    });
    expect(out).toEqual({
      status: 'perfect',
      locked: true,
      paired: false,
      result: 100,
    });
  });
});

describe('OptionalMilestoneDataSchema', () => {
  it('accepts an empty object', () => {
    expect(OptionalMilestoneDataSchema.parse({})).toEqual({});
  });

  it('accepts the documented optional fields', () => {
    expect(
      OptionalMilestoneDataSchema.parse({
        program: 'return 42;',
        submitted: 'true',
      }),
    ).toEqual({program: 'return 42;', submitted: 'true'});
  });

  it('rejects non-string `submitted` (server expects a stringified bool)', () => {
    expect(() =>
      OptionalMilestoneDataSchema.parse({submitted: true as unknown as string}),
    ).toThrow();
  });
});

describe('MilestoneReportSchema', () => {
  it('accepts the canonical milestone body shape', () => {
    const out = MilestoneReportSchema.parse({
      app: 'pythonlab',
      result: true,
      testResult: 100,
    });
    expect(out).toEqual({app: 'pythonlab', result: true, testResult: 100});
  });

  it('merges optional fields from OptionalMilestoneData', () => {
    const out = MilestoneReportSchema.parse({
      app: 'weblab',
      result: true,
      testResult: 30,
      program: 'console.log(1)',
      submitted: 'false',
    });
    expect(out.program).toBe('console.log(1)');
    expect(out.submitted).toBe('false');
  });

  it('rejects `result: false` — the field is a vestigial constant', () => {
    // The schema pins this to z.literal(true) so a future caller passing
    // `false` fails fast instead of silently sending bogus data.
    expect(() =>
      MilestoneReportSchema.parse({
        app: 'pythonlab',
        result: false,
        testResult: 100,
      }),
    ).toThrow();
  });

  it('rejects when required fields are missing', () => {
    expect(() =>
      MilestoneReportSchema.parse({app: 'pythonlab', result: true}),
    ).toThrow();
    expect(() =>
      MilestoneReportSchema.parse({result: true, testResult: 100}),
    ).toThrow();
  });
});

describe('UserProgressResponseDefinitionSchema (wire shape)', () => {
  it('accepts an empty object (new user, no progress yet)', () => {
    expect(UserProgressResponseDefinitionSchema.parse({})).toEqual({});
  });

  it('rejects malformed progress entries', () => {
    expect(() =>
      UserProgressResponseDefinitionSchema.parse({
        progress: {100: {/* missing status */ result: 100}},
      }),
    ).toThrow();
  });
});

describe('UserProgressResponseSchema (camelCase consumer shape)', () => {
  it('accepts an empty object (new user, no progress yet)', () => {
    expect(UserProgressResponseSchema.parse({})).toEqual({});
  });

  it('renames top-level current_lesson to currentLesson', () => {
    const out = UserProgressResponseSchema.parse({current_lesson: 7});
    expect(out).toEqual({currentLesson: 7});
  });

  it('passes already-camelCase top-level fields through unchanged', () => {
    const input = {
      isInstructor: true,
      teacherViewingStudent: false,
      deeperLearningCourse: false,
      focusAreaLessonIds: [1, 2],
      changeFocusAreaPath: '/path',
      completed: false,
    };
    expect(UserProgressResponseSchema.parse(input)).toEqual(input);
  });

  it('recursively converts snake_case fields inside the progress map', () => {
    const out = UserProgressResponseSchema.parse({
      progress: {
        100: {
          status: 'perfect',
          result: 100,
          time_spent: 30,
          last_progress_at: 1715600000,
          teacher_feedback_review_state: 'completed',
        },
      },
    });
    expect(out.progress?.[100]).toEqual({
      status: 'perfect',
      result: 100,
      timeSpent: 30,
      lastProgressAt: 1715600000,
      teacherFeedbackReviewState: 'completed',
    });
  });

  it('preserves the peer-review summary shape (already camelCase)', () => {
    const input = {
      peerReviewsPerformed: [
        {
          status: 'review_complete',
          name: 'Alex',
          result: 'accepted',
          icon: 'check',
          locked: false,
        },
      ],
    };
    expect(UserProgressResponseSchema.parse(input)).toEqual(input);
  });

  it('rejects malformed progress entries (validation runs before transform)', () => {
    expect(() =>
      UserProgressResponseSchema.parse({
        progress: {100: {/* missing status */ result: 100}},
      }),
    ).toThrow();
  });
});
