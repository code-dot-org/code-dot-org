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
  };

  /*
  Processes all of the announcements and determines if they should be shown based
  on the their visibility setting and the current view. For example a teacher should only see
  announcements for Teacher-only or Teacher and Student.
  Also defaults to old announcements without a visibility to be Teacher-only.
 */
  filteredAnnouncements = () => {
    const currentAnnouncements = [];
    const currentView = this.props.viewAs;
    this.props.announcements.forEach(element => {
      if (element.visibility === VisibilityType.teacherAndStudent) {
        currentAnnouncements.push(element);
      } else if (
        currentView === 'Teacher' &&
        (element.visibility === VisibilityType.teacher ||
          element.visibility === undefined)
      ) {
        currentAnnouncements.push(element);
      } else if (
        currentView === 'Student' &&
        element.visibility === VisibilityType.student
      ) {
        currentAnnouncements.push(element);
      }
    });
    return currentAnnouncements;
  };

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
          />
        ))}
      </div>
    );
  }
}
