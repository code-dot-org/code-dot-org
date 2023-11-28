import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// AI Tutor feature that explains to students why their code is not passing tests.
const ValidationTutor = ({levelId}) => {
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
  const validationPassed = useSelector(state => state.javalab.validationPassed);

  const isWaitingForAIResponse = useSelector(
    state => state.aiTutor.isWaitingForAIResponse
  );
  const aiResponse = useSelector(state => state.aiTutor.aiResponse);

  const systemPrompt =
    'You are a tutor in a high school computer science class. Students in the class are studying Java and they would like to know in age-appropriate, clear language why their tests are not passing.';

  const handleSend = async studentCode => {
    dispatch(
      askAITutor({
        levelId: levelId,
        systemPrompt: systemPrompt,
        studentCode: studentCode,
      })
    );
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_VALIDATION, {
      levelId: levelId,
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
            disabled={enableAskAITutor}
          />
          <p id="ai-response">{aiResponse}</p>
        </>
      )}
    </div>
  );
};

export default ValidationTutor;

ValidationTutor.propTypes = {
  levelId: PropTypes.number,
};
