import {QuizPage, QuizQuestionItem, QuizQuestionType} from '../types';

// A subset of the Ruby Standard#summarize_for_lesson_edit payload - the
// fields the builder reads today. The rest ride along untyped.
export interface StandardSummary {
  frameworkShortcode: string;
  shortcode: string;
  description: string;
}

// The fields every question type shares, editable in any question's card.
interface QuizQuestionSharedFields {
  questionName: string;
  questionTitle: string;
  description: string | null;
  explanation: string | null;
}

// The server's shapes for the choice types; a card edits either as a
// ChoiceQuestionDraft.
export interface MultipleChoiceFields extends QuizQuestionSharedFields {
  type: 'MultipleChoiceQuestion';
  choices: QuizQuestionItem[];
  correctChoiceId: string | null;
}

export interface MultipleSelectFields extends QuizQuestionSharedFields {
  type: 'MultipleSelectQuestion';
  choices: QuizQuestionItem[];
  correctChoiceIds: string[];
}

// Both choice types keep their correct ids in one list, so switching type
// only changes `type`. Multiple choice holds at most one id.
export interface ChoiceQuestionDraft extends QuizQuestionSharedFields {
  type: 'MultipleChoiceQuestion' | 'MultipleSelectQuestion';
  choices: QuizQuestionItem[];
  correctChoiceIds: string[];
}

export interface FreeResponseDraft extends QuizQuestionSharedFields {
  type: 'FreeResponseQuestion';
}

export interface MatchPair {
  id: string;
  items: [QuizQuestionItem, QuizQuestionItem];
}

export interface MatchDraft extends QuizQuestionSharedFields {
  type: 'MatchQuestion';
  pairs: MatchPair[];
}

// A question's type-specific fields as the server sends and receives them.
export type QuizQuestionPayload =
  | MultipleChoiceFields
  | MultipleSelectFields
  | FreeResponseDraft
  | MatchDraft;

// A question card's unsaved working copy.
export type QuizQuestionDraft =
  | ChoiceQuestionDraft
  | FreeResponseDraft
  | MatchDraft;

export function isChoiceQuestionDraft(
  draft: QuizQuestionDraft
): draft is ChoiceQuestionDraft {
  return (
    draft.type === 'MultipleChoiceQuestion' ||
    draft.type === 'MultipleSelectQuestion'
  );
}

export function isMultipleSelectDraft(draft: QuizQuestionDraft): boolean {
  return draft.type === 'MultipleSelectQuestion';
}

export function isMatchDraft(draft: QuizQuestionDraft): draft is MatchDraft {
  return draft.type === 'MatchQuestion';
}

// A question as QuizQuestionSerialization#quiz_question_json returns it,
// without its page.
export type QuizBuilderQuestion = QuizQuestionPayload & {
  id: number;
  // TODO: move to QuizQuestionSharedFields when we allow editing standards.
  standards: StandardSummary[];
  attachedToOtherQuizzes: boolean;
  // No other quiz uses it and no student has answered it, so removing it
  // from this quiz may delete it.
  deletable: boolean;
  usedInPublishedUnit: boolean;
};

// A negative id marks a question that has been added locally
// and hasn't posted to the server yet - real ids are
// database-assigned and always positive.
export function isPendingQuestionId(id: number): boolean {
  return id < 0;
}

// One question's spot on the quiz, as PUT quiz_configuration takes and returns it.
export interface QuizPlacement {
  quizQuestionId: number;
  page: number;
  position: number;
}

// A page of the quiz being built, {page, questions}, with its list of questions
// in order; empty until a question is added.
export type QuizBuilderPage = QuizPage<QuizBuilderQuestion>;

// A quiz's configuration, as the builder edits it and Save quiz sends it.
export interface QuizConfigurationData {
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  showCorrectness: boolean;
  revealAnswerExplanation: boolean;
  showIntroScreen: boolean;
  purpose?: string;
  allowMultipleAttempts: boolean;
  showQuestionsAfterSubmit: boolean;
}

// What useQuizBuilderQuestions exposes.
export interface QuizBuilderQuestionsState {
  // Every question on the quiz, in page order.
  questions: QuizBuilderQuestion[];
  pages: QuizBuilderPage[];
  isLoading: boolean;
  // Whether the questions and layout have loaded; until then there is
  // nothing for Save quiz to save against.
  hasLoaded: boolean;
  isSavingQuiz: boolean;
  error: string | null;
  // The question `error` is about, or null for a general error (a failed
  // load or quiz save). A caller uses this to show the error on that
  // question's card instead of globally.
  errorQuestionId: number | null;
  // Whether the quiz's questions, pages or order differ from the last save.
  hasUnsavedLayout: boolean;
  // Adds an empty page at the end.
  addPage: () => void;
  // Moves a question one place up (-1) or down (1) on its page.
  moveQuestion: (id: number, offset: -1 | 1) => void;
  // Moves a question to the bottom of another page.
  moveQuestionToPage: (id: number, page: number) => void;
  // Adds a placeholder question to local state only, on the given page.
  addPendingQuestion: (page: number, type: QuizQuestionType) => number;
  // Resolves with the saved question's id on success. For a pending
  // question this is its first save, which creates it server-side and
  // replaces the negative id with the real one; otherwise it's a normal
  // update, which may itself resolve with a different id (see
  // useQuizBuilderQuestions for why). On failure, resolves undefined (with
  // `error` set) and leaves `questions` untouched, so a caller can keep
  // showing the user's unsaved edits.
  saveQuestion: (
    id: number,
    payload: QuizQuestionPayload
  ) => Promise<number | undefined>;
  // Takes the question off the quiz in local state. On the next saveQuiz it
  // comes off the quiz but stays in the question bank, or with permanently,
  // is deleted unless another quiz uses it or a student has answered it.
  removeQuestion: (
    id: number,
    options: {permanently: boolean}
  ) => Promise<boolean>;
  // Saves the quiz's questions, pages and order, with the given configuration
  // fields. Resolves false on failure, with `error` set, including when the
  // quiz changed since it loaded.
  saveQuiz: (config?: Partial<QuizConfigurationData>) => Promise<boolean>;
  load: () => Promise<void>;
}
