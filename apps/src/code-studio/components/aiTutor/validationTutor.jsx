import React from 'react';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useSelector, useDispatch} from 'react-redux';

// AI Tutor feature that explains to students why their code is not passing tests.
const ValidationTutor = () => {
  const dispatch = useDispatch();
  const javalabState = useSelector(state => state.javalabEditor);
  const studentCode =
    javalabState.sources[javalabState.fileMetadata[javalabState.activeTabKey]]
      .text;
  const aiTutorState = useSelector(state => state.aiTutor);

  const handleSend = async studentCode => {
    dispatch(askAITutor(studentCode));
  };

  return (
    <div className={style.compilationAssistant}>
      <h4>Why aren't my tests passing?</h4>
      <Button
        text="Ask AI Tutor"
        isPending={aiTutorState.isWaitingForAIResponse}
        pendingText="waiting"
        onClick={() => handleSend(studentCode)}
        disabled={true}
      />
      <p id="ai-response">{aiTutorState.aiResponse}</p>
    </div>
  );
};

export default ValidationTutor;
