import React from 'react';
import Button from '@cdo/apps/templates/Button';

const UserChatMessageEditor: React.FunctionComponent = () => {
  return (
    <div style={styles.messageEditor}>
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

const styles = {
  messageEditor: {
    bottom: 0,
    width: '100%',
  },
};

export default UserChatMessageEditor;
