import React from 'react';

import locale from '@cdo/locale';

import ReauthorizeProviderButton from './ReauthorizeProviderButton';

const REAUTHORIZE_URL = '/users/auth/clever';

function ReauthorizeClever() {
  return (
    <ReauthorizeProviderButton
      url={REAUTHORIZE_URL}
      label={locale.authorizeClever()}
    />
  );
}

export default ReauthorizeClever;
