import {BodyTwoText} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';
import emptyPng from '@cdo/static/empty-notification-list.png';

import styles from './notifications.module.scss';

const EmptyNotificationList: React.FC = () => {
  return (
    <div className={styles.emptyNotificationListContainer}>
      <div className={styles.emptyNotificationList}>
        <img alt="AI bot - unread notifications" src={emptyPng} />
        <BodyTwoText>{i18n.noNotifications()}</BodyTwoText>
      </div>
    </div>
  );
};

export default EmptyNotificationList;
