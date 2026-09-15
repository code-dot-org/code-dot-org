// Persistence for a student's question answers ("inputs") in an AI
// Lesson, keyed (server-side) by the lesson id and the signed-in user.
// Stored as one JSON map per (lesson, user) at
// `dashboard/tmp/ai_lessons/inputs/<lessonId>/<userId>.json`.
//
// Every answer — graded or not — is recorded here.  This map is the
// personalization substrate: it feeds the tutor's STUDENT CONTEXT
// section, starter-code generation, and (later) the adaptive resolver's
// recommendations.  Records denormalize the question prompt so consumers
// don't need the lesson JSON to make sense of an answer, and so answers
// survive lesson edits.

import HttpClient from '@cdo/apps/util/HttpClient';

export interface AnswerRecord {
  questionId: string;
  stepId: string;
  // The question prompt at the time of answering.
  prompt: string;
  // Human-readable answer: free text, the chosen option label(s), or the
  // scale value as text.  What the tutor sees.
  answer: string;
  // Structured forms, by question type.
  optionId?: string;
  optionIds?: string[];
  value?: number;
  // 'accepted' = recorded, nothing to grade.  'correct'/'incorrect' =
  // graded (against the option key, or by the tutor for
  // validation: 'tutor' free responses).  'kept'/'undone' = the
  // resolution of an AI build prompt.  The latest record wins;
  // `attempts` counts submissions of this question.
  outcome?: 'accepted' | 'correct' | 'incorrect' | 'kept' | 'undone';
  attempts?: number;
  // For AI build prompts: the files the build changed.
  changedFiles?: string[];
  at: string;
}

// questionId -> latest answer record.
export type StudentInputs = {[questionId: string]: AnswerRecord};

function inputsUrl(lessonId: string): string {
  return `/ai_lessons/${encodeURIComponent(lessonId)}/inputs`;
}

export async function loadInputs(lessonId: string): Promise<StudentInputs> {
  try {
    const response = await HttpClient.get(inputsUrl(lessonId));
    return (await response.json()) as StudentInputs;
  } catch {
    return {};
  }
}

// Merge one answer into the map and persist the whole map.  Returns the
// merged map so the caller can keep its state in sync; the PUT failing is
// logged and swallowed (losing a hackathon answer isn't fatal — the
// merged map is still returned for in-session use).
export async function saveAnswer(
  lessonId: string,
  inputs: StudentInputs,
  record: AnswerRecord
): Promise<StudentInputs> {
  const merged: StudentInputs = {...inputs, [record.questionId]: record};
  try {
    await HttpClient.put(inputsUrl(lessonId), JSON.stringify(merged), true, {
      'Content-Type': 'application/json',
    });
  } catch (e) {
    console.warn('Failed to persist student inputs', e);
  }
  return merged;
}
