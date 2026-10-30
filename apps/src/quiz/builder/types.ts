import {QuizQuestionItem, QuizQuestionType} from '../types';

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

// A question as the builder endpoints return it (GET /levels/:id/
// quiz_configuration and a placement create): the QuizQuestion model's
// fields plus the placement and cross-quiz usage context that
// QuizQuestionSerialization#quiz_question_json adds.
export type QuizBuilderQuestion = QuizQuestionPayload & {
  id: number;
  // TODO: move to QuizQuestionSharedFields when we allow editing standards.
  standards: StandardSummary[];
  attachedToOtherQuizzes: boolean;
  usedInPublishedUnit: boolean;
  page: number | null;
};

// A negative id marks a question that has been added locally
// and hasn't posted to the server yet - real ids are
// database-assigned and always positive.
export function isPendingQuestionId(id: number): boolean {
  return id < 0;
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
  // For a pending question, just drops it from local state. Otherwise
  // detaches it from the quiz server-side first.
  removeQuestion: (id: number) => Promise<boolean>;
  load: () => Promise<void>;
}
