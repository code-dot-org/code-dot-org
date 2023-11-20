import React from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useSelector, useDispatch} from 'react-redux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// AI Tutor feature that explains to students why their code did not compile.
const CompilationAssistant = props => {
  const levelId = props.levelId;
  const dispatch = useDispatch();
  const javalabState = useSelector(state => state.javalabEditor);
  const studentCode =
    javalabState.sources[javalabState.fileMetadata[javalabState.activeTabKey]]
      .text;
  const aiTutorState = useSelector(state => state.aiTutor);

  const handleSend = async studentCode => {
    dispatch(askAITutor(studentCode));
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION, {
      levelId: levelId,
    });
  };

  return (
    <div className={style.compilationAssistant}>
      <h4>Why didn't my code compile?</h4>
      <Button
        text="Ask AI Tutor"
        isPending={aiTutorState.isWaitingForAIResponse}
        pendingText="waiting"
        onClick={() => handleSend(studentCode)}
        disabled={!javalabState.hasCompilationError}
      />
      <p id="ai-response">{aiTutorState.aiResponse}</p>
    </div>
  );
};

CompilationAssistant.propTypes = {
  levelId: PropTypes.int,
};

export default CompilationAssistant;
