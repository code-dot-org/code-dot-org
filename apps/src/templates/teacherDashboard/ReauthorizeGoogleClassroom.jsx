import React from 'react';

import locale from '@cdo/locale';

import RailsAuthenticityToken from '../../lib/util/RailsAuthenticityToken';
import color from '../../util/color';

const REAUTHORIZE_URL =
  '/users/auth/google_oauth2?scope=userinfo.email,userinfo.profile,classroom.courses.readonly,classroom.rosters.readonly';

const ctaButtonStyle = {
  background: color.orange,
  color: color.white,
  border: '1px solid #b07202',
  borderRadius: 3,
  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
  fontSize: 14,
  padding: '8px 20px',
};

function ReauthorizeGoogleClassroom() {
  return (
    <form method="POST" action={REAUTHORIZE_URL}>
      <RailsAuthenticityToken />
      <button type="submit" style={ctaButtonStyle}>
        {locale.authorizeGoogleClassrooms()}
      </button>
    </form>
  );
}

export default ReauthorizeGoogleClassroom;
