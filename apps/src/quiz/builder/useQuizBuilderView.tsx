import React, {useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import HttpClient from '@cdo/apps/util/HttpClient';

import {QuizLevelProperties, QuizViewContent} from '../types';
import {toBool} from '../utils';

import QuizBuilderWorkspace from './QuizBuilderWorkspace';
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
    showQuestionsAfterSubmit: toBool(props.showQuestionsAfterSubmit),
  });

  // Rejects on failure, so the caller can show the error where it happened.
  const saveQuizConfig = async (fields: Partial<QuizConfigurationData>) => {
    const response = await HttpClient.put(
      `/levels/${levelId}/quiz_configuration`,
      JSON.stringify(fields),
      true,
      {'Content-Type': 'application/json'}
    );
    setQuizConfig(await response.json());
  };

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
    workspaceContent: (
      <QuizBuilderWorkspace
        levelId={levelId}
        quizTitle={quizConfig.displayName || levelProperties.name}
        showIntroScreen={quizConfig.showIntroScreen}
        customIntroText={quizConfig.customIntroText ?? ''}
        hasTimeLimit={!!quizConfig.timeLimitMinutes}
        onSaveQuizConfig={saveQuizConfig}
      />
    ),
  };
}
