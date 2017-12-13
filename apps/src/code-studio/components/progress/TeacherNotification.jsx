import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import i18n from '@cdo/locale';

function TeacherNotification({viewAs}) {
  if (viewAs !== ViewType.Teacher) {
    return null;
  }
  return (
    <Notification
      type={NotificationType.information}
      notice="This course has recently been updated!"
      details="See what changed and how it may affect your classroom."
      buttonText={i18n.learnMore()}
      buttonLink="https://support.code.org/hc/en-us/articles/115001931251"
      dismissible={true}
      width={1100}
    />
  );
}
TeacherNotification.propTypes = {
  viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
};

export default connect(state => ({
  viewAs: state.viewAs
}))(TeacherNotification);
