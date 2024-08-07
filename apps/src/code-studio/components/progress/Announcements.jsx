import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {
  announcementShape,
  VisibilityType,
} from '@cdo/apps/code-studio/announcementsRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Notification from '@cdo/apps/sharedComponents/Notification';
import i18n from '@cdo/locale';

export default class Announcements extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    firehoseAnalyticsData: PropTypes.object,
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
    (currentView === ViewType.Instructor &&
      (element.visibility === VisibilityType.teacher ||
        element.visibility === undefined)) ||
    (currentView === ViewType.Participant &&
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
            buttonText={
              announcement.buttonText === undefined
                ? i18n.learnMore()
                : announcement.buttonText
            }
            buttonLink={announcement.link}
            dismissible={
              announcement.dismissible === undefined
                ? true
                : announcement.dismissible
            }
            width={this.props.width}
            firehoseAnalyticsData={this.props.firehoseAnalyticsData}
          />
        ))}
      </div>
    );
  }
}
