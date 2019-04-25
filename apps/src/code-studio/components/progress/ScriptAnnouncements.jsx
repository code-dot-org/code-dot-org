import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {announcementShape} from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default class ScriptAnnouncements extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // userId is used to track whether the user has
    // dismissed this particular notification
    // so we don't show it multiple times.
    userId: PropTypes.number,
  };

  onDismissAnnouncement = (userId, announcementId) => {
    // Shovel the id of the dismissed announcement into the user's dismissed announcements array. Make an api call
    $.post(`/api/v1/users/${userId}/dismiss_announcement/${announcementId}`, {
    user_id: userId,
     announcement_id: announcementId
   });
  }

  render() {
    return (
      <div>
        {this.props.announcements.map((announcement, index) => (
          <Notification
            key={index}
            type={announcement.type}
            notice={announcement.notice}
            details={announcement.details}
            buttonText={i18n.learnMore()}
            buttonLink={announcement.link}
            dismissible={true}
            onDismiss={() => this.onDismissAnnouncement(this.props.userId, 100)}
            width={this.props.width}
          />
        ))}
      </div>
    );
  }
}
