// As posted for the question; which field is set depends on its type.
export interface QuizResponseData {
  selectedChoiceId?: string;
  answerText?: string;
}

export interface QuizQuestionResult {
  quizQuestionId: number;
  responseData: QuizResponseData;
  correct: boolean | null;
  explanation: string | null;
  correctChoiceId: string | null;
}

export interface QuizQuestionInProgressResult {
  quizQuestionId: number;
  // Unanswered questions are omitted.
  responseData: QuizResponseData;
}

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
