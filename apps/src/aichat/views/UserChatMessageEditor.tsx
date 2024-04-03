import React, {useState, useCallback} from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../locale';
import {AichatState, submitChatMessage} from '../redux/aichatRedux';

import moduleStyles from './userChatMessageEditor.module.scss';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const isWaitingForChatResponse = useSelector(
    (state: {aichat: AichatState}) => state.aichat.isWaitingForChatResponse
  );

  // TODO: If systemPrompt is undefined, handle this error case.
  const dispatch = useAppDispatch();
  const handleSubmit = useCallback(() => {
    if (!isWaitingForChatResponse) {
      dispatch(submitChatMessage(userMessage));
      setUserMessage('');
    }
  }, [userMessage, dispatch, isWaitingForChatResponse]);

  return (
    <div className={moduleStyles.editorContainer}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={aichatI18n.userChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />

      <div className={moduleStyles.centerSingleItemContainer}>
        <Button
          isIconOnly
          icon={{iconName: 'paper-plane'}}
          onClick={handleSubmit}
          disabled={isWaitingForChatResponse}
        />
      </div>
    </div>
  );
};

export default UserChatMessageEditor;
