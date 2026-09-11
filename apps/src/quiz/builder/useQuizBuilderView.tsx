import React, {useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import {QuizLevelProperties, QuizViewContent, toBool} from '../types';

import QuizConfigurationPanel, {
  QuizConfigurationData,
} from './QuizConfigurationPanel';

export default function useQuizBuilderView({
  levelProperties,
}: LabProps): QuizViewContent {
  const {id: levelId, ...props} = levelProperties as QuizLevelProperties;

  // Lifted so a Configuration save is reflected immediately elsewhere on
  // this page, without a page reload - see QuizConfigurationPanel's onSaved.
  const [quizConfig, setQuizConfig] = useState<QuizConfigurationData>({
    ...props,
    showCorrectness: toBool(props.showCorrectness),
    revealAnswerExplanation: toBool(props.revealAnswerExplanation),
    showIntroScreen: toBool(props.showIntroScreen),
    allowMultipleAttempts: toBool(props.allowMultipleAttempts),
  });

  return {
    resourcePanelProps: {
      extraTabs: [
        {
          id: 'configuration',
          title: 'Configuration',
          icon: 'wrench',
          content: (
            <QuizConfigurationPanel
              quizId={levelId}
              initialValues={quizConfig}
              onSaved={setQuizConfig}
            />
          ),
        },
      ],
    },
    workspaceContent: <div>Quiz builder workspace placeholder</div>,
  };
}
