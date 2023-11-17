import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// AI Tutor feature that explains to students why their code is not passing tests.
const ValidationTutor = props => {
  const levelId = props.levelId;
  const dispatch = useDispatch();
  const javalabState = useSelector(state => state.javalab);
  const javalabEditorState = useSelector(state => state.javalabEditor);
  const studentCode =
    javalabEditorState.sources[
      javalabEditorState.fileMetadata[javalabEditorState.activeTabKey]
    ].text;
  const aiTutorState = useSelector(state => state.aiTutor);
  const systemPrompt =
    'You are a tutor in a high school computer science class. Students in the class are studying Java and they would like to know in age-appropriate, clear language why their tests are not passing.';

  const handleSend = async studentCode => {
    dispatch(
      askAITutor({systemPrompt: systemPrompt, studentCode: studentCode})
    );
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_VALIDATION, {
      levelId: levelId,
    });
  };

  return (
    <div className={style.tutorContainer}>
      {!javalabState.hasRunOrTestedCode && (
        <h4>Test your code first and see what happens.</h4>
      )}
      {javalabState.hasRunOrTestedCode &&
        javalabEditorState.hasCompilationError && (
          <h4>
            Uh oh! Your code has to compile successfully before we can work on
            passing tests.
          </h4>
        )}
      {javalabState.validationPassed && (
        <h4>🎉 Your tests are passing. Wahoo!</h4>
      )}
      {javalabState.hasRunOrTestedCode &&
        !javalabEditorState.hasCompilationError &&
        !javalabState.validationPassed && (
          <>
            <h4>Why aren't my tests passing?</h4>
            <Button
              text="Ask AI Tutor"
              isPending={aiTutorState.isWaitingForAIResponse}
              pendingText="waiting"
              onClick={() => handleSend(studentCode)}
              disabled={javalabState.validationPassed}
            />
            <p id="ai-response">{aiTutorState.aiResponse}</p>
          </>
        )}
    </div>
  );
};

export default ValidationTutor;

ValidationTutor.propTypes = {
  levelId: PropTypes.number,
};
