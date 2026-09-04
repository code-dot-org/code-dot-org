import React from 'react';

import {LevelProperties} from '@cdo/apps/lab2/types';

export interface QuizViewContent {
  resourcePanelProps: {
    questionBankContent?: React.ReactNode;
    configurationContent?: React.ReactNode;
  };
  workspaceContent: React.ReactNode;
}

export interface QuizLevelProperties extends LevelProperties {
  unitId?: number;
  displayName?: string;
  customIntroText?: string;
  timeLimitMinutes?: number;
  // boolean setting arrives as the literal string "true"/"false", see toBool below.
  showCorrectness?: boolean | string;
  revealAnswerExplanation?: boolean | string;
  showIntroScreen?: boolean | string;
  purpose?: string;
  allowMultipleAttempts?: boolean | string;
}

export const toBool = (value: boolean | string | undefined) =>
  value === true || value === 'true';
