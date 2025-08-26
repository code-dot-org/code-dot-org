import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import {AiDiffNotification, IconColor} from './types';

import styles from './notifications.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

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
  notification: AiDiffNotification | null;
}> = ({notification}) => {
  const isLoading = notification === null;
  const notificationOrPlaceholder: AiDiffNotification = notification || {
    id: 'placeholder',
    title: i18n.loading(),
    description: 'Lorem ipsum dolor sit amet, postea pericula',
    readAt: null,
    iconName: 'spinner',
    iconColor: IconColor.Gray,
    publishedAt: new Date(),
  };

  return (
    <div className={styles.notification}>
      <FontAwesomeV6Icon
        iconName={notificationOrPlaceholder.iconName}
        iconStyle="solid"
        className={classNames(
          styles.icon,
          styles[`icon${notificationOrPlaceholder.iconColor}`],
          isLoading && skeletonizeContent.skeletonizeContent
        )}
      />
      <p
        className={classNames(
          styles.text,
          isLoading && skeletonizeContent.skeletonizeContent
        )}
      >
        <BodyThreeText noMargin>
          <StrongText>
            {notificationOrPlaceholder.title}
            {': '}
          </StrongText>
          {notificationOrPlaceholder.description}
        </BodyThreeText>
      </p>
      <BodyThreeText
        className={classNames(
          styles.date,
          isLoading && skeletonizeContent.skeletonizeContent
        )}
        noMargin
      >
        {getRelativeTimeString(
          notificationOrPlaceholder.publishedAt
        ).toLocaleUpperCase()}
      </BodyThreeText>
      {notificationOrPlaceholder.readAt === null ? (
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
