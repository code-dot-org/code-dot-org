import React from 'react';
import Button from '@cdo/apps/templates/Button';
import moduleStyles from './userChatMessageEditor.module.scss';

const UserChatMessageEditor: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.UserChatMessageEditor}>
      <textarea
        className={moduleStyles.textArea}
        placeholder="Add a chat message..."
      />
      <Button
        key="submit"
        text="Submit"
        icon="arrow-up"
        onClick={() => {
          console.log('Submit button clicked');
        }}
        color="purple"
      />
    </div>
  );
};

export default UserChatMessageEditor;
