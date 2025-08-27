import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import Notification from './Notification';
import {AiDiffNotification} from './types';

import styles from './notifications.module.scss';

const AiDiffNotificationList: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [notifications, setNotifications] = React.useState<
    AiDiffNotification[]
  >([]);

  React.useEffect(() => {
    HttpClient.fetchJson<AiDiffNotification[]>('/notifications', {}, undefined)
      .then(response => {
        setLoading(false);
        const loadedNotifications = response.value.map(n => ({
          ...n,
          publishedAt: new Date(n.publishedAt),
          readAt: n.readAt ? new Date(n.readAt) : null,
        }));
        setNotifications(loadedNotifications);
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
      });
  }, []);

  if (!loading && (!notifications || notifications.length === 0)) {
    // TODO(lfm): add empty state design
    return <div className={styles.listContainer}>{'no notifications'}</div>;
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.list}>
        {loading ? (
          <>
            <Notification notification={null} key={1} />
            <Notification notification={null} key={2} />
            <Notification notification={null} key={3} />
          </>
        ) : (
          notifications.map(notification => (
            <Notification notification={notification} key={notification.id} />
          ))
        )}
      </div>
    </div>
  );
};

export default AiDiffNotificationList;
