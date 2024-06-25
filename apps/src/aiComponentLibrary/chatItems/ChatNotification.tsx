import classNames from 'classnames';
import React, {useEffect} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {NotificationType} from './types';

import moduleStyles from './chat-notification.module.scss';

const notificationTypetoIconName: {[key in NotificationType]: string} = {
  error: 'circle-xmark',
  success: 'check-circle',
};

interface ChatNotificationProps {
  /** Markdown-enabled notification message */
  text: string;
  dismissMethod: 'auto' | 'manual';
  type: NotificationType;
  onDismiss: () => void;
  autoDismissTimeoutSeconds?: number;
}

const ChatNotification: React.FunctionComponent<ChatNotificationProps> = ({
  text,
  dismissMethod,
  type,
  onDismiss,
}) => {
  useEffect(() => {
    if (dismissMethod === 'auto') {
      const timeout = setTimeout(
        onDismiss,
        parseInt(moduleStyles.autoDismissTimeoutSeconds) * 1000
      );
      return () => clearTimeout(timeout);
    }
  }, [dismissMethod, onDismiss]);

  return (
    <div
      className={classNames(
        moduleStyles[`container-${type}`],
        dismissMethod === 'auto' && moduleStyles.autoDismiss
      )}
    >
      <div className={moduleStyles.textIconContainer}>
        <FontAwesomeV6Icon
          iconName={notificationTypetoIconName[type]}
          className={moduleStyles[`icon-${type}`]}
        />
        <SafeMarkdown markdown={text} />
      </div>
      {dismissMethod === 'manual' && (
        <Button
          onClick={onDismiss}
          isIconOnly
          icon={{iconName: 'xmark'}}
          size="s"
          className={moduleStyles.dismissButton}
        />
      )}
    </div>
  );
};

export default ChatNotification;
