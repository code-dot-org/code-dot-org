import React, {useCallback} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';
import {
  AITutorTypes as ActionType,
  AITutorTypesValue,
} from '@cdo/apps/aiTutor/types';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {genericCompilation, genericValidation, genericHelp} from '../constants';
import {askAITutor} from '../redux/aiTutorRedux';

const QuickActions = {
  [ActionType.COMPILATION]: genericCompilation,
  [ActionType.VALIDATION]: genericValidation,
  [ActionType.GENERIC_HELP]: genericHelp,
};

const AITutorSuggestedPrompts: React.FunctionComponent = () => {
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const level = useAppSelector(state => state.aiTutor.level);

  // For PythonLab
  const pythonLabSource = useAppSelector(
    state => state.lab2Project?.projectSources?.source
  );

  const hasPythonLabError = useAppSelector(state => state.lab2System.hasError);
  const hasRunPythonCode = useAppSelector(state => state.lab2System.hasRun);
  const hasValidatedPythonCode = useAppSelector(
    state => state.lab2System.hasValidated
  );
  const hasRunOrTestedPythonLabCode =
    hasRunPythonCode || hasValidatedPythonCode;
  const isPythonLabRunning = useAppSelector(
    state => state.lab2System.isRunning
  );
  const isPythonLabValidating = useAppSelector(
    state => state.lab2System.isValidating
  );
  const {hasConditions, satisfied} = useAppSelector(
    state => state.lab.validationState
  );
  const pythonLabValidationFailed =
    hasConditions && hasValidatedPythonCode && !satisfied;

  // For JavaLab
  const javaLabSources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );

  const hasJavaLabCompilationError = useAppSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const hasRunOrTestedJavaLabCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );
  const isJavaLabRunning = useAppSelector(state => state.javalab.isRunning);
  const javaLabValidationPassed = useAppSelector(
    state => state.javalab.validationPassed
  );

  function getOptionsByLabType(labType: string) {
    if (labType === 'Pythonlab') {
      const studentCode =
        typeof pythonLabSource !== 'string' && pythonLabSource
          ? getActiveFileForSource(pythonLabSource)?.contents || ''
          : '';
      // Only show a suggested prompt if we aren't currently running or validating code,
      // code has been run or validated, and we aren't waiting for a chat response.
      const showOption =
        !isPythonLabRunning &&
        !isPythonLabValidating &&
        hasRunOrTestedPythonLabCode &&
        !isWaitingForChatResponse;
      const showGenericErrorOption = showOption && hasPythonLabError;
      const showValidationOption = showOption && pythonLabValidationFailed;
      return {studentCode, showGenericErrorOption, showValidationOption};
    } else if (labType === 'Javalab') {
      const studentCode = javaLabSources[fileMetadata[activeTabKey]].text;
      const showCompilationOption =
        !isJavaLabRunning &&
        hasRunOrTestedJavaLabCode &&
        hasJavaLabCompilationError &&
        !isWaitingForChatResponse;
      const showValidationOption =
        hasRunOrTestedJavaLabCode &&
        !hasJavaLabCompilationError &&
        !javaLabValidationPassed &&
        !isWaitingForChatResponse;
      return {studentCode, showCompilationOption, showValidationOption};
    }
    return {};
  }

  const labOptions = level?.type ? getOptionsByLabType(level.type) : {};
  const studentCode: string = labOptions.studentCode || '';
  const showCompilationOption = labOptions.showCompilationOption || false;
  const showValidationOption = labOptions.showValidationOption || false;
  const showGenericErrorOption = labOptions.showGenericErrorOption || false;

  const dispatch = useAppDispatch();

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
        case ActionType.GENERIC_HELP:
          studentInput = QuickActions[ActionType.GENERIC_HELP];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_GENERIC_HELP;
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

  // We set selected to false because once the user selects a prompt, we convert
  // the chip into a message in the chat history.
  const suggestedPrompts = [
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
    {
      label: QuickActions[ActionType.GENERIC_HELP],
      onClick: () => handleClick(ActionType.GENERIC_HELP),
      show: showGenericErrorOption,
      selected: false,
    },
  ];

  return <SuggestedPrompts suggestedPrompts={suggestedPrompts} />;
};

export default AITutorSuggestedPrompts;
