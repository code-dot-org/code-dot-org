import * as Observability from '@code-dot-org/core/plugins/observability';

export interface LessonSummaryInfo {
  learning_objective: string;
  lesson_beats: string[];
  misconceptions: string[];
  tips: string[];
}

// The AiLessonSummary record as returned by /ai_lesson_summaries/show.
export interface AiLessonSummaryResponse {
  id?: number;
  lesson_id?: number;
  lesson_summary?: string;
  script?: string;
}

const STRING_LIST_FIELDS = ['lesson_beats', 'misconceptions', 'tips'] as const;

const findInvalidFields = (data: unknown): string[] => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return ['(root)'];
  }
  const summary = data as Record<string, unknown>;
  const invalid: string[] = [];
  if (typeof summary.learning_objective !== 'string') {
    invalid.push('learning_objective');
  }
  STRING_LIST_FIELDS.forEach(field => {
    const value = summary[field];
    if (
      !Array.isArray(value) ||
      !value.every(item => typeof item === 'string')
    ) {
      invalid.push(field);
    }
  });
  return invalid;
};

export const parseLessonSummary = (
  record: AiLessonSummaryResponse | undefined
): LessonSummaryInfo | null => {
  if (!record?.lesson_summary) {
    return null;
  }

  let data: unknown;
  let invalidFields: string[];
  try {
    data = JSON.parse(record.lesson_summary);
    invalidFields = findInvalidFields(data);
  } catch {
    invalidFields = ['(unparseable)'];
  }

  // Model output is not schema-enforced; lesson_beats has arrived as [{name}].
  if (invalidFields.length > 0) {
    Observability.recordError(
      new Error('Malformed AI lesson summary'),
      {
        aiLessonSummaryId: record.id,
        lessonId: record.lesson_id,
        invalidFields,
      },
      {feature: 'ai-lesson-summaries'}
    );
    return null;
  }

  return data as LessonSummaryInfo;
};
