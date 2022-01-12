import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import announcementsReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import plcHeaderReducer, {
  setPlcHeader
} from '@cdo/apps/code-studio/plc/plcHeaderRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {registerReducers} from '@cdo/apps/redux';
import {renderCourseProgress} from '@cdo/apps/code-studio/progress';
import {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';
import EndOfLessonDialog from '@cdo/apps/templates/EndOfLessonDialog';

import locales, {setLocaleCode} from '../../../../redux/localesRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const {scriptData, plcBreadcrumb} = config;
  const store = getStore();
  registerReducers({locales});
  store.dispatch(setLocaleCode(scriptData.locale_code));

  if (plcBreadcrumb) {
    // Dispatch breadcrumb props so that UnitOverviewHeader can add the breadcrumb
    // as appropriate
    registerReducers({plcHeader: plcHeaderReducer});
    store.dispatch(
      setPlcHeader(plcBreadcrumb.unit_name, plcBreadcrumb.course_view_path)
    );
  }

  if (scriptData.has_verified_resources) {
    store.dispatch(setVerifiedResources(true));
  }

  if (scriptData.is_verified_instructor) {
    store.dispatch(setVerified());
  }

  if (scriptData.announcements) {
    registerReducers({announcements: announcementsReducer});
    scriptData.announcements.forEach(announcement =>
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

  const url = window.location.search;
  const urlParams = new URLSearchParams(url);
  const endOfLessonNumber = urlParams.get('endOfLesson');

  if (endOfLessonNumber) {
    ReactDOM.render(
      <EndOfLessonDialog
        isDialogOpen={true}
        lessonNumber={endOfLessonNumber}
      />,
      document.getElementById('end-of-lesson-dialog')
    );
  }
  renderCourseProgress(scriptData);
  tooltipifyVocabulary();
}
