import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import Notification from './Notification';
import {AiDiffNotification} from './types';

import styles from './notifications.module.scss';

interface AiDiffNotificationListProps {
  aiPromptClick: (label: string, prompt: string) => void;
}

const AiDiffNotificationList: React.FC<AiDiffNotificationListProps> = ({
  aiPromptClick,
}) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [notifications, setNotifications] = React.useState<
    AiDiffNotification[]
  >([]);

  React.useEffect(() => {
    HttpClient.fetchJson<AiDiffNotification[]>('/notifications', {}, undefined)
      .then(response => {
        setLoading(false);
        const loadedNotifications = response?.value?.map(n => ({
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

  React.useEffect(() => {
    const unreadNotifications = notifications.filter(n => n.readAt === null);
    if (unreadNotifications.length > 0) {
      const unreadIds = unreadNotifications.map(n => n.externalId);
      const payload = {external_notification_ids: unreadIds};

      // We don't mark the notifications locally as read so that we still get the `unread`
      // UI state until the user refreshes.
      HttpClient.post(
        '/notifications/mark_as_read',
        JSON.stringify(payload),
        true,
        {
          'Content-Type': 'application/json; charset=UTF-8',
        }
      ).catch(error => {
        console.error('Error marking notifications as read:', error);
      });
    }
  }, [notifications]);

  if (!loading && (!notifications || notifications.length === 0)) {
    // TODO(lfm): add empty state design
    return <div className={styles.listContainer}>{'no notifications'}</div>;
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.list}>
        {loading ? (
          <>
            <Notification notification={null} key={'1'} />
            <Notification notification={null} key={'2'} />
            <Notification notification={null} key={'3'} />
          </>
        ) : (
          notifications.map(notification => (
            <Notification
              notification={notification}
              key={notification.externalId}
              aiPromptClick={aiPromptClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AiDiffNotificationList;
