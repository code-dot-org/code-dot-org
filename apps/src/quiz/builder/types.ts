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

// A negative id marks a question that has been added locally
// and hasn't posted to the server yet - real ids are
// database-assigned and always positive.
export function isPendingQuestionId(id: number): boolean {
  return id < 0;
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
  error: string | null;
  // The question `error` is about, or null for a load failure - general,
  // not about any existing question. A caller uses this to show the error
  // on that question's card instead of globally.
  errorQuestionId: number | null;
  // Adds a placeholder question to local state only.
  addPendingQuestion: () => number;
  // Resolves with the saved question's id on success. For a pending
  // question this is its first save, which creates it server-side and
  // replaces the negative id with the real one; otherwise it's a normal
  // update, which may itself resolve with a different id (see
  // useQuizBuilderQuestions for why). On failure, resolves undefined (with
  // `error` set) and leaves `questions` untouched, so a caller can keep
  // showing the user's unsaved edits.
  saveQuestion: (
    id: number,
    payload: QuizQuestionEditableFields
  ) => Promise<number | undefined>;
  // For a pending question, just drops it from local state. Otherwise
  // detaches it from the quiz server-side first.
  removeQuestion: (id: number) => Promise<boolean>;
  load: () => Promise<void>;
}
