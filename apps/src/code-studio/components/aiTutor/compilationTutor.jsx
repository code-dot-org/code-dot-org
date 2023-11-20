import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// AI Tutor feature that explains to students why their code did not compile.
const CompilationTutor = ({levelId}) => {
  const dispatch = useDispatch();
  const javalabState = useSelector(state => state.javalab);
  const javalabEditorState = useSelector(state => state.javalabEditor);
  const studentCode =
    javalabEditorState.sources[
      javalabEditorState.fileMetadata[javalabEditorState.activeTabKey]
    ].text;
  const aiTutorState = useSelector(state => state.aiTutor);
  const systemPrompt =
    'You are a tutor in a high school computer science class. Students in the class are studying Java and they would like to know in age-appropriate, clear language why their code does not compile.';

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
      {!javalabState.hasRunOrTestedCode && (
        <h4>Run your code first and see what happens.</h4>
      )}
      {javalabState.hasRunOrTestedCode &&
        !javalabEditorState.hasCompilationError && (
          <h4>🎉 Your code is compiling successfully. Great work!</h4>
        )}
      {javalabState.hasRunOrTestedCode &&
        javalabEditorState.hasCompilationError && (
          <>
            <h4>Why didn't my code compile?</h4>
            <Button
              text="Ask AI Tutor"
              isPending={aiTutorState.isWaitingForAIResponse}
              pendingText="waiting"
              onClick={() => handleSend(studentCode)}
              disabled={!javalabEditorState.hasCompilationError}
            />
            <p id="ai-response">{aiTutorState.aiResponse}</p>
          </>
        )}
    </div>
  );
};

export default CompilationTutor;

CompilationTutor.propTypes = {
  levelId: PropTypes.number,
};
