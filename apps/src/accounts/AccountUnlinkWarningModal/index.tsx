import React from 'react';
import {Fade} from 'react-bootstrap';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {AccountUnlinkWarningModalProps} from './types';

import styles from './accountUnlinkWarningModal.module.scss';

const AccountUnlinkWarningModal = ({
  lmsName,
  authOptionId,
  isOpen = false,
  onClose,
}: AccountUnlinkWarningModalProps) => {
  const handleSubmit = async () => {
    analyticsReporter.sendEvent(
      'lti_unlink_click',
      {lms_name: lmsName},
      PLATFORMS.STATSIG
    );

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
    analyticsReporter.sendEvent(
      'lti_unlink_cancel',
      {lms_name: lmsName},
      PLATFORMS.STATSIG
    );
    onClose();
  };

  return (
    <Fade in={isOpen} mountOnEnter unmountOnExit>
      <AccessibleDialog onClose={onClose}>
        <Typography
          semanticTag="h4"
          visualAppearance="heading-sm"
          className={styles.warningTitle}
        >
          {i18n.manageLinkedAccounts_warning_title({lmsName})}
        </Typography>
        <hr className={styles.line} />
        <Typography
          semanticTag="p"
          visualAppearance="body-two"
          className={styles.warningText}
        >
          {i18n.manageLinkedAccounts_warning_body({lmsName})}
        </Typography>
        <Typography semanticTag="p" visualAppearance="body-two">
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
