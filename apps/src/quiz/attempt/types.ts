export interface QuizQuestionResult {
  quizQuestionId: number;
  selectedChoiceId: string | null;
  correct: boolean | null;
  explanation: string | null;
  correctChoiceId: string | null;
}

export interface QuizQuestionInProgressResult {
  quizQuestionId: number;
  // Unanswered questions are omitted from the map, so this is always set.
  selectedChoiceId: string;
}

// Unlocalized, like the rest of this feature so far.
export function formatSubmittedAt(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
