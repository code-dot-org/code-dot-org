import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import style from './ai-tutor.module.scss';
import {submitChatMessage} from '@cdo/apps/aiTutor/redux/aiTutorRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {useSelector} from 'react-redux';

/**
 * Renders the AI Tutor user chat message editor component.
 */
const UserChatMessageEditor = ({levelId, isProjectBacked, scriptId}) => {
  const [userMessage, setUserMessage] = useState('');

  const isWaitingForChatResponse = useSelector(
    state => state.aiTutor.isWaitingForChatResponse
  );

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      const chatContext = {
        levelId: levelId,
        scriptId: scriptId,
        isProjectBacked: isProjectBacked,
        message: userMessage,
      };
      dispatch(submitChatMessage(chatContext));
      setUserMessage('');
    }
  }, [
    userMessage,
    dispatch,
    isWaitingForChatResponse,
    levelId,
    scriptId,
    isProjectBacked,
  ]);

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
    </div>
  );
};

export default UserChatMessageEditor;

UserChatMessageEditor.propTypes = {
  levelId: PropTypes.number,
  scriptId: PropTypes.number,
  isProjectBacked: PropTypes.bool,
};
