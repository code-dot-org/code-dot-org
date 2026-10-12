import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import React from 'react';

import {
  AI_COUNTRY_AVAILABILITY_SUPPORT_LINK,
  usOnlyModelsEssentialMessage,
  CourseOrUnit,
} from '@cdo/apps/aichat/constants';

import styles from './ai-chat-tools-dependency-alerts.module.scss';

interface RequiresInaccessibleAiModelsAlertProps {
  subject: CourseOrUnit;
}

/**
 * Warns the teacher that the course or unit on this page cannot be completed
 * without AI models their region blocks.
 */
const RequiresInaccessibleAiModelsAlert: React.FC<
  RequiresInaccessibleAiModelsAlertProps
> = ({subject}) => (
  <NotificationBanner
    variant="error"
    style="filled"
    className={styles.chatToolsAlert}
    title=""
    description={
      <>
        {usOnlyModelsEssentialMessage(subject)}&nbsp;&nbsp;
        <Link
          href={AI_COUNTRY_AVAILABILITY_SUPPORT_LINK}
          text="Learn more"
          type="secondary"
          size="s"
          openInNewTab
        />
      </>
    }
    icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
  />
);

export default RequiresInaccessibleAiModelsAlert;
