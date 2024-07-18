import React from 'react';

import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function MigrateToMultiAuth() {
  return (
    <Notification
      type={NotificationType.information}
      notice={i18n.migrateToMultiAuth_notice_v2()}
      details={i18n.migrateToMultiAuth_details_v2()}
      buttonText={i18n.migrateToMutiAuth_buttonText_v2()}
      buttonLink="/users/migrate_to_multi_auth"
      dismissible={false}
    />
  );
}
