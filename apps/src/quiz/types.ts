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
  | 'FreeResponseQuestion';

// Answer fields (correctChoiceId, explanation) are deliberately excluded.
export interface QuizQuestionSummary {
  id: number;
  type: QuizQuestionType;
  questionName: string;
  questionTitle: string;
  description?: string | null;
  choices?: {id: string; text: string}[];
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
