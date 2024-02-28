import React from 'react';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {TutorType} from '@cdo/apps/aiTutor/types';

// AI Tutor feature that explains to students why their code is not passing tests.

const ValidationTutor: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

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
  const validationPassed = useAppSelector(
    state => state.javalab.validationPassed
  );
  const hasRunOrTestedCode = useAppSelector(
    state => state.javalab.hasRunOrTestedCode
  );
  const isWaitingForAIResponse = useAppSelector(
    state => state.aiTutor.isWaitingForAIResponse
  );
  const aiResponse = useAppSelector(state => state.aiTutor.aiResponse);
  const level = useAppSelector(state => state.aiTutor.level);

  const handleSend = async (studentCode: string) => {
    const chatContext = {
      studentCode: studentCode,
      tutorType: TutorType.VALIDATION,
    };
    dispatch(askAITutor(chatContext));
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_VALIDATION, {
      levelId: level?.id,
    });
  };

  const enableAskAITutor =
    hasRunOrTestedCode && !hasCompilationError && !validationPassed;

  return (
    <div className={style.tutorContainer}>
      {!hasRunOrTestedCode && !validationPassed && (
        <h4>Test your code first and see what happens.</h4>
      )}
      {hasRunOrTestedCode && hasCompilationError && (
        <h4>
          Uh oh! Your code has to compile successfully before we can work on
          passing tests.
        </h4>
      )}
      {validationPassed && <h4>🎉 Your tests are passing. Wahoo!</h4>}
      {enableAskAITutor && (
        <>
          <h4>Why aren't my tests passing?</h4>
          <Button
            text="Ask AI Tutor"
            isPending={isWaitingForAIResponse}
            pendingText="waiting"
            onClick={() => handleSend(studentCode)}
            disabled={!enableAskAITutor}
          />
          <p id="ai-response">{aiResponse}</p>
        </>
      )}
    </div>
  );
};

export default ValidationTutor;
