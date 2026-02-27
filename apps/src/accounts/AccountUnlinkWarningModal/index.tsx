import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';
import {Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {AccountUnlinkWarningModalProps} from './types';

import styles from './style.module.scss';

const AccountUnlinkWarningModal = ({
  lmsName,
  authOptionId,
  isOpen = false,
  onClose,
}: AccountUnlinkWarningModalProps) => {
  const handleSubmit = async () => {
    analyticsReporter.sendEvent(EVENTS.LTI_UNLINK_CLICK, {lms_name: lmsName});

    await fetch('/lti/v1/account_linking/unlink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify({authentication_option_id: authOptionId}),
    });

    navigateToHref('/users/edit');
  };

  const handleCancel = () => {
    analyticsReporter.sendEvent(EVENTS.LTI_UNLINK_CANCEL, {lms_name: lmsName});
    onClose();
  };

  return (
    <Fade in={isOpen} mountOnEnter unmountOnExit>
      <AccessibleDialog onClose={onClose}>
        <Typography
          className={styles.warningTitle}
          component="h4"
          variant="h5"
          gutterBottom
        >
          {i18n.manageLinkedAccounts_warning_title({lmsName})}
        </Typography>
        <hr className={styles.line} />
        <Typography className={styles.warningText} variant="body2" gutterBottom>
          {i18n.manageLinkedAccounts_warning_body({lmsName})}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {i18n.manageLinkedAccounts_warning_instructions({lmsName})}
        </Typography>
        <hr className={styles.line} />
        <div className={styles.warningFooter}>
          <Button
            onClick={handleCancel}
            color={buttonColors.white}
            text={i18n.cancel()}
            className={styles.cancelButton}
          />
          <Button
            onClick={handleSubmit}
            color={buttonColors.purple}
            text={i18n.manageLinkedAccounts_warning_button()}
          />
        </div>
      </AccessibleDialog>
    </Fade>
  );
};

export default AccountUnlinkWarningModal;
