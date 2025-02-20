import React, {useCallback} from 'react';

import DeprecatedSuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/DeprecatedSuggestedPrompts';
import {
  AITutorTypes as ActionType,
  AITutorTypesValue,
} from '@cdo/apps/aiTutor/types';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  genericCompilation,
  genericValidation,
  genericError,
} from '../constants';
import {askAITutor} from '../redux/aiTutorRedux';

const QuickActions = {
  [ActionType.COMPILATION]: genericCompilation,
  [ActionType.VALIDATION]: genericValidation,
  [ActionType.GENERIC_ERROR]: genericError,
};

const AITutorSuggestedPrompts: React.FunctionComponent = () => {
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const level = useAppSelector(state => state.aiTutor.level);

  const sources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );
  const studentCode = sources[fileMetadata[activeTabKey]].text;

  const hasCompilationError = useAppSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const hasRunOrTestedCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );
  const isRunning = useAppSelector(state => state.javalab.isRunning);
  const validationPassed = useAppSelector(
    state => state.javalab.validationPassed
  );

  const dispatch = useAppDispatch();

  const showCompilationOption =
    !isRunning &&
    hasRunOrTestedCode &&
    hasCompilationError &&
    !isWaitingForChatResponse;
  const showValidationOption =
    hasRunOrTestedCode &&
    !hasCompilationError &&
    !validationPassed &&
    !isWaitingForChatResponse;

  const handleClick = useCallback(
    (actionType: AITutorTypesValue) => {
      if (isWaitingForChatResponse) {
        return;
      }

      let studentInput = '';
      let suggestedPromptType = '';

      switch (actionType) {
        case ActionType.COMPILATION:
          studentInput = QuickActions[ActionType.COMPILATION];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_COMPILATION;
          break;
        case ActionType.VALIDATION:
          studentInput = QuickActions[ActionType.VALIDATION];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_VALIDATION;
          break;
        case ActionType.GENERIC_ERROR:
          studentInput = QuickActions[ActionType.GENERIC_ERROR];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_GENERIC_ERROR;
          break;
      }

      const chatContext = {
        studentInput,
        studentCode,
        actionType,
      };

      dispatch(askAITutor(chatContext));

      analyticsReporter.sendEvent(EVENTS.AI_TUTOR_CHAT_EVENT, {
        levelId: level?.id,
        levelType: level?.type,
        progressionType: level?.progressionType,
        suggestedPrompt: suggestedPromptType,
      });
    },
    [studentCode, isWaitingForChatResponse, level, dispatch]
  );

  const suggestedPrompts = [
    {
      label: QuickActions[ActionType.COMPILATION],
      onClick: () => handleClick(ActionType.COMPILATION),
      show: showCompilationOption,
    },
    {
      label: QuickActions[ActionType.VALIDATION],
      onClick: () => handleClick(ActionType.VALIDATION),
      show: showValidationOption,
    },
    {
      label: QuickActions[ActionType.GENERIC_ERROR],
      onClick: () => handleClick(ActionType.GENERIC_ERROR),
      show: showGenericErrorOption,
    },
  ];

  return <DeprecatedSuggestedPrompts suggestedPrompts={suggestedPrompts} />;
};

export default AITutorSuggestedPrompts;
