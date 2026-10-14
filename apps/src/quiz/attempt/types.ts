export interface QuizQuestionResult {
  quizQuestionId: number;
  selectedChoiceId: string | null;
  answerText: string | null;
  correct: boolean | null;
  explanation: string | null;
  correctChoiceId: string | null;
}

export interface QuizQuestionInProgressResult {
  quizQuestionId: number;
  // Unanswered questions are omitted;
  selectedChoiceId: string | null; // MultipleChoiceQuestion
  answerText: string | null; // FreeResponseQuestion
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
