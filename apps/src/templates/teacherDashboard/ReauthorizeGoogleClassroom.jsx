import React from 'react';

import locale from '@cdo/locale';

import ReauthorizeProviderButton from './ReauthorizeProviderButton';

const REAUTHORIZE_URL =
  '/users/auth/google_oauth2?scope=userinfo.email,userinfo.profile,classroom.courses.readonly,classroom.rosters.readonly';

function ReauthorizeGoogleClassroom() {
  return (
    <ReauthorizeProviderButton
      url={REAUTHORIZE_URL}
      label={locale.authorizeGoogleClassrooms()}
    />
  );
}

export default ReauthorizeGoogleClassroom;
