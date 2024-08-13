import PropTypes from 'prop-types';

import {NotificationType} from '@cdo/apps/sharedComponents/Notification';

const ADD_ANNOUNCEMENT = 'announcements/ADD_ANNOUNCEMENT';

export const addAnnouncement = ({
  key,
  notice,
  details,
  link,
  type,
  visibility,
  dismissible,
  buttonText,
}) => ({
  type: ADD_ANNOUNCEMENT,
  key,
  notice,
  details,
  link,
  announcementType: type,
  visibilityType: visibility,
  dismissible,
  buttonText,
});

export const VisibilityType = {
  teacher: 'Teacher-only',
  student: 'Student-only',
  teacherAndStudent: 'Teacher and student',
};

export const announcementShape = PropTypes.shape({
  key: PropTypes.string,
  notice: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(NotificationType)).isRequired,
  visibility: PropTypes.oneOf(Object.values(VisibilityType)),
  dismissible: PropTypes.bool,
  buttonText: PropTypes.string,
});

export default function announcements(state = [], action) {
  if (action.type === ADD_ANNOUNCEMENT) {
    return state.concat({
      key: action.key,
      notice: action.notice,
      details: action.details,
      link: action.link,
      type: action.announcementType,
      visibility: action.visibilityType,
      dismissible: action.dismissible,
      buttonText: action.buttonText,
    });
  }

  return state;
}
