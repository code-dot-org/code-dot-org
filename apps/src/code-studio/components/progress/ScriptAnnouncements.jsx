import React, { PropTypes } from 'react';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function ScriptAnnouncements({announcements}) {
  return (
    <div>
      {announcements.map((announcement, index) => (
        <Notification
          key={index}
          type={announcement.type}
          notice={announcement.notice}
          details={announcement.details}
          buttonText={i18n.learnMore()}
          buttonLink={announcement.link}
          dismissible={true}
          width={1100}
        />
      ))}
    </div>
  );
}

ScriptAnnouncements.propTypes = {
  announcements: PropTypes.arrayOf(announcementShape).isRequired,
};
