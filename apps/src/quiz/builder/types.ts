export interface QuizQuestionChoice {
  id: string;
  text: string;
}

// A subset of the Ruby Standard#summarize_for_lesson_edit payload - the
// fields the builder reads today. The rest ride along untyped.
export interface StandardSummary {
  frameworkShortcode: string;
  shortcode: string;
  description: string;
}

// Mirrors the QuizQuestion model. `type` is the STI class name;
// MultipleChoiceQuestion is the only one so far.
export interface QuizQuestion {
  id: number;
  type: string;
  questionName: string;
  stem: string;
  choices: QuizQuestionChoice[];
  correctChoiceId: string | null;
  explanation: string | null;
  standards: StandardSummary[];
}

// A QuizQuestion as the builder endpoints return it (GET /levels/:id/
// quiz_configuration and a placement create): the question plus the
// placement and cross-quiz usage context that
// QuizQuestionSerialization#quiz_question_json adds.
export interface QuizBuilderQuestion extends QuizQuestion {
  attachedToOtherQuizzes: boolean;
  usedInPublishedUnit: boolean;
  page: number | null;
}

// The fields a per-question editor can change.
export interface QuizQuestionEditableFields {
  questionName: string;
  stem: string;
  choices: QuizQuestionChoice[];
  correctChoiceId: string | null;
  explanation: string | null;
}

// What useQuizBuilderQuestions exposes.
export interface QuizBuilderQuestionsState {
  questions: QuizBuilderQuestion[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
  // Resolves with the created question's id on success, undefined on
  // failure (with `error` set).
  createQuestion: () => Promise<number | undefined>;
  // Resolves with the saved question's id on success (see
  // useQuizBuilderQuestions for why it may differ from `id`). On
  // failure, resolves undefined (with `error` set) and leaves
  // `questions` untouched, so a caller can keep showing the user's
  // unsaved edits.
  updateQuestion: (
    id: number,
    payload: QuizQuestionEditableFields
  ) => Promise<number | undefined>;
  removeQuestion: (id: number) => Promise<boolean>;
  load: () => Promise<void>;
}
