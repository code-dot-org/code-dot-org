import PropTypes from 'prop-types';
import {NotificationType} from '@cdo/apps/templates/Notification';

const ADD_ANNOUNCEMENT = 'announcements/ADD_ANNOUNCEMENT';

export const addAnnouncement = (notice, details, link, type, visibility) => ({
  type: ADD_ANNOUNCEMENT,
  notice,
  details,
  link,
  announcementType: type,
  visibilityType: visibility
});

export const VisibilityType = {
  teacher: 'Teacher-only',
  student: 'Student-only',
  teacherAndStudent: 'Teacher and student'
};

export const announcementShape = PropTypes.shape({
  notice: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(NotificationType)).isRequired,
  visibility: PropTypes.oneOf(Object.values(VisibilityType))
});

export default function announcements(state = [], action) {
  if (action.type === ADD_ANNOUNCEMENT) {
    return state.concat({
      notice: action.notice,
      details: action.details,
      link: action.link,
      type: action.announcementType,
      visibility: action.visibilityType
    });
  }

  return state;
}
