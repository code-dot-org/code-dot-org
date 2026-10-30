import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {ExtraTab} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/types';

export interface QuizViewContent {
  resourcePanelProps: {
    extraTabs?: ExtraTab[];
  };
  workspaceContent: React.ReactNode;
}

// STI class names; must match QuizQuestion::TYPES.
// TODO: derive from SharedConstants.
export type QuizQuestionType =
  | 'MultipleChoiceQuestion'
  | 'MultipleSelectQuestion'
  | 'FreeResponseQuestion'
  | 'MatchQuestion';

export interface QuizQuestionItem {
  id: string;
  text: string;
}

// Answer keys and the explanation are deliberately excluded.
export interface QuizQuestionSummary {
  id: number;
  type: QuizQuestionType;
  questionName: string;
  questionTitle: string;
  description?: string | null;
  choices?: QuizQuestionItem[];
  // A match question's two sets of items: the first in authored order, the
  // second shuffled, the same way for every student.
  matchSets?: [QuizQuestionItem[], QuizQuestionItem[]];
  page: number;
}

export interface QuizPage<T> {
  page: number;
  questions: T[];
}

export interface QuizLevelProperties extends LevelProperties {
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  showCorrectness?: boolean;
  revealAnswerExplanation?: boolean;
  showIntroScreen?: boolean;
  purpose?: string;
  allowMultipleAttempts?: boolean;
  showQuestionsAfterSubmit?: boolean;
  quizQuestions?: QuizQuestionSummary[];
}
