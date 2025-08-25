import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import {AiDiffNotification} from './AiDiffNotificationList';

import styles from './notifications.module.scss';

const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return i18n.today();
  } else if (diffDays === 1) {
    return i18n.yesterday();
  } else {
    return i18n.daysAgo({numDays: diffDays});
  }
};

const Notification: React.FC<{
  notification: AiDiffNotification;
}> = ({notification}) => {
  return (
    <div className={styles.notification}>
      <FontAwesomeV6Icon
        iconName={notification.iconName}
        iconStyle="solid"
        className={styles.icon}
      />
      <p className={styles.text}>
        <BodyThreeText noMargin>
          <StrongText>
            {notification.title}
            {': '}
          </StrongText>
          {notification.description}
        </BodyThreeText>
      </p>
      <BodyThreeText className={styles.date} noMargin>
        {getRelativeTimeString(notification.publishedAt).toLocaleUpperCase()}
      </BodyThreeText>
      {notification.readAt !== null ? (
        <FontAwesomeV6Icon
          iconName="circle"
          iconStyle="solid"
          className={styles.readAt}
        />
      ) : (
        <div className={styles.readAt} />
      )}
    </div>
  );
};

export default Notification;
