export interface QuizQuestionResult {
  quizQuestionId: number;
  selectedChoiceId: string | null;
  correct: boolean | null;
  explanation?: string;
  correctChoiceId?: string;
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
}
