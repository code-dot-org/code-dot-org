// import PropTypes from 'prop-types';
import React from 'react';
// import {connect} from 'react-redux';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
// import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
// import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
// import {
//   setHasSeenProgressTableInvite,
//   setDateProgressTableInvitationDelayed,
//   setShowProgressTableV2,
// } from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

import announcementImage from './images/ta-assessments-launch-graphic.jpg';

import styles from './rubrics.module.scss';

export const AssessmentsAnnouncementDialog = () => {
  // TODO: check per-user setting
  const [dialogOpen, setDialogOpen] = React.useState(true);

  if (!dialogOpen) {
    return null;
  }

  const handleClose = () => {
    setDialogOpen(false);
  };
  const handleDismiss = handleClose;

  const handleButtonClick = () => {
    window.location.href = 'https://code.org/ai/teaching-assistant';
  };

  return (
    <AccessibleDialog
      onClose={handleClose}
      onDismiss={handleDismiss}
      initialFocus={false}
      className={styles.announcementModal}
    >
      <div
        role="region"
        aria-label={i18n.aiAssessmentsAnnouncementHeading()}
        className={styles.announcementDialog}
      >
        <img src={announcementImage} alt="" />
        <Heading2>{i18n.aiAssessmentsAnnouncementHeading()}</Heading2>
        <BodyTwoText>{i18n.aiAssessmentsAnnouncementBody()}</BodyTwoText>
        <Button
          id="accept-invitation"
          text={i18n.learnMore()}
          onClick={handleButtonClick}
          type="primary"
          size="l"
        />
      </div>
    </AccessibleDialog>
  );
};
