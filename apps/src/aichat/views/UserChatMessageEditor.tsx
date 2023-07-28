import React from 'react';
import Button from '@cdo/apps/templates/Button';

const UserChatMessageEditor: React.FunctionComponent = () => {
  return (
    <div>
      <textarea
        style={{width: '80%', boxSizing: 'border-box'}}
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
