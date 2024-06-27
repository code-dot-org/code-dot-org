import classNames from 'classnames';
import React from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import styles from './chat-notification-message.module.scss';

const ChatNotificationMessage: React.FunctionComponent<{
  content: React.ReactNode;
  onRemove?: () => void;
  iconName: string;
  iconClass: string;
  containerClass: string;
}> = ({content, onRemove, iconName, iconClass, containerClass}) => {
  return (
    <div className={classNames(styles.container, containerClass)}>
      <div>
        <FontAwesomeV6Icon
          iconName={iconName}
          className={classNames(iconClass, styles.icon)}
        />
        {content}
      </div>
      {onRemove && (
        <Button
          onClick={onRemove}
          isIconOnly
          icon={{iconName: 'xmark'}}
          size="s"
          className={styles.removeButton}
        />
      )}
    </div>
  );
};

export default ChatNotificationMessage;
