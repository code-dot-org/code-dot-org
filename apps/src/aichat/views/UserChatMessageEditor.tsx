import React, {useState, useContext} from 'react';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './userChatMessageEditor.module.scss';
import {ChatWorkspaceContext} from './ChatWorkspace';

const UserChatMessageEditor: React.FunctionComponent = () => {
  const [userMessage, setUserMessage] = useState<string>('');

  const onSubmit = useContext(ChatWorkspaceContext);

  return (
    <div className={moduleStyles.UserChatMessageEditor}>
      <textarea
        className={moduleStyles.textArea}
        placeholder="Add a chat message..."
        onChange={e => setUserMessage(e.target.value)}
        value={userMessage}
      />
      <Button
        key="submit"
        text="Submit"
        icon="arrow-up"
        onClick={() => {
          console.log('Submit button clicked');
          onSubmit('Anna', userMessage);
        }}
        color="purple"
      />
    </div>
  );
};

export default UserChatMessageEditor;
