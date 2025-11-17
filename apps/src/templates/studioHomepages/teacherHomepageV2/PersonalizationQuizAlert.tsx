import Alert from '@code-dot-org/component-library/alert';
import React from 'react';

import i18n from '@cdo/locale';

export const BANNER_STATUS = Object.freeze({
  // The initial status of the banner. It means that the status has not been set yet.
  UNSET: '',
  // The status when the banner is not available. This is typically when the user does not have access to the feature.
  // e.g. the teacher is not an LTI teacher.
  UNAVAILABLE: 'unavailable',
  // The status when the banner is displayed but the user has not yet provided feedback.
  UNANSWERED: 'unanswered',
  // The status when the user has provided feedback.
  ANSWERED: 'answered',
  // The status when the user has previously submitted feedback and the banner is not shown.
  PREVIOUSLY_ANSWERED: 'previously_answered',
});

const PersonalizationQuizAlert: React.FC = () => {
  return (
    <Alert
      aria-labelledby="feedback-banner-title"
      showIcon={true}
      icon={{
        iconName: 'user-circle',
      }}
      type={'primary'}
      text={i18n.personalizationInvitation()}
      link={{
        text: i18n.personalizationLinkText(),
        href: '/users/personalization_information',
      }}
    />
  );
};

export default PersonalizationQuizAlert;
