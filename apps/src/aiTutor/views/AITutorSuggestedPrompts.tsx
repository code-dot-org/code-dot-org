import React, {useCallback} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';
import {AITutorAction} from '@cdo/apps/aiTutor/types';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  SuggestedPromptActions,
  QuickActions,
  AITutorEventMap,
  PromptOptionMap,
} from '../constants';
import {askAITutor, setShowSuggestedPrompts} from '../redux/aiTutorRedux';
import {SuggestedPromptOptions} from '../types';

const useLabSelectors = () => {
  return useAppSelector(state => ({
    isWaitingForChatResponse: state.aiTutor.isWaitingForChatResponse,
    level: state.aiTutor.level,
    showSuggestedPrompts: state.aiTutor.showSuggestedPrompts,

    // pythonlab selectors
    pythonlabSource: state.lab2Project?.projectSources?.source,
    hasPythonlabError: state.lab2System.hasError,
    isPythonlabRunning: state.lab2System.isRunning,
    hasRunPythonCode: state.lab2System.hasRun,
    hasValidatedPythonCode: state.lab2System.hasValidated,
    isPythonlabValidating: state.lab2System.isValidating,
    validationState: state.lab.validationState,

    // javalab selectors
    javalabSources: state.javalabEditor.sources,
    fileMetadata: state.javalabEditor.fileMetadata,
    activeTabKey: state.javalabEditor.activeTabKey,
    hasJavalabCompilationError: state.javalabEditor.hasCompilationError,
    hasRunOrTestedJavalabCode: state.javalab.hasRunOrTestedCode,
    isJavalabRunning: state.javalab.isRunning,
    javalabValidationPassed: state.javalab.validationPassed,
  }));
};

const AITutorSuggestedPrompts: React.FunctionComponent = () => {
  const {
    isWaitingForChatResponse,
    level,
    showSuggestedPrompts,
    pythonlabSource,
    hasPythonlabError,
    hasRunPythonCode,
    isPythonlabRunning,
    hasValidatedPythonCode,
    isPythonlabValidating,
    validationState,
    javalabSources,
    fileMetadata,
    activeTabKey,
    hasJavalabCompilationError,
    isJavalabRunning,
    hasRunOrTestedJavalabCode,
    javalabValidationPassed,
  } = useLabSelectors();

  const getSuggestedPromptOptionsByLabType = useCallback(
    (labType: string): SuggestedPromptOptions => {
      // Show a suggested prompt if:
      // * we aren't currently running or validating code,
      // * and we aren't waiting for a chat response
      // * code has been run or validated.
      // However, if the user clicks on a suggested prompt, hide the suggested prompt(s)
      // until after they click on run or test/validate again.
      if (labType === 'Pythonlab') {
        const studentCode =
          typeof pythonlabSource !== 'string' && pythonlabSource
            ? getActiveFileForSource(pythonlabSource)?.contents || ''
            : '';
        const showOption =
          !isPythonlabRunning &&
          !isPythonlabValidating &&
          (hasRunPythonCode || hasValidatedPythonCode) &&
          !isWaitingForChatResponse;
        return {
          studentCode,
          showGenericErrorOption: showOption && hasPythonlabError,
          showValidationOption:
            showOption &&
            validationState.hasConditions &&
            hasValidatedPythonCode &&
            !validationState.satisfied,
        };
      }
      if (labType === 'Javalab') {
        const studentCode = javalabSources[fileMetadata[activeTabKey]].text;
        return {
          studentCode,
          showCompilationOption:
            !isJavalabRunning &&
            hasRunOrTestedJavalabCode &&
            hasJavalabCompilationError &&
            !isWaitingForChatResponse,
          showValidationOption:
            hasRunOrTestedJavalabCode &&
            !hasJavalabCompilationError &&
            !javalabValidationPassed &&
            !isWaitingForChatResponse,
        };
      }
      return {studentCode: ''};
    },
    [
      activeTabKey,
      fileMetadata,
      hasJavalabCompilationError,
      hasPythonlabError,
      hasRunOrTestedJavalabCode,
      hasRunPythonCode,
      hasValidatedPythonCode,
      isJavalabRunning,
      isPythonlabRunning,
      isPythonlabValidating,
      isWaitingForChatResponse,
      javalabSources,
      javalabValidationPassed,
      pythonlabSource,
      validationState.hasConditions,
      validationState.satisfied,
    ]
  );

  // promptOptions is an object with 3 optional keys (boolean values):
  // showCompilationOption, showValidatonOption, and showGenericErrorOption
  const {studentCode, ...promptOptions} = level?.type
    ? getSuggestedPromptOptionsByLabType(level.type)
    : {studentCode: ''};

  const dispatch = useAppDispatch();

  const handleClick = useCallback(
    (aiTutorAction: AITutorAction) => {
      if (isWaitingForChatResponse) {
        return;
      }
      dispatch(setShowSuggestedPrompts(false));
      dispatch(
        askAITutor({
          studentInput: QuickActions[aiTutorAction as SuggestedPromptActions],
          studentCode,
          actionType: aiTutorAction,
        })
      );

      const suggestedPromptEventKey =
        AITutorEventMap[
          aiTutorAction.toUpperCase() as keyof typeof AITutorEventMap
        ];

      analyticsReporter.sendEvent(EVENTS.AI_TUTOR_CHAT_EVENT, {
        levelId: level?.id,
        levelType: level?.type,
        progressionType: level?.progressionType,
        suggestedPrompt: EVENTS[suggestedPromptEventKey],
      });
    },
    [isWaitingForChatResponse, studentCode, dispatch, level]
  );

  const suggestedPrompts = Object.entries(QuickActions)
    .map(([action, message]) => {
      const typedAction = action as SuggestedPromptActions;
      const optionKey = PromptOptionMap[typedAction];
      // selected is assigned false so that when the user selects a chip, it is converted to
      // a message in the chat history.
      return {
        label: message,
        onClick: () => handleClick(typedAction),
        show: optionKey ? !!promptOptions[optionKey] : false,
        selected: false,
      };
    })
    .filter(prompt => prompt.show);
  // `showSuggestedPrompts` ensures that if the user clicks on a suggested prompt,
  // we do not show a suggested prompt again until the user clicks on the 'Run' or
  // 'Validate'/'Test' buttons.
  return showSuggestedPrompts ? (
    <SuggestedPrompts suggestedPrompts={suggestedPrompts} />
  ) : null;
};

export default AITutorSuggestedPrompts;
