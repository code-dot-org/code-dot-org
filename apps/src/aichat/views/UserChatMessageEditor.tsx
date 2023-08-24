import React, {useState, useCallback} from 'react';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import aichatI18n from '../locale';
import {submitChatMessage} from '../redux/aichatRedux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

/**
 * Renders the AI Chat Lab user chat message editor component.
 */
const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  // TODO: If systemPrompt is undefined, handle this error case.
  const dispatch = useAppDispatch();
  const handleSubmit = useCallback(() => {
    dispatch(submitChatMessage(userMessage));
    setUserMessage('');
  }, [userMessage, dispatch]);

  return (
    <div className={moduleStyles.UserChatMessageEditor}>
      <textarea
        className={moduleStyles.textArea}
        placeholder={aichatI18n.userChatMessagePlaceholder()}
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />
      <Button
        key="submit"
        text="Submit"
        icon="arrow-up"
        onClick={() => handleSubmit()}
        color={Button.ButtonColor.brandSecondaryDefault}
      />
    </div>
  );
};

export default UserChatMessageEditor;
