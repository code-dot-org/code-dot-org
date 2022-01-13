import $ from 'jquery';

import {Provider} from 'react-redux';
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
import {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';
import googlePlatformApi, {
  loadGooglePlatformApi
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';
import {
  selectSection,
  setSections,
  setPageType,
  pageTypes
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import progress from '@cdo/apps/code-studio/progress';
import UnitOverview from '@cdo/apps/code-studio/components/progress/UnitOverview.jsx';
import {convertAssignmentVersionShapeFromServer} from '@cdo/apps/templates/teacherDashboard/shapes';
import {setStudentDefaultsSummaryView} from '@cdo/apps/code-studio/progressRedux';

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

  if (scriptData.user_type === 'teacher') {
    initializeGooglePlatformApi(store);
  }

  if (scriptData.student_detail_progress_view) {
    store.dispatch(setStudentDefaultsSummaryView(false));
  }
  progress.initViewAs(store, scriptData.user_type);
  initializeStoreWithSections(store, scriptData.sections, scriptData.section);
  store.dispatch(initializeHiddenScripts(scriptData.section_hidden_unit_info));
  store.dispatch(setPageType(pageTypes.scriptOverview));

  progress.initCourseProgress(scriptData);

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({
      type,
      link
    })
  );

  const mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);

  ReactDOM.render(
    <Provider store={store}>
      <UnitOverview
        id={scriptData.id}
        courseId={scriptData.course_id}
        courseTitle={scriptData.course_title}
        courseLink={scriptData.course_link}
        excludeCsfColumnInLegend={!scriptData.csf}
        teacherResources={teacherResources}
        migratedTeacherResources={scriptData.migrated_teacher_resources}
        studentResources={scriptData.student_resources || []}
        showCourseUnitVersionWarning={
          scriptData.show_course_unit_version_warning
        }
        showScriptVersionWarning={scriptData.show_script_version_warning}
        showRedirectWarning={scriptData.show_redirect_warning}
        redirectScriptUrl={scriptData.redirect_script_url}
        versions={convertAssignmentVersionShapeFromServer(scriptData.versions)}
        courseName={scriptData.course_name}
        showAssignButton={scriptData.show_assign_button}
        userId={scriptData.user_id}
        assignedSectionId={scriptData.assigned_section_id}
        showCalendar={scriptData.showCalendar}
        weeklyInstructionalMinutes={scriptData.weeklyInstructionalMinutes}
        unitCalendarLessons={scriptData.calendarLessons}
        isMigrated={scriptData.is_migrated}
        scriptOverviewPdfUrl={scriptData.scriptOverviewPdfUrl}
        scriptResourcesPdfUrl={scriptData.scriptResourcesPdfUrl}
        showUnversionedRedirectWarning={
          scriptData.show_unversioned_redirect_warning
        }
        isCsdOrCsp={scriptData.isCsd || scriptData.isCsp}
      />
    </Provider>,
    mountPoint
  );

  tooltipifyVocabulary();
}

function initializeGooglePlatformApi(store) {
  registerReducers({googlePlatformApi});
  store.dispatch(loadGooglePlatformApi()).catch(e => console.warn(e));
}

function initializeStoreWithSections(store, sections, currentSection) {
  if (!sections) {
    return;
  }

  if (!currentSection) {
    // If we don't have a selected section, simply set sections and we're done.
    store.dispatch(setSections(sections));
    return;
  }

  // If we do have a selected section, merge it with the minimal data in the
  // `sections` array before storing in redux.
  const idx = sections.findIndex(section => section.id === currentSection.id);
  if (idx >= 0) {
    sections[idx] = {
      ...sections[idx],
      ...currentSection
    };
  }
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(currentSection.id.toString()));
}
