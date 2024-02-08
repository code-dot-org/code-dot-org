import React from 'react';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {AITutorState, askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {JavalabEditorState} from '@cdo/apps/javalab/redux/editorRedux';
import {JavalabState} from '@cdo/apps/javalab/redux/javalabRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {validationSystemPrompt} from '@cdo/apps/aiTutor/constants';
import {TutorTypes} from '@cdo/apps/aiTutor/types';

// AI Tutor feature that explains to students why their code is not passing tests.

const ValidationTutor: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const sources = useSelector(
    (state: {javalabEditor: JavalabEditorState}) => state.javalabEditor.sources
  );
  const fileMetadata = useSelector(
    (state: {javalabEditor: JavalabEditorState}) =>
      state.javalabEditor.fileMetadata
  );
  const activeTabKey = useSelector(
    (state: {javalabEditor: JavalabEditorState}) =>
      state.javalabEditor.activeTabKey
  );
  const studentCode = sources[fileMetadata[activeTabKey]].text;
  const hasCompilationError = useSelector(
    (state: {javalabEditor: JavalabEditorState}) =>
      state.javalabEditor.hasCompilationError
  );
  const hasRunOrTestedCode = useSelector(
    (state: {javalab: JavalabState}) => state.javalab.hasRunOrTestedCode
  );
  const validationPassed = useSelector(
    (state: {javalab: JavalabState}) => state.javalab.validationPassed
  );
  const isWaitingForAIResponse = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.isWaitingForAIResponse
  );
  const aiResponse = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.aiResponse
  );
  const level = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.level
  );
  const scriptId = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.scriptId
  );

  const systemPrompt = validationSystemPrompt;

  const handleSend = async (studentCode: string) => {
    const chatContext = {
      levelId: level?.id,
      scriptId: scriptId,
      isProjectBacked: level?.isProjectBacked,
      systemPrompt: systemPrompt,
      studentCode: studentCode,
      tutorType: TutorTypes.VALIDATION,
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
