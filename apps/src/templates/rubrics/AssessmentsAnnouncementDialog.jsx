import React, {useEffect} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import HttpClient from '@cdo/apps/util/HttpClient';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import announcementImage from './images/ta-assessments-launch-graphic.jpg';

import styles from './rubrics.module.scss';

export default function AssessmentsAnnouncementDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(true);

  useEffect(() => {
    if (dialogOpen) {
      analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_ANNOUNCEMENT_VIEWED);
    }
  }, [dialogOpen]);

  if (!dialogOpen) {
    return null;
  }

  // post to the server indicating the announcement has been seen.
  // @return {Promise} A promise that resolves when the post request completes.
  const postAnnouncementSeen = () => {
    const url = '/api/v1/users/has_seen_ai_assessments_announcement';
    return HttpClient.post(url, null, true);
  };

  const handleClose = () => {
    // dialog should close immediately, before post request completes
    setDialogOpen(false);
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_ANNOUNCEMENT_DISMISSED);
    postAnnouncementSeen();
  };
  const handleDismiss = handleClose;

  const handleButtonClick = () => {
    // wait for the post request to complete before navigating, otherwise the
    // post request may be cancelled when navigation occurs.
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_ANNOUNCEMENT_CLICKED);
    postAnnouncementSeen().finally(() => {
      navigateToHref('https://code.org/ai/teaching-assistant');
    });
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
        id="uitest-ai-assessments-announcement"
      >
        <img
          src={announcementImage}
          className={styles.announcementImage}
          alt=""
        />
        <Heading2>{i18n.aiAssessmentsAnnouncementHeading()}</Heading2>
        <BodyTwoText className={styles.announcementBody}>
          {i18n.aiAssessmentsAnnouncementBody()}
        </BodyTwoText>
        <Button
          className="learn-more-button"
          text={i18n.learnMore()}
          onClick={handleButtonClick}
          type="primary"
          size="l"
        />
      </div>
    </AccessibleDialog>
  );
}
