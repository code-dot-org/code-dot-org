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
  showCorrectness?: boolean;
  revealAnswerExplanation?: boolean;
  showIntroScreen?: boolean;
  purpose?: string;
  allowMultipleAttempts?: boolean;
}

export const toBool = (value: boolean | undefined) => value ?? false;
