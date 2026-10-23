import * as Observability from '@code-dot-org/core/plugins/observability';

import {parseLessonSummary} from '@cdo/apps/aiTeacherDrawer/lessonSummary';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  recordError: jest.fn(),
}));

const VALID_SUMMARY = {
  learning_objective: 'Students will understand variables.',
  lesson_beats: ['Warm Up', 'Wrap Up'],
  misconceptions: ['Variables always change'],
  tips: ['Use real-world analogies'],
};

const record = (summary: unknown) => ({
  id: 7,
  lesson_id: 42,
  lesson_summary:
    typeof summary === 'string' ? summary : JSON.stringify(summary),
});

describe('parseLessonSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a well-formed summary without reporting', () => {
    expect(parseLessonSummary(record(VALID_SUMMARY))).toEqual(VALID_SUMMARY);
    expect(Observability.recordError).not.toHaveBeenCalled();
  });

  it('returns null without reporting when there is no summary', () => {
    expect(parseLessonSummary(undefined)).toBeNull();
    expect(parseLessonSummary({id: 7, lesson_id: 42})).toBeNull();
    expect(Observability.recordError).not.toHaveBeenCalled();
  });

  it('reports and rejects lesson beats stored as {name} objects', () => {
    const summary = {
      ...VALID_SUMMARY,
      lesson_beats: [{name: 'Warm Up'}, {name: 'Wrap Up'}],
    };

    expect(parseLessonSummary(record(summary))).toBeNull();
    expect(Observability.recordError).toHaveBeenCalledWith(
      expect.any(Error),
      {aiLessonSummaryId: 7, lessonId: 42, invalidFields: ['lesson_beats']},
      {feature: 'ai-lesson-summaries'}
    );
  });

  it('reports every field with the wrong type', () => {
    const summary = {
      learning_objective: {text: 'x'},
      lesson_beats: VALID_SUMMARY.lesson_beats,
      tips: 'not a list',
    };

    expect(parseLessonSummary(record(summary))).toBeNull();
    expect(Observability.recordError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        invalidFields: ['learning_objective', 'misconceptions', 'tips'],
      }),
      expect.anything()
    );
  });

  it('reports and rejects a summary that is not a JSON object', () => {
    expect(parseLessonSummary(record('["a", "b"]'))).toBeNull();
    expect(Observability.recordError).toHaveBeenLastCalledWith(
      expect.any(Error),
      expect.objectContaining({invalidFields: ['(root)']}),
      expect.anything()
    );
  });

  it('reports and rejects unparseable JSON', () => {
    expect(parseLessonSummary(record('{not json'))).toBeNull();
    expect(Observability.recordError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({invalidFields: ['(unparseable)']}),
      expect.anything()
    );
  });
});
