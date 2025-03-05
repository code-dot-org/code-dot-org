import React, {useCallback, useState, useEffect} from 'react';

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
import {askAITutor} from '../redux/aiTutorRedux';
import {SuggestedPromptOptions} from '../types';

const useLabSelectors = () => {
  return useAppSelector(state => ({
    isWaitingForChatResponse: state.aiTutor.isWaitingForChatResponse,
    level: state.aiTutor.level,

    // pythonlab selectors
    pythonlabSource: state.lab2Project?.projectSources?.source,
    hasPythonlabError: state.lab2System.hasError,
    runCountPythonlab: state.lab2System.runCount,
    validateCountPythonlab: state.lab2System.validateCount,
    isPythonlabRunning: state.lab2System.isRunning,
    isPythonlabValidating: state.lab2System.isValidating,
    validationState: state.lab.validationState,

    // javalab selectors
    javalabSources: state.javalabEditor.sources,
    fileMetadata: state.javalabEditor.fileMetadata,
    activeTabKey: state.javalabEditor.activeTabKey,
    hasJavalabCompilationError: state.javalabEditor.hasCompilationError,
    runCountJavalab: state.javalab.runCount,
    validateCountJavalab: state.javalab.validateCount,
    isJavalabRunning: state.javalab.isRunning,
    javalabValidationPassed: state.javalab.validationPassed,
  }));
};

const AITutorSuggestedPrompts: React.FunctionComponent = () => {
  const {
    isWaitingForChatResponse,
    level,
    pythonlabSource,
    hasPythonlabError,
    runCountPythonlab,
    validateCountPythonlab,
    isPythonlabRunning,
    isPythonlabValidating,
    validationState,
    javalabSources,
    fileMetadata,
    activeTabKey,
    hasJavalabCompilationError,
    runCountJavalab,
    validateCountJavalab,
    isJavalabRunning,
    javalabValidationPassed,
  } = useLabSelectors();

  const [clickPromptCountChange, setClickPromptCountChange] = useState(false);

  useEffect(() => {
    setClickPromptCountChange(false);
  }, [
    runCountJavalab,
    runCountPythonlab,
    validateCountPythonlab,
    validateCountJavalab,
  ]);

  const getSuggestedPromptOptionsByLabType = useCallback(
    (labType: string): SuggestedPromptOptions => {
      if (labType === 'Pythonlab') {
        const studentCode =
          typeof pythonlabSource !== 'string' && pythonlabSource
            ? getActiveFileForSource(pythonlabSource)?.contents || ''
            : '';
        // Show a suggested prompt if:
        // * we aren't currently running or validating code,
        // * and we aren't waiting for a chat response
        // * code has been run or validated.
        // However, if the user clicks on run/validate again after clicking on a
        // suggested prompt, hide the suggested prompt(s).
        const showOption =
          !isPythonlabRunning &&
          !isPythonlabValidating &&
          (!!runCountPythonlab || !!validateCountPythonlab) &&
          !isWaitingForChatResponse;
        return {
          studentCode,
          showGenericErrorOption: showOption && hasPythonlabError,
          showValidationOption:
            showOption &&
            validationState.hasConditions &&
            !!validateCountPythonlab &&
            !validationState.satisfied,
        };
      }
      if (labType === 'Javalab') {
        const studentCode = javalabSources[fileMetadata[activeTabKey]].text;
        return {
          studentCode,
          showCompilationOption:
            !isJavalabRunning &&
            !!runCountJavalab &&
            hasJavalabCompilationError &&
            !isWaitingForChatResponse,
          showValidationOption:
            !!validateCountJavalab &&
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
      isJavalabRunning,
      isPythonlabRunning,
      isPythonlabValidating,
      isWaitingForChatResponse,
      javalabSources,
      javalabValidationPassed,
      pythonlabSource,
      runCountJavalab,
      runCountPythonlab,
      validateCountJavalab,
      validateCountPythonlab,
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
      setClickPromptCountChange(() => true);
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
  const showPrompts = !clickPromptCountChange;

  return showPrompts ? (
    <SuggestedPrompts suggestedPrompts={suggestedPrompts} />
  ) : null;
};

export default AITutorSuggestedPrompts;
