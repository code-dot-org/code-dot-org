import React from 'react';
import i18n from '@cdo/locale';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';

export default class MigrateToMultiAuth extends React.Component {
  render() {
    return (
      <Notification
        type={NotificationType.information}
        notice={i18n.migrateToMultiAuth_notice()}
        details={i18n.migrateToMultiAuth_details()}
        buttonText={i18n.migrateToMutiAuth_buttonText()}
        buttonLink="/users/migrate_to_multi_auth"
        dismissible={false}
      />
    );
  }
}
