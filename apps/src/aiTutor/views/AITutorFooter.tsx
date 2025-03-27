import React, {useCallback} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {AITutorActions} from '@cdo/apps/aiTutor/types';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import style from './ai-tutor.module.scss';

/**
 * Renders the AI Tutor user chat message editor component.
 */

interface AITutorFooterProps {
  renderAITutor: boolean;
}

const AITutorFooter: React.FC<AITutorFooterProps> = ({renderAITutor}) => {
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const level = useAppSelector(state => state.aiTutor.level);

  // For PythonLab
  const pythonLabSource = useAppSelector(
    state => state.lab2Project?.projectSources?.source
  );

  // For JavaLab
  const javaLabSources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );

  let studentCode: string = '';

  // TODO: For both JavaLab and PythonLab, we are only considering the active file contents,
  // Ticket to improve: https://codedotorg.atlassian.net/browse/CT-1058
  if (level?.type === 'Pythonlab') {
    // String sources should only be used for non-multifile labs (i.e., not Pythonlab)
    if (typeof pythonLabSource !== 'string' && pythonLabSource) {
      studentCode = getActiveFileForSource(pythonLabSource)?.contents || '';
    }
  } else if (level?.type === 'Javalab') {
    studentCode = javaLabSources[fileMetadata[activeTabKey]].text;
  }

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(
    (userMessage: string) => {
      if (isWaitingForChatResponse) {
        return;
      }

      const chatContext = {
        studentInput: userMessage,
        studentCode,
        actionType: AITutorActions.GENERAL_CHAT,
      };

      dispatch(askAITutor(chatContext));

      analyticsReporter.sendEvent(EVENTS.AI_TUTOR_CHAT_EVENT, {
        levelId: level?.id,
        levelType: level?.type,
        progressionType: level?.progressionType,
        suggestedPrompt: EVENTS.AI_TUTOR_SUGGESTED_PROMPT_NONE,
      });
    },
    [studentCode, isWaitingForChatResponse, level, dispatch]
  );

  const disabled = !renderAITutor || isWaitingForChatResponse;

  return (
    <div className={style.aiTutorFooter}>
      <UserMessageEditor onSubmit={handleSubmit} disabled={disabled} />
    </div>
  );
};

export default AITutorFooter;
