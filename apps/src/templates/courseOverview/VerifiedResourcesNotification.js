import React from 'react';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';

export default function VerifiedResourcesAnnounce() {
  return (
    <Notification
      type={NotificationType.information}
      notice="Accessing locked lessons and answer keys"
      details="This course provides extra resources which are only available to verified teachers."
      buttonText="Learn More"
      buttonLink="https://support.code.org/hc/en-us/articles/115001550131"
      dismissible={true}
      isRtl={false}
    />
  );
}
