import React from 'react';

import {LabProps} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {QuizLevelProperties, QuizViewContent} from '../types';

import QuizAttemptWorkspace from './QuizAttemptWorkspace';

export default function useQuizAttemptView({
  levelProperties,
}: LabProps): QuizViewContent {
  const {
    id: levelId,
    appName,
    name: levelName,
    quizQuestions = [],
    allowMultipleAttempts,
    displayName,
    customIntroText,
    timeLimitMinutes,
    showIntroScreen,
  } = levelProperties as QuizLevelProperties;

  const unitId = useAppSelector(state => state.progress.scriptId) ?? undefined;

  return {
    resourcePanelProps: {},
    workspaceContent: (
      <QuizAttemptWorkspace
        levelId={levelId}
        appName={appName}
        levelName={levelName}
        unitId={unitId}
        quizQuestions={quizQuestions}
        allowMultipleAttempts={allowMultipleAttempts}
        displayName={displayName}
        customIntroText={customIntroText}
        timeLimitMinutes={timeLimitMinutes}
        showIntroScreen={showIntroScreen}
      />
    ),
  };
}
