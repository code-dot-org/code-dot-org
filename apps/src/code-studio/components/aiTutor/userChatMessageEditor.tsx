import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor, submitChatMessage} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {TutorType} from '@cdo/apps/aiTutor/types';
import CopyButton from './copyButton';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

/**
 * Renders the AI Tutor user chat message editor component.
 */

const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const tutorType = useAppSelector(
    state => state.aiTutor.selectedTutorType
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

  const generalChat = tutorType === TutorType.GENERAL_CHAT;
  const compilation = tutorType === TutorType.COMPILATION;
  const validation = tutorType === TutorType.VALIDATION;

  const dispatch = useAppDispatch();

  const canSubmit = () => {
    if (compilation) {
      return hasRunOrTestedCode && hasCompilationError;
    } else {
      return true;
    }
  }

  const showSubmitButton = canSubmit();

  const getButtonText = () => {
    if (compilation) {
      return 'Submit code'
    } else if (validation) {
      return 'Submit code and tests'
    } else {
      return 'Submit'
    }
  };

  const buttonText = getButtonText();

  const handleSubmit = useCallback(() => {
    if (compilation) {
      const chatContext = {
        studentCode: studentCode,
        tutorType: TutorType.COMPILATION,
      };
      dispatch(askAITutor(chatContext));
      analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION, {
        levelId: level?.id,
      });
    } else {
      if (!isWaitingForChatResponse) {
        dispatch(submitChatMessage(userMessage));
        setUserMessage('');
      }
    }
  }, [userMessage, dispatch, isWaitingForChatResponse]);

  return (
    <div className={style.UserChatMessageEditor}>
      {generalChat && (
        <textarea
          className={style.textArea}
          onChange={e => setUserMessage(e.target.value)}
          value={userMessage}
        />
      )}
      {showSubmitButton && (
        <Button
          key="submit"
          text={buttonText}
          icon="arrow-up"
          onClick={() => handleSubmit()}
          color={Button.ButtonColor.brandSecondaryDefault}
          disabled={isWaitingForChatResponse}
        />
      )}
      <CopyButton />
    </div>
  );
};

export default UserChatMessageEditor;
