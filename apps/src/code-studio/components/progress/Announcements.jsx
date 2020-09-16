import PropTypes from 'prop-types';
import React from 'react';
import {announcementShape} from '@cdo/apps/code-studio/announcementsRedux';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

export default function Announcements({announcements, width}) {
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

Announcements.propTypes = {
  announcements: PropTypes.arrayOf(announcementShape).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
