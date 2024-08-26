import React, {useCallback, useState} from 'react';

import SuggestedPrompts, {SuggestedPrompt} from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';
import {
  AITutorTypes as ActionType,
  AITutorTypesValue,
} from '@cdo/apps/aiTutor/types';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {genericCompilation, genericValidation} from '../constants';
import {askAITutor} from '../redux/aiTutorRedux';

interface StringKeyValue {
  [index: string]: string;
}

const QuickActions: StringKeyValue = {
  [ActionType.COMPILATION]: genericCompilation,
  [ActionType.VALIDATION]: genericValidation,
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
      let event = '';

      switch (actionType) {
        case ActionType.COMPILATION:
          studentInput = QuickActions[ActionType.COMPILATION];
          event = EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION;
          break;
        case ActionType.VALIDATION:
          studentInput = QuickActions[ActionType.VALIDATION];
          event = EVENTS.AI_TUTOR_ASK_ABOUT_VALIDATION;
          break;
      }

      const chatContext = {
        studentInput,
        studentCode,
        actionType,
      };

      dispatch(askAITutor(chatContext));

      setSuggestedPrompts(suggestedPrompts =>
        suggestedPrompts.map(prompt => {
          if (prompt.label === QuickActions[actionType]) {
            return {...prompt, selected: true};
          }
          return prompt;
        })
      );

      analyticsReporter.sendEvent(event, {
        levelId: level?.id,
        levelType: level?.type,
      });
    },
    [studentCode, isWaitingForChatResponse, level, dispatch]
  );

  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([
    {
      label: QuickActions[ActionType.COMPILATION],
      onClick: () => handleClick(ActionType.COMPILATION),
      show: showCompilationOption,
      selected: false,
    },
    {
      label: QuickActions[ActionType.VALIDATION],
      onClick: () => handleClick(ActionType.VALIDATION),
      show: showValidationOption,
      selected: false,
    },
  ]);

  return <SuggestedPrompts suggestedPrompts={suggestedPrompts} />;
};

export default AITutorSuggestedPrompts;
