import Modal from '@code-dot-org/component-library/modal';
import React, {useEffect} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import announcementImage from './images/ta-assessments-launch-graphic.jpg';

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

  const handleButtonClick = () => {
    // wait for the post request to complete before navigating, otherwise the
    // post request may be cancelled when navigation occurs.
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_ANNOUNCEMENT_CLICKED);
    postAnnouncementSeen().finally(() => {
      navigateToHref('https://code.org/ai/teaching-assistant');
    });
  };

  return (
    <Modal
      id="uitest-ai-assessments-announcement"
      onClose={handleClose}
      imageUrl={announcementImage}
      imageAlt=""
      imagePlacement="top"
      title={i18n.aiAssessmentsAnnouncementHeading()}
      description={i18n.aiAssessmentsAnnouncementBody()}
      primaryButtonProps={{
        variant: 'contained',
        color: 'primary',
        className: 'learn-more-button',
        onClick: handleButtonClick,
        size: 'large',
        children: i18n.learnMore(),
      }}
    />
  );
}
