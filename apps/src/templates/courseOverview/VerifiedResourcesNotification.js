import React from 'react';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function VerifiedResourcesAnnounce() {
  return (
    <Notification
      type={NotificationType.information}
      notice={i18n.verifiedResourcesNotice()}
      details={i18n.verifiedResourcesDetails()}
      buttonText={i18n.learnMore()}
      buttonLink="https://support.code.org/hc/en-us/articles/115001550131"
      dismissible={true}
      isRtl={false}
    />
  );
}
