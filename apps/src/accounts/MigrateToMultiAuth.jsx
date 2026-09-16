import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

export default function MigrateToMultiAuth() {
  return (
    <NotificationBanner
      variant="info"
      style="filled"
      title={i18n.migrateToMultiAuth_notice_v2()}
      description={i18n.migrateToMultiAuth_details_v2()}
      icon={{iconName: 'circle-info', iconStyle: 'solid'}}
      actions={
        <MuiButton
          href="/users/migrate_to_multi_auth"
          variant="contained"
          color="primary"
          size="small"
        >
          {i18n.migrateToMutiAuth_buttonText_v2()}
        </MuiButton>
      }
    />
  );
}
