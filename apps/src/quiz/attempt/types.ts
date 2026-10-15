// Response data is what was posted for the question. Its fields are
// optional because a skipped question is saved as {}.
export interface MultipleChoiceResponseData {
  selectedChoiceId?: string;
}

export interface FreeResponseResponseData {
  answerText?: string;
}

// Switch on questionType to narrow responseData.
export type QuizQuestionResponse =
  | {
      questionType: 'MultipleChoiceQuestion';
      responseData: MultipleChoiceResponseData;
    }
  | {
      questionType: 'FreeResponseQuestion';
      responseData: FreeResponseResponseData;
    };

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
