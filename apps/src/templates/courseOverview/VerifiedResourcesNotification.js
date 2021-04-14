import PropTypes from 'prop-types';
import React from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function VerifiedResourcesNotification({
  width,
  inLesson = false
}) {
  return (
    <Notification
      type={NotificationType.warning}
      notice={i18n.verifiedResourcesNotice()}
      details={
        inLesson
          ? i18n.verifiedResourcesLessonDetails()
          : i18n.verifiedResourcesDetails()
      }
      buttonText={i18n.learnMore()}
      buttonLink="https://support.code.org/hc/en-us/articles/115001550131"
      dismissible={true}
      width={width}
    />
  );
}
VerifiedResourcesNotification.propTypes = {
  width: PropTypes.number,
  inLesson: PropTypes.bool
};
