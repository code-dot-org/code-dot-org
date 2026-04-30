import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import i18n from '@cdo/locale';

import styles from './courseScript.module.scss';

const VERIFIED_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115001550131';

const VerifiedResourcesNotification = ({inLesson}) => {
  const [open, setOpen] = useState(true);
  if (!open) {
    return null;
  }
  return (
    <NotificationBanner
      variant="warning"
      style="filled"
      fullWidth={false}
      title={i18n.verifiedResourcesNotice()}
      className={classNames(
        styles.verifiedResourcesNotification,
        'announcement-notification'
      )}
      description={
        inLesson
          ? i18n.verifiedResourcesLessonDetails()
          : i18n.verifiedResourcesDetails()
      }
      icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
      onClose={() => setOpen(false)}
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
};

VerifiedResourcesNotification.propTypes = {
  inLesson: PropTypes.bool,
};

export default VerifiedResourcesNotification;
