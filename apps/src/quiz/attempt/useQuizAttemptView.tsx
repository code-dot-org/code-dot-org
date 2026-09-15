import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import {QuizViewContent} from '../types';

// Placeholder pending the quiz-attempt (taking) experience.
export default function useQuizAttemptView(_props: LabProps): QuizViewContent {
  return {
    resourcePanelProps: {},
    workspaceContent: <div>This is a Quiz level.</div>,
  };
}
