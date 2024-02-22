import React from 'react';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {TutorType} from '@cdo/apps/aiTutor/types';

// AI Tutor feature that explains to students why their code did not compile.

const CompilationTutor: React.FunctionComponent = () => {
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
      tutorType: TutorType.COMPILATION,
    };
    dispatch(askAITutor(chatContext));
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION, {
      levelId: level?.id,
    });
  };

  return (
    <div className={style.tutorContainer}>
      {!hasRunOrTestedCode && (
        <h4>Run your code first and see what happens.</h4>
      )}
      {hasRunOrTestedCode && !hasCompilationError && (
        <h4>🎉 Your code is compiling successfully. Great work!</h4>
      )}
      {hasRunOrTestedCode && hasCompilationError && (
        <>
          <h4>Why didn't my code compile?</h4>
          <Button
            text="Ask AI Tutor"
            isPending={isWaitingForAIResponse}
            pendingText="waiting"
            onClick={() => handleSend(studentCode)}
            disabled={!hasCompilationError}
          />
          <p id="ai-response">{aiResponse}</p>
        </>
      )}
    </div>
  );
};

export default CompilationTutor;
