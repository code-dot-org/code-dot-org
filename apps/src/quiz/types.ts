import {LevelProperties} from '@cdo/apps/lab2/types';

export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MULTIPLE_SELECT: 'multiple_select',
  FREE_RESPONSE: 'free_response',
  MATCHING: 'matching',
  ORDERING: 'ordering',
  CATEGORIZATION: 'categorization',
  FILL_IN_THE_BLANK: 'fill_in_the_blank',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// Grouped for UI purposes (e.g. the question-type picker) — keep separate as
// distinct types everywhere else so TypeScript can narrow answer_choices.
export const DRAG_AND_DROP_TYPES = [
  QUESTION_TYPE.MATCHING,
  QUESTION_TYPE.ORDERING,
  QUESTION_TYPE.CATEGORIZATION,
] as const;

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

// Always sort ascending before storing — order carries no meaning.
// Enables reliable equality checks: JSON.stringify(a) === JSON.stringify(b).
export type SortedStringSet = string[];

export interface TextOption {
  id: string;
  text: string;
}

export interface MultipleChoiceAnswerChoices {
  options: TextOption[];
  correct: string;
}

export interface MultipleSelectAnswerChoices {
  options: TextOption[];
  correct: SortedStringSet;
}

// correct is optional — ungraded free-response omits it
export interface FreeResponseAnswerChoices {
  exemplar?: string;
  min_length?: number;
  correct?: never;
}

export interface MatchingAnswerChoices {
  terms: TextOption[];
  definitions: TextOption[];
  correct: Record<string, string>; // term id → definition id
}

export interface OrderingBlock extends TextOption {
  distractor?: boolean; // present in block bank but not part of the solution
}

export interface OrderingAnswerChoices {
  blocks: OrderingBlock[];
  correct: string[]; // ordered block ids, excludes distractors
}

export interface CategorizationAnswerChoices {
  buckets: Array<{id: string; label: string}>;
  items: TextOption[];
  correct: Record<string, string[]>; // bucket id → item ids
}

// passage uses {{blank}} markers inline; correct is parallel array, one per blank
export interface FillInTheBlankAnswerChoices {
  passage: string;
  correct: string[];
}

interface QuizQuestionBase {
  id: number;
  question_key: string; // stable UUID shared across all versions of a question
  parent_id?: number; // id of the prior version, if this is a revision
  prompt: string;
  explanation?: string;
}

export type MultipleChoiceQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.MULTIPLE_CHOICE;
  answer_choices: MultipleChoiceAnswerChoices;
};

export type MultipleSelectQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.MULTIPLE_SELECT;
  answer_choices: MultipleSelectAnswerChoices;
};

export type FreeResponseQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.FREE_RESPONSE;
  answer_choices: FreeResponseAnswerChoices;
};

export type MatchingQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.MATCHING;
  answer_choices: MatchingAnswerChoices;
};

export type OrderingQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.ORDERING;
  answer_choices: OrderingAnswerChoices;
};

export type CategorizationQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.CATEGORIZATION;
  answer_choices: CategorizationAnswerChoices;
};

export type FillInTheBlankQuestion = QuizQuestionBase & {
  question_type: typeof QUESTION_TYPE.FILL_IN_THE_BLANK;
  answer_choices: FillInTheBlankAnswerChoices;
};

export type QuizQuestion =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | FreeResponseQuestion
  | MatchingQuestion
  | OrderingQuestion
  | CategorizationQuestion
  | FillInTheBlankQuestion;

// ---------------------------------------------------------------------------
// Level properties (stored in Level#properties on the Rails side)
// ---------------------------------------------------------------------------

export interface QuizLevelProperties extends LevelProperties {
  time_limit_minutes?: number;
  allowed_attempts?: number;
  reveal_answers?: boolean;
}

// ---------------------------------------------------------------------------
// Attempt state (frontend representation of QuizAttempt)
// ---------------------------------------------------------------------------

// question_permutation and answer_permutation record the exact ordering shown
// to this student, so we can reconstruct what they saw — not just whether
// their quiz was shuffled.
export interface QuizAttemptState {
  id: number;
  attempt_number: number;
  question_permutation: number[]; // ordered quiz_question ids as shown
  answer_permutation: Record<number, string[]>; // question id → ordered option ids
  started_at: string;
  submitted_at?: string;
  score?: number;
  max_score?: number;
}

// ---------------------------------------------------------------------------
// Student response (frontend representation of QuizQuestionResponse)
// ---------------------------------------------------------------------------

export interface QuizQuestionResponseState {
  quiz_question_id: number;
  response_data: QuestionResponseData;
  is_correct?: boolean;
  time_spent_seconds?: number;
}

// response_data shape mirrors the question_type discriminator
export type QuestionResponseData =
  | {question_type: typeof QUESTION_TYPE.MULTIPLE_CHOICE; selected: string}
  | {
      question_type: typeof QUESTION_TYPE.MULTIPLE_SELECT;
      selected: SortedStringSet;
    }
  | {question_type: typeof QUESTION_TYPE.FREE_RESPONSE; text: string}
  | {
      question_type: typeof QUESTION_TYPE.MATCHING;
      pairs: Record<string, string>;
    }
  | {question_type: typeof QUESTION_TYPE.ORDERING; order: string[]}
  | {
      question_type: typeof QUESTION_TYPE.CATEGORIZATION;
      placement: Record<string, string[]>;
    }
  | {question_type: typeof QUESTION_TYPE.FILL_IN_THE_BLANK; answers: string[]};

// ---------------------------------------------------------------------------
// Examples — one per question type
// ---------------------------------------------------------------------------

export const EXAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question_key: 'a1b2c3d4-0001-0000-0000-000000000000',
    question_type: QUESTION_TYPE.MULTIPLE_CHOICE,
    prompt: 'Which of the following is a loop structure?',
    answer_choices: {
      options: [
        {id: 'a', text: 'if/else'},
        {id: 'b', text: 'for loop'},
        {id: 'c', text: 'function'},
        {id: 'd', text: 'variable'},
      ],
      correct: 'b',
    },
    explanation: 'A for loop repeats a block of code a set number of times.',
  },
  {
    id: 2,
    question_key: 'a1b2c3d4-0002-0000-0000-000000000000',
    question_type: QUESTION_TYPE.MULTIPLE_SELECT,
    prompt:
      'Which of the following are loop structures? Select all that apply.',
    answer_choices: {
      options: [
        {id: 'a', text: 'if/else'},
        {id: 'b', text: 'for loop'},
        {id: 'c', text: 'while loop'},
        {id: 'd', text: 'function'},
      ],
      correct: ['b', 'c'],
    },
  },
  {
    id: 3,
    question_key: 'a1b2c3d4-0003-0000-0000-000000000000',
    question_type: QUESTION_TYPE.FREE_RESPONSE,
    prompt: 'Explain what a loop is in your own words.',
    answer_choices: {
      exemplar: 'A loop repeats a block of code until a condition is met.',
      min_length: 20,
    },
  },
  {
    id: 4,
    question_key: 'a1b2c3d4-0004-0000-0000-000000000000',
    question_type: QUESTION_TYPE.MATCHING,
    prompt: 'Match each term to its definition.',
    answer_choices: {
      terms: [
        {id: 't1', text: 'Loop'},
        {id: 't2', text: 'Variable'},
        {id: 't3', text: 'Function'},
      ],
      definitions: [
        {id: 'd1', text: 'Repeats a block of code'},
        {id: 'd2', text: 'Stores a value'},
        {id: 'd3', text: 'A named, reusable block of code'},
      ],
      correct: {t1: 'd1', t2: 'd2', t3: 'd3'},
    },
  },
  {
    id: 5,
    question_key: 'a1b2c3d4-0005-0000-0000-000000000000',
    question_type: QUESTION_TYPE.ORDERING,
    prompt: 'Arrange these steps in the correct order.',
    answer_choices: {
      blocks: [
        {id: 'b1', text: 'Declare the variable'},
        {id: 'b2', text: 'Assign a value'},
        {id: 'b3', text: 'Print the variable'},
        {id: 'b4', text: 'Import the library', distractor: true},
      ],
      correct: ['b1', 'b2', 'b3'],
    },
  },
  {
    id: 6,
    question_key: 'a1b2c3d4-0006-0000-0000-000000000000',
    question_type: QUESTION_TYPE.CATEGORIZATION,
    prompt: 'Sort each item into the correct category.',
    answer_choices: {
      buckets: [
        {id: 'bk1', label: 'Input'},
        {id: 'bk2', label: 'Output'},
      ],
      items: [
        {id: 'i1', text: 'Keyboard'},
        {id: 'i2', text: 'Monitor'},
        {id: 'i3', text: 'Mouse'},
        {id: 'i4', text: 'Speaker'},
      ],
      correct: {bk1: ['i1', 'i3'], bk2: ['i2', 'i4']},
    },
  },
  {
    id: 7,
    question_key: 'a1b2c3d4-0007-0000-0000-000000000000',
    question_type: QUESTION_TYPE.FILL_IN_THE_BLANK,
    prompt: 'Complete the sentence.',
    answer_choices: {
      passage:
        'A {{blank}} repeats a block of code, while a {{blank}} stores a value.',
      correct: ['loop', 'variable'],
    },
  },
];
