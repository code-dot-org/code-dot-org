const ADD_ANNOUNCEMENT = 'scriptAnnouncements/ADD_ANNOUNCEMENT';
export const addAnnouncement = (notice, details, link, type) => ({
  type: ADD_ANNOUNCEMENT,
  notice,
  details,
  link,
  announcementType: type,
});

export default function scriptAnnouncements(state=[], action) {
  if (action.type === ADD_ANNOUNCEMENT) {
    return state.concat({
      notice: action.notice,
      details: action.details,
      link: action.link,
      type: action.announcementType,
    });
  }

  return state;
}
