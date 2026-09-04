import React, {useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import {QuizLevelProperties, QuizViewContent, toBool} from '../types';

import QuizConfigurationPanel, {
  QuizConfigurationData,
} from './QuizConfigurationPanel';

export default function useQuizBuilderView({
  levelProperties,
}: LabProps): QuizViewContent {
  const {
    id: levelId,
    displayName: initialDisplayName,
    customIntroText: initialCustomIntroText,
    timeLimitMinutes: initialTimeLimitMinutes,
    showCorrectness: initialShowCorrectness,
    revealAnswerExplanation: initialRevealAnswerExplanation,
    showIntroScreen: initialShowIntroScreen,
    purpose: initialPurpose,
    allowMultipleAttempts: initialAllowMultipleAttempts,
  } = levelProperties as QuizLevelProperties;

  // Lifted so a Configuration save is reflected immediately elsewhere on
  // this page, without a page reload - see QuizConfigurationPanel's onSaved.
  const [quizConfig, setQuizConfig] = useState<QuizConfigurationData>({
    displayName: initialDisplayName,
    customIntroText: initialCustomIntroText,
    timeLimitMinutes: initialTimeLimitMinutes,
    showCorrectness: toBool(initialShowCorrectness),
    revealAnswerExplanation: toBool(initialRevealAnswerExplanation),
    showIntroScreen: toBool(initialShowIntroScreen),
    purpose: initialPurpose,
    allowMultipleAttempts: toBool(initialAllowMultipleAttempts),
  });

  return {
    resourcePanelProps: {
      configurationContent: (
        <QuizConfigurationPanel
          quizId={levelId}
          initialValues={quizConfig}
          onSaved={setQuizConfig}
        />
      ),
    },
    workspaceContent: <div>Quiz builder workspace placeholder</div>,
  };
}
