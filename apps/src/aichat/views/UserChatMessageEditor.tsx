import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/componentLibrary/button/Button';
import moduleStyles from './user-chat-message-editor.module.scss';
import aichatI18n from '../locale';
import {submitChatContents} from '../redux/aichatRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useAppSelector(
    state => state.aichat.isWaitingForChatResponse
  );

  const dispatch = useAppDispatch();

  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      dispatch(submitChatContents(userMessage));
      setUserMessage('');
    }
  }, [isWaitingForChatResponse, dispatch, userMessage]);

  return (
    <div className={moduleStyles.editorContainer}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={aichatI18n.userChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
        disabled={isWaitingForChatResponse}
      />

      <div className={moduleStyles.centerSingleItemContainer}>
        <Button
          isIconOnly
          icon={{iconName: 'paper-plane'}}
          onClick={handleSubmit}
          disabled={isWaitingForChatResponse || !userMessage}
        />
      </div>
    </div>
  );
};

export default UserChatMessageEditor;
