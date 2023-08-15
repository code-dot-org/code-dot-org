import React, {useState, useContext, useCallback} from 'react';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import {ChatWorkspaceContext} from './ChatWorkspace';
import aichatI18n from '../locale';

const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const onSubmit = useContext(ChatWorkspaceContext)?.onSubmit;
  const handleSubmit = useCallback(() => {
    onSubmit?.(userMessage);
    setUserMessage('');
  }, [onSubmit, userMessage]);

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
