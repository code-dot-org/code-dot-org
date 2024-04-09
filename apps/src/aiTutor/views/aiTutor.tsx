import React, {useCallback, useEffect} from 'react';
import style from './ai-tutor.module.scss';
import ChatWorkspace from './chatWorkspace';
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

  return (
    <div className={style.tutorContainer}>
      <ChatWorkspace />
    </div>
  );
};

export default AITutor;
