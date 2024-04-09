import React, {useState, useCallback} from 'react';
import style from './ai-tutor.module.scss';
import Button from '@cdo/apps/templates/Button';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {askAITutor} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

// TODO: Use AITutorTypes here
// import {AITutorTypes as TutorTypes} from '@cdo/apps/aiTutor/types';

const ActionType = {
  GENERAL_SEND: 'general_send',
  COMPILE: 'compile',
  VALIDATE: 'validate',
};

const QuickActions = {
  [ActionType.COMPILE]: "Why doesn't my code compile?",
  [ActionType.VALIDATE]: "Why aren't my tests passing?",
};

interface AITutorFooterProps {}

const AITutorFooter: React.FC<AITutorFooterProps> = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useAppSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const tutorType = useAppSelector(state => state.aiTutor.selectedTutorType);

  const level = useAppSelector(state => state.aiTutor.level);

  const sources = useAppSelector(state => state.javalabEditor.sources);
  const fileMetadata = useAppSelector(
    state => state.javalabEditor.fileMetadata
  );
  const activeTabKey = useAppSelector(
    state => state.javalabEditor.activeTabKey
  );
  const studentCode = sources[fileMetadata[activeTabKey]].text;

  // const hasCompilationError = useAppSelector(
  //   state => state.javalabEditor.hasCompilationError
  // );
  // const hasRunOrTestedCode = useAppSelector(
  //   state => state.javalab.hasRunOrTestedCode
  // );
  // const isRunning = useAppSelector(state => state.javalab.isRunning);
  // const validationPassed = useAppSelector(
  //   state => state.javalab.validationPassed
  // );

  const dispatch = useAppDispatch();

  // TODO: Uncomment actual conditions
  const showCompilationOption = true; // !isRunning && hasRunOrTestedCode && hasCompilationError;
  const showValidationOption = true; // hasRunOrTestedCode && !hasCompilationError && !validationPassed;

  const handleSubmit = useCallback(
    (actionType = ActionType.GENERAL_SEND) => {
      if (isWaitingForChatResponse) {
        return;
      }

      let studentInput = '';
      let event = '';

      switch (actionType) {
        case ActionType.COMPILE:
          studentInput = QuickActions[ActionType.COMPILE];
          event = EVENTS.AI_TUTOR_ASK_ABOUT_COMPILATION;
          break;
        case ActionType.VALIDATE:
          studentInput = QuickActions[ActionType.VALIDATE];
          event = EVENTS.AI_TUTOR_ASK_ABOUT_VALIDATION;
          break;
        case ActionType.GENERAL_SEND:
        default:
          studentInput = userMessage;
          event = EVENTS.AI_TUTOR_ASK_GENERAL_CHAT;
          break;
      }

      const additionalContext =
        actionType !== ActionType.GENERAL_SEND ? studentCode : '';

      const chatContext = {
        studentInput: studentInput,
        additionalContext: additionalContext,
        tutorType: tutorType,
      };

      console.log('chatContext', chatContext);
      dispatch(askAITutor(chatContext));
      setUserMessage('');

      analyticsReporter.sendEvent(event, {
        levelId: level?.id,
        levelType: level?.type,
      });
    },
    [
      userMessage,
      studentCode,
      isWaitingForChatResponse,
      level,
      tutorType,
      dispatch,
    ]
  );

  return (
    <div className={style.aiTutorFooter}>
      <textarea
        className={style.textArea}
        // TODO: Update to support i18n
        placeholder={'Add a chat message...'}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />
      <div className={style.submitToStudentButtonAndError}>
        <Button
          className={style.submitToStudentButton}
          color={Button.ButtonColor.brandSecondaryDefault}
          disabled={isWaitingForChatResponse}
          icon="arrow-up"
          key="submit"
          onClick={handleSubmit}
          text="Submit"
        />
        {/*TODO: Add error handling*/}
      </div>
      {/* TODO: Get these working */}
      <div>
        {showCompilationOption && (
          <Button
            text={QuickActions.compile}
            onClick={() => handleSubmit(ActionType.COMPILE)}
          />
        )}
        {showValidationOption && (
          <Button
            text={QuickActions.validate}
            onClick={() => handleSubmit(ActionType.VALIDATE)}
          />
        )}
      </div>
    </div>
  );
};

export default AITutorFooter;
