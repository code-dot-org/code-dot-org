import React from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './chatMessage.module.scss';

const ChatNotificationMessage: React.FunctionComponent<{
  content: React.ReactNode;
  onRemove?: () => void;
  iconName: string;
  iconClass: string;
}> = ({content, onRemove, iconName, iconClass}) => {
  // might want container class for content for spacing

  return (
    <div
      style={{
        minHeight: 25,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <div>
        <FontAwesomeV6Icon iconName={iconName} className={iconClass} />
        {content}
      </div>
      {onRemove && (
        <Button
          onClick={onRemove}
          isIconOnly
          icon={{iconName: 'xmark'}}
          size="s"
          className={moduleStyles.removeStatusUpdate}
        />
      )}
    </div>
  );
};

export default ChatNotificationMessage;
