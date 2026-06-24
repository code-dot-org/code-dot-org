import Alert from '@code-dot-org/component-library/alert';
import React from 'react';

import i18n from '@cdo/locale';

export default function MigrateToMultiAuth() {
  return (
    <Alert
      type="info"
      text={
        <>
          <strong>{i18n.migrateToMultiAuth_notice_v2()}</strong>{' '}
          {i18n.migrateToMultiAuth_details_v2()}
        </>
      }
      link={{
        text: i18n.migrateToMutiAuth_buttonText_v2(),
        href: '/users/migrate_to_multi_auth',
      }}
    />
  );
}
