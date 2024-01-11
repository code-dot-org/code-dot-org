import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {compilationSystemPrompt} from '@cdo/apps/aiTutor/constants';

// AI Tutor feature that explains to students why their code did not compile.
const CompilationTutor = ({levelId}) => {
  const dispatch = useDispatch();

  const sources = useSelector(state => state.javalabEditor.sources);
  const fileMetadata = useSelector(state => state.javalabEditor.fileMetadata);
  const activeTabKey = useSelector(state => state.javalabEditor.activeTabKey);
  const studentCode = sources[fileMetadata[activeTabKey]].text;
  const hasCompilationError = useSelector(
    state => state.javalabEditor.hasCompilationError
  );
  const hasRunOrTestedCode = useSelector(
    state => state.javalab.hasRunOrTestedCode
  );

  const isWaitingForAIResponse = useSelector(
    state => state.aiTutor.isWaitingForAIResponse
  );
  const aiResponse = useSelector(state => state.aiTutor.aiResponse);

  const systemPrompt = compilationSystemPrompt;

  const handleSend = async studentCode => {
    dispatch(
      askAITutor({systemPrompt: systemPrompt, studentCode: studentCode})
    );
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION, {
      levelId: levelId,
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

CompilationTutor.propTypes = {
  levelId: PropTypes.number,
};
