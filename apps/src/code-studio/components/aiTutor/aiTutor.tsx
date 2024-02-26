import React, {useCallback, useEffect} from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {Role, Status, TutorType} from '@cdo/apps/aiTutor/types';
import {addChatMessage} from '@cdo/apps/aiTutor/redux/aiTutorRedux';

// AI Tutor feature that allows students to ask for help with compilation errors
// or general questions about the curriculum.

const AITutor: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const tutorType = useAppSelector(state => state.aiTutor.selectedTutorType);
  const hasCompilationError = useAppSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const isRunning = useAppSelector(state => state.javalab.isRunning);
  const hasRunOrTestedCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );

  const setCompilationChatMessages = useCallback(() => {
    const runCode = {
      id: 0,
      role: Role.ASSISTANT,
      status: Status.OK,
      chatMessageText: 'Run your code first and see what happens.',
    };

    const compilationSuccess = {
      id: 0,
      role: Role.ASSISTANT,
      status: Status.OK,
      chatMessageText: '🎉 Your code is compiling successfully. Great work!',
    };

    const compilationError = {
      id: 0,
      role: Role.ASSISTANT,
      status: Status.OK,
      chatMessageText:
        'Ah! You do have an error. Submit your code, and I will try to help.',
    };
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

  const setGeneralChatMessages = useCallback(() => {
    const generalChatMessage = {
      id: 0,
      role: Role.ASSISTANT,
      status: Status.OK,
      chatMessageText: 'Type your question below, and I will try to help.',
    };
    dispatch(addChatMessage(generalChatMessage));
  }, [dispatch]);

  useEffect(() => {
    if (tutorType === TutorType.COMPILATION) {
      setCompilationChatMessages();
    }
    if (tutorType === TutorType.GENERAL_CHAT) {
      setGeneralChatMessages();
    }
  }, [tutorType, setCompilationChatMessages, setGeneralChatMessages]);

  return (
    <div className={style.tutorContainer}>
      <ChatWorkspace />
    </div>
  );
};

export default AITutor;
