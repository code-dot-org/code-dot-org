import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import i18n from '@cdo/locale';

import {VERIFIED_RESOURCES_URL} from './VerifiedResourcesNotification';

import styles from './courseScript.module.scss';

const RequiresVerifiedTeacherAccessNotification = () => (
  <NotificationBanner
    variant="error"
    style="filled"
    fullWidth={false}
    title={i18n.requiresVerifiedTeacherAccessNotice()}
    description={i18n.requiresVerifiedTeacherAccessDetails()}
    className={classNames(
      styles.verifiedResourcesNotification,
      'announcement-notification'
    )}
    icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
    actions={
      <Button
        href={VERIFIED_RESOURCES_URL}
        variant="outlined"
        color="secondary"
        size="small"
        target="_blank"
        rel="noopener noreferrer"
      >
        {i18n.learnMore()}
      </Button>
    }
  />
);

export default RequiresVerifiedTeacherAccessNotification;
