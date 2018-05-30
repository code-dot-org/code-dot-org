import React, { PropTypes } from 'react';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function ScriptAnnouncements({announcements, width}) {
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
          width={width}
        />
      ))}
    </div>
  );
}

ScriptAnnouncements.propTypes = {
  announcements: PropTypes.arrayOf(announcementShape).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
