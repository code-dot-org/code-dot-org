import React from 'react';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useSelector, useDispatch} from 'react-redux';

// AI Tutor feature that explains to students why their code is not passing tests.
const ValidationTutor = () => {
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
  };

  return (
    <div className={style.compilationAssistant}>
      {!javalabState.hasRunOrTestedCode && (
        <h4>Test your code first and see what happens.</h4>
      )}
      {javalabState.validationPassed && (
        <h4>🎉 Your tests are passing. Wahoo!</h4>
      )}
      {javalabState.hasRunOrTestedCode && !javalabState.validationPassed && (
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
