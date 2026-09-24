import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';
import {ExtraTab} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/types';

export interface QuizViewContent {
  resourcePanelProps: {
    extraTabs?: ExtraTab[];
  };
  workspaceContent: React.ReactNode;
}

// Answer fields (correctChoiceId, explanation) are deliberately excluded.
export interface QuizQuestionSummary {
  id: number;
  type: string;
  questionName: string;
  stem: string;
  choices?: {id: string; text: string}[];
  page: number;
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
  quizQuestions?: QuizQuestionSummary[];
}

export const toBool = (value: boolean | undefined) => value ?? false;
