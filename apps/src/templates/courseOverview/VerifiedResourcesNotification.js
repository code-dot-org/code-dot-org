import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default class VerifiedResourcesNotification extends PureComponent {
  render() {
    return (
      <Notification
        type={NotificationType.warning}
        notice={i18n.verifiedResourcesNotice()}
        details={
          this.props.inLesson
            ? i18n.verifiedResourcesLessonDetails()
            : i18n.verifiedResourcesDetails()
        }
        buttonText={i18n.learnMore()}
        buttonLink="https://support.code.org/hc/en-us/articles/115001550131"
        dismissible={true}
        width={this.props.width}
      />
    );
  }
}
VerifiedResourcesNotification.propTypes = {
  width: PropTypes.number,
  inLesson: PropTypes.bool
};
