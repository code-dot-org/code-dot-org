// responseData is what was posted for the question. Its fields are
// optional because a skipped question is saved as {}.
export interface MultipleChoiceQuestionResponse {
  questionType: 'MultipleChoiceQuestion';
  responseData: {selectedChoiceId?: string};
}

export interface FreeResponseQuestionResponse {
  questionType: 'FreeResponseQuestion';
  responseData: {answerText?: string};
}

// Narrow with the type guards below to read responseData.
export type QuizQuestionResponse =
  | MultipleChoiceQuestionResponse
  | FreeResponseQuestionResponse;

export function isMultipleChoiceResponse(
  response: QuizQuestionResponse
): response is MultipleChoiceQuestionResponse {
  return response.questionType === 'MultipleChoiceQuestion';
}

export function isFreeResponseResponse(
  response: QuizQuestionResponse
): response is FreeResponseQuestionResponse {
  return response.questionType === 'FreeResponseQuestion';
}

export type QuizQuestionResult = QuizQuestionResponse & {
  quizQuestionId: number;
  correct: boolean | null;
  explanation: string | null;
  correctChoiceId: string | null;
};

// Unanswered questions are omitted.
export type QuizQuestionInProgressResult = QuizQuestionResponse & {
  quizQuestionId: number;
};

export interface QuizAttemptData {
  id: number;
  attemptNumber: number;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  // null when the quiz has no time limit.
  expiresAt: string | null;
  canRetake: boolean;
  // Present only once submitted.
  questionResults?: QuizQuestionResult[];
  // Present only while the attempt is in progress.
  questionResultsInProgress?: QuizQuestionInProgressResult[];
}
