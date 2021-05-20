import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  announcementShape,
  VisibilityType
} from '@cdo/apps/code-studio/announcementsRedux';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

export default class Announcements extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    firehoseAnalyticsData: PropTypes.object
  };

  /*
  Processes all of the announcements and determines if they should be shown based
  on the their visibility setting and the current view. For example a teacher should only see
  announcements for Teacher-only or Teacher and Student.
  Also defaults old announcements without a visibility to be Teacher-only.
 */
  filteredAnnouncements = () => {
    const currentView = this.props.viewAs;
    return this.props.announcements.filter(element =>
      this.isVisible(currentView, element)
    );
  };

  isVisible = (currentView, element) =>
    element.visibility === VisibilityType.teacherAndStudent ||
    (currentView === 'Teacher' &&
      (element.visibility === VisibilityType.teacher ||
        element.visibility === undefined)) ||
    (currentView === 'Student' &&
      element.visibility === VisibilityType.student);

  render() {
    return (
      <div>
        {this.filteredAnnouncements().map((announcement, index) => (
          <Notification
            key={index}
            type={announcement.type}
            notice={announcement.notice}
            details={announcement.details}
            buttonText={i18n.learnMore()}
            buttonLink={announcement.link}
            dismissible={true}
            width={this.props.width}
            firehoseAnalyticsData={this.props.firehoseAnalyticsData}
          />
        ))}
      </div>
    );
  }
}
