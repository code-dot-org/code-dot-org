import $ from 'jquery';
import {renderCourseProgress} from '@cdo/apps/code-studio/progress';
import {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import plcHeaderReducer, {
  setPlcHeader
} from '@cdo/apps/code-studio/plc/plcHeaderRedux';
import announcementsReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import locales, {setLocaleEnglishName} from '../../../../redux/localesRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const {scriptData, plcBreadcrumb} = config;
  const store = getStore();
  registerReducers({locales});
  store.dispatch(setLocaleEnglishName(scriptData.locale));

  if (plcBreadcrumb) {
    // Dispatch breadcrumb props so that ScriptOverviewHeader can add the breadcrumb
    // as appropriate
    registerReducers({plcHeader: plcHeaderReducer});
    store.dispatch(
      setPlcHeader(plcBreadcrumb.unit_name, plcBreadcrumb.course_view_path)
    );
  }

  if (scriptData.has_verified_resources) {
    store.dispatch(setVerifiedResources(true));
  }

  if (scriptData.is_verified_teacher) {
    store.dispatch(setVerified());
  }

  if (scriptData.script_announcements) {
    registerReducers({announcements: announcementsReducer});
    scriptData.script_announcements.forEach(announcement =>
      store.dispatch(
        addAnnouncement(
          announcement.notice,
          announcement.details,
          announcement.link,
          announcement.type,
          announcement.visibility
        )
      )
    );
  }

  renderCourseProgress(scriptData);
}
