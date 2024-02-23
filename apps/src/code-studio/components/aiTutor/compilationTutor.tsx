import React from 'react';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {addChatMessage, askAITutor, clearChatMessages} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {Role, Status, TutorType} from '@cdo/apps/aiTutor/types';
import ChatWorkspace from './chatWorkspace';

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
      <ChatWorkspace generalChat={false} />
      {hasRunOrTestedCode && hasCompilationError && (
        <>
          <Button
            key="submit"
            text="Submit Code"
            icon="arrow-up"
            onClick={() => handleSend(studentCode)}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </>
      )}
    </div>
  );
};

export default CompilationTutor;
