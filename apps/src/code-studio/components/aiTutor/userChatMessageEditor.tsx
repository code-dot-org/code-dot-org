import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AITutorTypes as TutorTypes} from '@cdo/apps/aiTutor/types';
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

  const tutorType = useAppSelector(state => state.aiTutor.selectedTutorType);

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

  const generalChat = tutorType === TutorTypes.GENERAL_CHAT;
  const compilation = tutorType === TutorTypes.COMPILATION;
  const validation = tutorType === TutorTypes.VALIDATION;

  const dispatch = useAppDispatch();

  const canSubmit = () => {
    if (compilation) {
      return !isRunning && hasRunOrTestedCode && hasCompilationError;
    } else if (validation) {
      return hasRunOrTestedCode && !hasCompilationError && !validationPassed;
    } else {
      return generalChat;
    }
  };

  const showSubmitButton = canSubmit();

  const getButtonText = () => {
    if (compilation) {
      return 'Submit code';
    } else if (validation) {
      return 'Submit code and tests';
    } else {
      return 'Submit';
    }
  };

  const buttonText = getButtonText();

  const handleSubmit = useCallback(() => {
    const studentInput = generalChat ? userMessage : studentCode;
    if (!isWaitingForChatResponse) {
      const chatContext = {
        studentInput: studentInput,
        tutorType: tutorType,
      };
      dispatch(askAITutor(chatContext));
      setUserMessage('');
    }

    let event;
    if (compilation) {
      event = EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION;
    } else if (validation) {
      event = EVENTS.AI_TUTOR_ASK_ABOUT_VALIDATION;
    } else if (generalChat) {
      event = EVENTS.AI_TUTOR_ASK_GENERAL_CHAT;
    }
    analyticsReporter.sendEvent(event, {
      levelId: level?.id,
      levelType: level?.type,
    });
  }, [
    generalChat,
    userMessage,
    studentCode,
    isWaitingForChatResponse,
    compilation,
    validation,
    level,
    tutorType,
    dispatch,
  ]);

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
      <div>
        <CopyButton />
      </div>
    </div>
  );
};

export default UserChatMessageEditor;
