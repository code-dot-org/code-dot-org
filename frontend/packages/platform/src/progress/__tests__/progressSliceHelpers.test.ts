import {describe, expect, it} from 'vitest';

import type {
  Lesson,
  UnitProgress as ApiUnitProgress,
} from '@code-dot-org/core/api/data';

import {LevelStatuses, TestResults} from '../constants';
import {
  activityCssClass,
  bestResultLevelId,
  getLevelResult,
  levelProgressFromResult,
  levelProgressFromServer,
  levelProgressFromStatus,
  mergeActivityResult,
  processedLessons,
  processServerStudentProgress,
  resultFromStatus,
} from '../redux/progressSlice';
import type {TestResult} from '../types';

describe('mergeActivityResult', () => {
  it('treats 0 as "no attempt" and returns the other value', () => {
    expect(mergeActivityResult(0 as TestResult, TestResults.ALL_PASS)).toBe(
      TestResults.ALL_PASS,
    );
    expect(mergeActivityResult(TestResults.ALL_PASS, 0 as TestResult)).toBe(
      TestResults.ALL_PASS,
    );
  });

  it('takes the numeric max when both values are non-zero', () => {
    expect(
      mergeActivityResult(TestResults.ALL_PASS, TestResults.SUBMITTED_RESULT),
    ).toBe(TestResults.SUBMITTED_RESULT);
  });

  it('preserves negative results when nothing better is available', () => {
    // -1 (NO_TESTS_RUN) is "ran but no tests"; -2 (NESTED_FOR_SAME_VARIABLE)
    // is a specific failure. Math.max(-1, -2) === -1.
    expect(
      mergeActivityResult(
        TestResults.NO_TESTS_RUN,
        TestResults.NESTED_FOR_SAME_VARIABLE,
      ),
    ).toBe(TestResults.NO_TESTS_RUN);
  });

  it('coerces falsy null/undefined inputs to 0', () => {
    // The implementation does `a = a || 0; b = b || 0;` defensively.
    expect(
      mergeActivityResult(
        undefined as unknown as TestResult,
        TestResults.ALL_PASS,
      ),
    ).toBe(TestResults.ALL_PASS);
  });
});

describe('activityCssClass', () => {
  it('returns NotTried for 0, NO_TESTS_RUN, or falsy', () => {
    expect(activityCssClass(0 as TestResult)).toBe(LevelStatuses.NotTried);
    expect(activityCssClass(TestResults.NO_TESTS_RUN)).toBe(
      LevelStatuses.NotTried,
    );
    expect(activityCssClass(undefined as unknown as TestResult)).toBe(
      LevelStatuses.NotTried,
    );
  });

  it('maps the review states by exact numeric match', () => {
    expect(activityCssClass(TestResults.REVIEW_ACCEPTED_RESULT)).toBe(
      LevelStatuses.ReviewAccepted,
    );
    expect(activityCssClass(TestResults.REVIEW_REJECTED_RESULT)).toBe(
      LevelStatuses.ReviewRejected,
    );
    expect(activityCssClass(TestResults.SUBMITTED_RESULT)).toBe(
      LevelStatuses.Submitted,
    );
  });

  it('classifies >=30 as Perfect, 20-29 as Passed, anything else as Attempted', () => {
    expect(activityCssClass(TestResults.ALL_PASS)).toBe(LevelStatuses.Perfect);
    expect(activityCssClass(TestResults.FREE_PLAY)).toBe(LevelStatuses.Perfect);
    expect(
      activityCssClass(TestResults.MISSING_RECOMMENDED_BLOCK_FINISHED),
    ).toBe(LevelStatuses.Passed);
    // GENERIC_FAIL is 0 → NotTried (covered above). 11 is APP_SPECIFIC_FAIL
    // and >0/<20 → Attempted.
    expect(activityCssClass(TestResults.APP_SPECIFIC_FAIL)).toBe(
      LevelStatuses.Attempted,
    );
  });
});

describe('resultFromStatus', () => {
  it('maps each handled status back to its representative result', () => {
    expect(resultFromStatus(LevelStatuses.ReviewAccepted)).toBe(
      TestResults.REVIEW_ACCEPTED_RESULT,
    );
    expect(resultFromStatus(LevelStatuses.ReviewRejected)).toBe(
      TestResults.REVIEW_REJECTED_RESULT,
    );
    expect(resultFromStatus(LevelStatuses.Submitted)).toBe(
      TestResults.SUBMITTED_RESULT,
    );
    expect(resultFromStatus(LevelStatuses.FreePlayComplete)).toBe(
      TestResults.FREE_PLAY,
    );
    expect(resultFromStatus(LevelStatuses.Perfect)).toBe(TestResults.ALL_PASS);
    expect(resultFromStatus(LevelStatuses.Passed)).toBe(
      20 as TestResult, // MINIMUM_PASS_RESULT
    );
  });

  it('falls back to NO_TESTS_RUN for unhandled statuses', () => {
    expect(resultFromStatus(LevelStatuses.NotTried)).toBe(
      TestResults.NO_TESTS_RUN,
    );
    expect(resultFromStatus(LevelStatuses.Attempted)).toBe(
      TestResults.NO_TESTS_RUN,
    );
  });
});

describe('getLevelResult', () => {
  it('uses the explicit result when present', () => {
    const progress = {
      status: LevelStatuses.NotTried,
      result: TestResults.ALL_PASS,
    } as ApiUnitProgress;
    expect(getLevelResult(progress)).toBe(TestResults.ALL_PASS);
  });

  it('falls back to the status-derived result when result is missing', () => {
    const progress = {
      status: LevelStatuses.Perfect,
    } as ApiUnitProgress;
    expect(getLevelResult(progress)).toBe(TestResults.ALL_PASS);
  });
});

describe('levelProgressFromStatus', () => {
  it('produces a canonical UnitProgress with sensible defaults', () => {
    const result = levelProgressFromStatus(LevelStatuses.NotTried);
    expect(result.status).toBe(LevelStatuses.NotTried);
    expect(result.result).toBe(TestResults.NO_TESTS_RUN);
    expect(result.locked).toBe(false);
    expect(result.paired).toBe(false);
  });
});

describe('levelProgressFromResult', () => {
  it('round-trips through activityCssClass + levelProgressFromStatus', () => {
    // ALL_PASS → activityCssClass returns Perfect → resultFromStatus(Perfect)
    // returns ALL_PASS. So the result number survives the round trip for
    // statuses that map back cleanly.
    const result = levelProgressFromResult(TestResults.ALL_PASS);
    expect(result.status).toBe(LevelStatuses.Perfect);
    expect(result.result).toBe(TestResults.ALL_PASS);
  });
});

describe('levelProgressFromServer', () => {
  it('pulls server fields into the canonical local shape', () => {
    // Input is the camelCase wire shape coming back from
    // `api.progress.getUserProgress`; output is the further-normalized
    // platform `UnitProgress` (with defaults + `lastTimestamp` rename).
    const server: ApiUnitProgress = {
      status: LevelStatuses.Submitted,
      result: TestResults.SUBMITTED_RESULT,
      locked: true,
      paired: true,
      timeSpent: 42,
      teacherFeedbackReviewState: 'completed',
      teacherFeedbackNew: true,
      teacherFeedbackCommented: true,
      lastProgressAt: 1234567890,
    };
    expect(levelProgressFromServer(server)).toEqual({
      status: LevelStatuses.Submitted,
      result: TestResults.SUBMITTED_RESULT,
      locked: true,
      paired: true,
      timeSpent: 42,
      teacherFeedbackReviewState: 'completed',
      teacherFeedbackNew: true,
      teacherFeedbackCommented: true,
      lastTimestamp: 1234567890,
      pages: undefined,
    });
  });

  it('expands pagesCompleted into a per-page UnitProgress when there are 2+ pages', () => {
    const server: ApiUnitProgress = {
      status: LevelStatuses.Submitted,
      pagesCompleted: [TestResults.ALL_PASS, 0 as TestResult],
      locked: true,
    };
    const out = levelProgressFromServer(server);
    expect(out.pages).toHaveLength(2);
    expect(out.pages![0].status).toBe(LevelStatuses.Perfect);
    // A 0/null page result becomes NotTried but inherits locked from parent.
    expect(out.pages![1].status).toBe(LevelStatuses.NotTried);
    expect(out.pages![1].locked).toBe(true);
  });

  it('leaves pages undefined when pagesCompleted has 0 or 1 entries', () => {
    const single: ApiUnitProgress = {
      status: LevelStatuses.Submitted,
      pagesCompleted: [TestResults.ALL_PASS],
    };
    expect(levelProgressFromServer(single).pages).toBeUndefined();
  });
});

describe('processServerStudentProgress', () => {
  it('maps each levelId through levelProgressFromServer', () => {
    const out = processServerStudentProgress({
      1: {status: LevelStatuses.Perfect} as ApiUnitProgress,
      2: {status: LevelStatuses.Submitted} as ApiUnitProgress,
    });
    expect(out[1].status).toBe(LevelStatuses.Perfect);
    expect(out[2].status).toBe(LevelStatuses.Submitted);
  });
});

describe('bestResultLevelId', () => {
  it('returns the only id when there is exactly one', () => {
    expect(bestResultLevelId([42], {42: TestResults.ALL_PASS})).toBe(42);
  });

  it('returns the first id when none have been attempted', () => {
    expect(bestResultLevelId([7, 8, 9], {})).toBe(7);
  });

  it('picks the id with the highest result among attempted', () => {
    expect(
      bestResultLevelId([1, 2, 3], {
        1: TestResults.ALL_PASS,
        2: TestResults.SUBMITTED_RESULT,
        3: TestResults.REVIEW_ACCEPTED_RESULT,
      }),
    ).toBe(3);
  });

  it('ignores unattempted ids even when other ids have results', () => {
    expect(
      bestResultLevelId([1, 2, 3], {
        // 1 unattempted, 2 attempted but lower than 3
        2: TestResults.ALL_PASS,
        3: TestResults.REVIEW_ACCEPTED_RESULT,
      }),
    ).toBe(3);
  });
});

describe('processedLessons', () => {
  // Build a partial Lesson shape — the function only reads
  // `numberedLesson` and spreads everything else through.
  const make = (
    partial: Partial<Lesson> & {numberedLesson: boolean; id: number},
  ) => partial as Lesson;

  it('assigns sequential lessonNumbers to numbered lessons when not PLC', () => {
    const out = processedLessons(
      [
        make({id: 1, numberedLesson: true}),
        make({id: 2, numberedLesson: false}),
        make({id: 3, numberedLesson: true}),
      ],
      false,
    );
    expect(out[0].lessonNumber).toBe(1);
    expect(out[1].lessonNumber).toBeUndefined();
    expect(out[2].lessonNumber).toBe(2);
  });

  it('leaves lessonNumber undefined when isPlc=true', () => {
    const out = processedLessons(
      [
        make({id: 1, numberedLesson: true}),
        make({id: 2, numberedLesson: true}),
      ],
      true,
    );
    expect(out[0].lessonNumber).toBeUndefined();
    expect(out[1].lessonNumber).toBeUndefined();
  });

  it('forces hidden to false even when the input had hidden=true', () => {
    // The function strips any inbound hidden value — every lesson in
    // a Lab2 progress view is visible.
    const out = processedLessons(
      [
        make({
          id: 1,
          numberedLesson: true,
          hidden: true,
        } as Partial<Lesson> & {numberedLesson: boolean; id: number}),
      ],
      false,
    );
    expect(out[0].hidden).toBe(false);
  });
});
