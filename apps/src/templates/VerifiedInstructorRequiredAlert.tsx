import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {VERIFIED_TEACHER_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Warns an unverified teacher that their students cannot open the course
 * they are assigning.
 */
const VerifiedInstructorRequiredAlert: React.FC<{
  verifiedInstructorRequired?: boolean;
}> = ({verifiedInstructorRequired}) => {
  // Undefined until the current user loads; warn only once known unverified.
  const isVerifiedInstructor = useAppSelector(
    state => state.currentUser.isVerifiedInstructor
  );

  if (!verifiedInstructorRequired || isVerifiedInstructor !== false) {
    return null;
  }

  return (
    <Alert
      text="This course is only available to verified teachers and their students. You can assign it, but your students will not be able to open it until you become a verified teacher."
      type={alertTypes.warning}
      link={{
        href: VERIFIED_TEACHER_SUPPORT_LINK,
        text: 'Learn how to become a verified teacher',
        openInNewTab: true,
      }}
      icon={{iconName: 'triangle-exclamation', iconStyle: 'solid'}}
    />
  );
};

export default VerifiedInstructorRequiredAlert;
