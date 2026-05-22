import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';
import emptyPng from '@cdo/static/empty-notification-list.png';

import styles from './notifications.module.scss';

const EmptyNotificationList: React.FC = () => {
  return (
    <div className={styles.emptyNotificationListContainer}>
      <div className={styles.emptyNotificationList}>
        <img alt="AI bot - unread notifications" src={emptyPng} />
        <Typography variant="body2" gutterBottom>
          {i18n.noNotifications()}
        </Typography>
      </div>
    </div>
  );
};

export default EmptyNotificationList;
