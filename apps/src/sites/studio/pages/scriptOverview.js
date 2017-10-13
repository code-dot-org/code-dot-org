import $ from 'jquery';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';
import { setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import { registerReducers } from '@cdo/apps/redux';
import plcHeaderReducer, { setPlcHeader } from '@cdo/apps/code-studio/plc/plcHeaderRedux';
import scriptAnnouncementReducer, { addAnnouncement } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const { scriptData, plcBreadcrumb } = config;
  const store = getStore();

  if (plcBreadcrumb) {
    // Dispatch breadcrumb props so that ScriptOverviewHeader can add the breadcrumb
    // as appropriate
    registerReducers({plcHeader: plcHeaderReducer});
    store.dispatch(setPlcHeader(plcBreadcrumb.unit_name, plcBreadcrumb.course_view_path));
  }

  if (scriptData.has_verified_resources) {
    store.dispatch(setVerifiedResources(true));
  }

  // This notification is a temporary hack we want to stick on a few courses. In
  // the future this will instead be LB configurable and we will get this data
  // from the server
  const announcementCourses = [
    'coursee',
    'coursef',
    'express'
  ];

  let announcements;
  if (announcementCourses.includes(scriptData.name)) {
    announcements = [{
      notice: "This course has recently been updated!",
      details: "See what changed and how it may affect your classroom.",
      link: "https://support.code.org/hc/en-us/articles/115001931251",
      type: 'information',
    }];
  }

  if (announcements) {
    registerReducers({scriptAnnouncements: scriptAnnouncementReducer});
    announcements.forEach(announcement =>
      store.dispatch(addAnnouncement(announcement.notice, announcement.details,
        announcement.link, announcement.type))
    );
  }

  renderCourseProgress(scriptData);
}
