import React, {useState} from 'react';

import {LabProps} from '@cdo/apps/lab2/types';

import {QuizLevelProperties, QuizViewContent} from '../types';
import {toBool} from '../utils';

import QuizBuilderWorkspace from './QuizBuilderWorkspace';
import QuizConfigurationPanel from './QuizConfigurationPanel';
import {QuizConfigurationData} from './types';

export default function useQuizBuilderView({
  levelProperties,
}: LabProps): QuizViewContent {
  const {id: levelId, ...props} = levelProperties as QuizLevelProperties;

  const [savedConfig, setSavedConfig] = useState<QuizConfigurationData>(() => ({
    ...props,
    showCorrectness: toBool(props.showCorrectness),
    revealAnswerExplanation: toBool(props.revealAnswerExplanation),
    showIntroScreen: toBool(props.showIntroScreen),
    allowMultipleAttempts: toBool(props.allowMultipleAttempts),
    showQuestionsAfterSubmit: toBool(props.showQuestionsAfterSubmit),
  }));
  // The configuration as edited in the panel and the intro screen card,
  // saved with Save quiz.
  const [configDraft, setConfigDraft] = useState(savedConfig);

  const updateConfig = (fields: Partial<QuizConfigurationData>) =>
    setConfigDraft(prev => ({...prev, ...fields}));

  return {
    resourcePanelProps: {
      extraTabs: [
        {
          id: 'configuration',
          title: 'Configuration',
          icon: 'wrench',
          content: (
            <QuizConfigurationPanel
              values={configDraft}
              onChange={updateConfig}
            />
          ),
        },
      ],
    },
    workspaceContent: (
      <QuizBuilderWorkspace
        levelId={levelId}
        quizTitle={configDraft.displayName || levelProperties.name}
        config={configDraft}
        savedConfig={savedConfig}
        onConfigChange={updateConfig}
        onConfigSaved={fields => setSavedConfig(prev => ({...prev, ...fields}))}
      />
    ),
  };
}
