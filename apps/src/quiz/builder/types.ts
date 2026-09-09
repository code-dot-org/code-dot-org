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

// What useQuizBuilderQuestions exposes, and what QuizBuilderWorkspace
// takes as props.
export interface QuizBuilderQuestionsState {
  questions: QuizBuilderQuestion[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  createQuestion: () => Promise<void>;
  load: () => Promise<void>;
}
