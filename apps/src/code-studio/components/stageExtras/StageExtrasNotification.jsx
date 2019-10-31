import React, {Component} from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default class StageExtrasNotification extends Component {
  render() {
    return (
      <Notification
        type={NotificationType.information}
        notice={i18n.lessonExtras()}
        details={i18n.lessonExtrasDetails()}
        buttonText={i18n.lessonExtrasButton()}
        buttonLink="/home#classroom-sections"
        dismissible={true}
      />
    );
  }
}
