import React from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';

import EmptyNotificationList from './EmptyNotificationList';
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
        const loadedNotifications =
          response?.value
            ?.map(n => ({
              ...n,
              publishedAt: new Date(n.publishedAt),
              readAt: n.readAt ? new Date(n.readAt) : null,
            }))
            .sort(
              (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
            ) || [];
        setNotifications(loadedNotifications);
      })
      .catch(error => {
        console.error('Error fetching notifications for list:', error);
        setNotifications([]);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    const unreadNotifications = notifications.filter(n => n.readAt === null);
    if (unreadNotifications.length > 0) {
      const unreadExternalIds = unreadNotifications
        .filter(n => !!n.externalId)
        .map(n => n.externalId);

      const unreadTeacherNotificationIds = unreadNotifications
        .filter(n => !n.externalId)
        .map(n => n.id);
      const payload = {
        external_notification_ids: unreadExternalIds,
        teacher_notification_ids: unreadTeacherNotificationIds,
      };

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
    return <EmptyNotificationList />;
  }

  return (
    <div className={styles.listContainer}>
      <ol className={styles.list}>
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
              key={notification.externalId || notification.id}
              aiPromptClick={aiPromptClick}
            />
          ))
        )}
      </ol>
    </div>
  );
};

export default AiDiffNotificationList;
