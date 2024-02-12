import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {
  AITutorState,
  submitChatMessage,
} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';
import CopyButton from './copyButton';

/**
 * Renders the AI Tutor user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.isWaitingForChatResponse
  );
  const level = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.level
  );
  const scriptId = useSelector(
    (state: {aiTutor: AITutorState}) => state.aiTutor.scriptId
  );

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      const chatContext = {
        levelId: level?.id,
        scriptId: scriptId,
        isProjectBacked: level?.isProjectBacked,
        message: userMessage,
      };
      dispatch(submitChatMessage(chatContext));
      setUserMessage('');
    }
  }, [userMessage, dispatch, isWaitingForChatResponse, level, scriptId]);

  return (
    <div className={style.UserChatMessageEditor}>
      <textarea
        className={style.textArea}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />
      <Button
        key="submit"
        text="Submit"
        icon="arrow-up"
        onClick={() => handleSubmit()}
        color={Button.ButtonColor.brandSecondaryDefault}
        disabled={isWaitingForChatResponse}
      />
      <CopyButton />
    </div>
  );
};

export default UserChatMessageEditor;
