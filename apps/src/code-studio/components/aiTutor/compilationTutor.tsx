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
import {compilationSystemPrompt} from '@cdo/apps/aiTutor/constants';
import {TutorTypes} from '@cdo/apps/aiTutor/types';

// AI Tutor feature that explains to students why their code did not compile.

const CompilationTutor: React.FunctionComponent = () => {
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
  const systemPrompt = compilationSystemPrompt;

  const handleSend = async (studentCode: string) => {
    const chatContext = {
      levelId: level?.id,
      scriptId: scriptId,
      isProjectBacked: level?.isProjectBacked,
      systemPrompt: systemPrompt,
      studentCode: studentCode,
      tutorType: TutorTypes.COMPILATION,
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
