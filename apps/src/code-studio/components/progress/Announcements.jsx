import Link from '@code-dot-org/component-library/link';
import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {
  announcementShape,
  VisibilityType,
} from '@cdo/apps/code-studio/announcementsRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import i18n from '@cdo/locale';

const NOTIFICATION_VARIANT_BY_TYPE = {
  default: 'primary',
  information: 'info',
  success: 'success',
  failure: 'error',
  warning: 'warning',
  course: 'brand',
  bullhorn: 'info',
  bullhorn_yellow: 'warning',
  feedback: 'brand',
  collaborate: 'primary',
};

const NOTIFICATION_ICON_BY_TYPE = {
  default: 'circle-info',
  information: 'circle-info',
  success: 'circle-check',
  failure: 'triangle-exclamation',
  warning: 'triangle-exclamation',
  course: 'circle-info',
  bullhorn: 'bullhorn',
  bullhorn_yellow: 'triangle-exclamation',
  feedback: 'envelope',
  collaborate: 'users',
};

export default class Announcements extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
  };

  state = {
    dismissedKeys: new Set(),
  };

  dismiss = key => {
    this.setState(prev => {
      const dismissedKeys = new Set(prev.dismissedKeys);
      dismissedKeys.add(key);
      return {dismissedKeys};
    });
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
        {this.filteredAnnouncements().map((announcement, index) => {
          const dismissible =
            announcement.dismissible === undefined
              ? true
              : announcement.dismissible;
          const buttonText =
            announcement.buttonText === undefined
              ? i18n.learnMore()
              : announcement.buttonText;
          const key = announcement.key || index;
          if (this.state.dismissedKeys.has(key)) {
            return null;
          }
          return (
            <NotificationBanner
              key={key}
              className="announcement-notification"
              variant={
                NOTIFICATION_VARIANT_BY_TYPE[announcement.type] || 'info'
              }
              style="filled"
              title={announcement.notice}
              description={announcement.details}
              icon={{
                iconName:
                  NOTIFICATION_ICON_BY_TYPE[announcement.type] || 'circle-info',
                iconStyle: 'solid',
              }}
              actions={
                announcement.link && (
                  <Link
                    href={announcement.link}
                    text={buttonText}
                    type="secondary"
                    size="s"
                    openInNewTab
                  />
                )
              }
              onClose={dismissible ? () => this.dismiss(key) : undefined}
            />
          );
        })}
      </div>
    );
  }
}
