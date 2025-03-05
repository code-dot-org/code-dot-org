import React, {useCallback} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';
import {AITutorAction, AITutorActions} from '@cdo/apps/aiTutor/types';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {genericCompilation, genericValidation, genericHelp} from '../constants';
import {askAITutor} from '../redux/aiTutorRedux';

const QuickActions = {
  [AITutorActions.COMPILATION]: genericCompilation,
  [AITutorActions.VALIDATION]: genericValidation,
  [AITutorActions.GENERIC_HELP]: genericHelp,
};

const AITutorSuggestedPrompts: React.FunctionComponent = () => {
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const level = useAppSelector(state => state.aiTutor.level);

  // For pythonlab
  const pythonlabSource = useAppSelector(
    state => state.lab2Project?.projectSources?.source
  );
  const hasPythonlabError = useAppSelector(state => state.lab2System.hasError);
  const hasRunPythonCode = useAppSelector(state => state.lab2System.hasRun);
  const runCount = useAppSelector(state => state.lab2System.runCount);
  console.log('runCount', runCount);
  const hasValidatedPythonCode = useAppSelector(
    state => state.lab2System.hasValidated
  );
  const hasRunOrTestedPythonlabCode =
    hasRunPythonCode || hasValidatedPythonCode;
  const isPythonlabRunning = useAppSelector(
    state => state.lab2System.isRunning
  );
  const isPythonlabValidating = useAppSelector(
    state => state.lab2System.isValidating
  );
  const {hasConditions, satisfied} = useAppSelector(
    state => state.lab.validationState
  );
  const pythonlabValidationFailed =
    hasConditions && hasValidatedPythonCode && !satisfied;

  // For javalab
  const javalabSources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );

  const hasJavalabCompilationError = useAppSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const hasRunOrTestedJavalabCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );
  const runCountJavalab = useAppSelector(state => state.javalab.runCount);
  console.log('runCountJavalab', runCountJavalab);
  const isJavalabRunning = useAppSelector(state => state.javalab.isRunning);
  const javalabValidationPassed = useAppSelector(
    state => state.javalab.validationPassed
  );

  function getOptionsByLabType(labType: string) {
    if (labType === 'Pythonlab') {
      const studentCode =
        typeof pythonlabSource !== 'string' && pythonlabSource
          ? getActiveFileForSource(pythonlabSource)?.contents || ''
          : '';
      // Only show a suggested prompt if we aren't currently running or validating code,
      // code has been run or validated, and we aren't waiting for a chat response.
      const showOption =
        !isPythonlabRunning &&
        !isPythonlabValidating &&
        hasRunOrTestedPythonlabCode &&
        !isWaitingForChatResponse;
      const showGenericErrorOption = showOption && hasPythonlabError;
      const showValidationOption = showOption && pythonlabValidationFailed;
      return {studentCode, showGenericErrorOption, showValidationOption};
    } else if (labType === 'Javalab') {
      const studentCode = javalabSources[fileMetadata[activeTabKey]].text;
      const showCompilationOption =
        !isJavalabRunning &&
        hasRunOrTestedJavalabCode &&
        hasJavalabCompilationError &&
        !isWaitingForChatResponse;
      const showValidationOption =
        hasRunOrTestedJavalabCode &&
        !hasJavalabCompilationError &&
        !javalabValidationPassed &&
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
    (aiTutorAction: AITutorAction) => {
      if (isWaitingForChatResponse) {
        return;
      }

      let studentInput = '';
      let suggestedPromptType = '';

      switch (aiTutorAction) {
        case AITutorActions.COMPILATION:
          studentInput = QuickActions[AITutorActions.COMPILATION];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_COMPILATION;
          break;
        case AITutorActions.VALIDATION:
          studentInput = QuickActions[AITutorActions.VALIDATION];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_VALIDATION;
          break;
        case AITutorActions.GENERIC_HELP:
          studentInput = QuickActions[AITutorActions.GENERIC_HELP];
          suggestedPromptType = EVENTS.AI_TUTOR_SUGGESTED_PROMPT_GENERIC_HELP;
          break;
      }

      const chatContext = {
        studentInput,
        studentCode,
        actionType: aiTutorAction,
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
      label: QuickActions[AITutorActions.COMPILATION],
      onClick: () => handleClick(AITutorActions.COMPILATION),
      show: showCompilationOption,
      selected: false,
    },
    {
      label: QuickActions[AITutorActions.VALIDATION],
      onClick: () => handleClick(AITutorActions.VALIDATION),
      show: showValidationOption,
      selected: false,
    },
    {
      label: QuickActions[AITutorActions.GENERIC_HELP],
      onClick: () => handleClick(AITutorActions.GENERIC_HELP),
      show: showGenericErrorOption,
      selected: false,
    },
  ];

  return <SuggestedPrompts suggestedPrompts={suggestedPrompts} />;
};

export default AITutorSuggestedPrompts;
