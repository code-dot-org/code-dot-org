import React, {useCallback, useEffect} from 'react';
import style from './ai-tutor.module.scss';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AITutorTypes as TutorTypes} from '@cdo/apps/aiTutor/types';
import {
  compilationError,
  compilationErrorFirst,
  compilationSuccess,
  generalChatMessage,
  runCode,
  testCode,
  vaildationError,
  validationSuccess,
} from '@cdo/apps/aiTutor/constants';
import {addChatMessage} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import ChatMessage from './ChatMessage';
import WarningModal from './WarningModal';

// AI Tutor feature that allows students to ask for help with compilation errors
// or general questions about the curriculum.

const AITutorChatWorkspace: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const tutorType = useAppSelector(state => state.aiTutor.selectedTutorType);
  const hasCompilationError = useAppSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const isRunning = useAppSelector(state => state.javalab.isRunning);
  const hasRunOrTestedCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );
  const validationPassed = useAppSelector(
    state => state.javalab.validationPassed
  );

  const setCompilationChatMessages = useCallback(() => {
    if (!isRunning) {
      if (!hasRunOrTestedCode) {
        dispatch(addChatMessage(runCode));
      }
      if (hasRunOrTestedCode && !hasCompilationError) {
        dispatch(addChatMessage(compilationSuccess));
      }
      if (hasRunOrTestedCode && hasCompilationError) {
        dispatch(addChatMessage(compilationError));
      }
    }
  }, [dispatch, hasCompilationError, hasRunOrTestedCode, isRunning]);

  const setValidationChatMessages = useCallback(() => {
    if (!isRunning) {
      if (!hasRunOrTestedCode && !validationPassed) {
        dispatch(addChatMessage(testCode));
      }
      if (hasRunOrTestedCode && hasCompilationError) {
        dispatch(addChatMessage(compilationErrorFirst));
      }
      if (validationPassed) {
        dispatch(addChatMessage(validationSuccess));
      }
      if (hasRunOrTestedCode && !hasCompilationError && !validationPassed) {
        dispatch(addChatMessage(vaildationError));
      }
    }
  }, [
    dispatch,
    hasCompilationError,
    hasRunOrTestedCode,
    isRunning,
    validationPassed,
  ]);

  const setGeneralChatMessages = useCallback(() => {
    dispatch(addChatMessage(generalChatMessage));
  }, [dispatch]);

  useEffect(() => {
    if (tutorType === TutorTypes.COMPILATION) {
      setCompilationChatMessages();
    }
    if (tutorType === TutorTypes.GENERAL_CHAT) {
      setGeneralChatMessages();
    }
    if (tutorType === TutorTypes.VALIDATION) {
      setValidationChatMessages();
    }
  }, [
    tutorType,
    setCompilationChatMessages,
    setGeneralChatMessages,
    setValidationChatMessages,
  ]);

  const storedMessages = useAppSelector(state => state.aiTutor.chatMessages);
  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const showWaitingAnimation = () => {
    if (isWaitingForChatResponse) {
      return (
        <img
          src="/blockly/media/aichat/typing-animation.gif"
          alt={'Waiting for response'}
          className={style.waitingForResponse}
        />
      );
    }
  };

  const generalChat = tutorType === TutorTypes.GENERAL_CHAT;

  return (
    <div className={style.tutorContainer}>
      <div id="chat-workspace-area" className={style.chatWorkspace}>
        {generalChat && <WarningModal />}
        <div
          id="chat-workspace-conversation"
          className={style.conversationArea}
        >
          {storedMessages.map(message => (
            <ChatMessage message={message} key={message.id} />
          ))}
          {showWaitingAnimation()}
        </div>
      </div>
    </div>
  );
};

export default AITutorChatWorkspace;
