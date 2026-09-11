// Per-response review data, present only once the attempt is submitted -
// see QuizAttempt#question_results. correct/explanation/correctChoiceId
// stay null/absent until the quiz's show_correctness/reveal_answer_
// explanation settings allow them.
export interface QuizQuestionResult {
  quizQuestionId: number;
  selectedChoiceId: string | null;
  correct: boolean | null;
  explanation?: string;
  correctChoiceId?: string;
}

// Mirrors QuizAttemptsController#quiz_attempt_json.
export interface QuizAttemptData {
  id: number;
  attemptNumber: number;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  // null when the quiz has no time limit - see QuizAttempt#expires_at.
  expiresAt: string | null;
  // Whether POSTing to /quiz_attempts again would start a new attempt
  // rather than just returning this one.
  canRetake: boolean;
  // Present only once submitted.
  questionResults?: QuizQuestionResult[];
}
