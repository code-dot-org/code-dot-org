import React, {Component} from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default class LessonExtrasNotification extends Component {
  render() {
    return (
      <Notification
        type={NotificationType.information}
        notice={i18n.stageExtras()}
        details={i18n.lessonExtrasDetails()}
        buttonText={i18n.lessonExtrasButton()}
        buttonLink="/home#classroom-sections"
        dismissible={true}
      />
    );
  }
}
