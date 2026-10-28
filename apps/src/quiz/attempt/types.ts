// responseData is what was posted for the question. Its fields are
// optional because a skipped question is saved as {}.
export interface MultipleChoiceQuestionResponse {
  questionType: 'MultipleChoiceQuestion';
  responseData: {selectedChoiceId?: string};
}

export interface MultipleSelectQuestionResponse {
  questionType: 'MultipleSelectQuestion';
  responseData: {selectedChoiceIds?: string[]};
}

export interface FreeResponseQuestionResponse {
  questionType: 'FreeResponseQuestion';
  responseData: {answerText?: string};
}

// Each pair is two item ids, one from each set, in either order.
export interface MatchQuestionResponse {
  questionType: 'MatchQuestion';
  responseData: {pairs?: [string, string][]};
}

// Narrow with the type guards below to read responseData.
export type QuizQuestionResponse =
  | MultipleChoiceQuestionResponse
  | MultipleSelectQuestionResponse
  | FreeResponseQuestionResponse
  | MatchQuestionResponse;

export type QuizQuestionResponseData = QuizQuestionResponse['responseData'];

export function isMultipleChoiceResponse(
  response: QuizQuestionResponse
): response is MultipleChoiceQuestionResponse {
  return response.questionType === 'MultipleChoiceQuestion';
}

export function isMultipleSelectResponse(
  response: QuizQuestionResponse
): response is MultipleSelectQuestionResponse {
  return response.questionType === 'MultipleSelectQuestion';
}

export function isFreeResponseResponse(
  response: QuizQuestionResponse
): response is FreeResponseQuestionResponse {
  return response.questionType === 'FreeResponseQuestion';
}

export function isMatchResponse(
  response: QuizQuestionResponse
): response is MatchQuestionResponse {
  return response.questionType === 'MatchQuestion';
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
