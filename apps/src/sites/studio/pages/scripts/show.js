import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import announcementsReducer, {
  addAnnouncement,
} from '@cdo/apps/code-studio/announcementsRedux';
import UnitOverview from '@cdo/apps/code-studio/components/progress/UnitOverview.jsx';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import plcHeaderReducer, {
  setPlcHeader,
} from '@cdo/apps/code-studio/plc/plcHeaderRedux';
import progress from '@cdo/apps/code-studio/progress';
import {setStudentDefaultsSummaryView} from '@cdo/apps/code-studio/progressRedux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {updateQueryParam, queryParams} from '@cdo/apps/code-studio/utils';
import {
  setVerified,
  setVerifiedResources,
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {registerReducers} from '@cdo/apps/redux';
import ParentalPermissionBanner from '@cdo/apps/templates/policy_compliance/ParentalPermissionBanner';
import googlePlatformApi, {
  loadGooglePlatformApi,
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';
import {
  selectSection,
  setSections,
  setPageType,
  pageTypes,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';

import locales, {setLocaleCode} from '../../../../redux/localesRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);
  const parentalPermissionBannerData = JSON.parse(
    script.dataset.parentalPermissionBanner
  );

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
      store.dispatch(addAnnouncement(announcement))
    );
  }

  if (scriptData.user_type === 'teacher') {
    initializeGooglePlatformApi(store);
  }

  if (scriptData.student_detail_progress_view) {
    store.dispatch(setStudentDefaultsSummaryView(false));
  }
  progress.initViewAs(
    store,
    scriptData.user_id !== null,
    scriptData.is_instructor
  );
  if (scriptData.is_instructor) {
    initializeStoreWithSections(store, scriptData.sections, scriptData.section);
  }
  store.dispatch(initializeHiddenScripts(scriptData.section_hidden_unit_info));
  store.dispatch(setPageType(pageTypes.scriptOverview));

  progress.initCourseProgress(scriptData);

  const mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);

  const completedLessonNumber = queryParams('completedLessonNumber');
  // This query param is immediately removed so that it is not included in the links
  // rendered on this page
  updateQueryParam('completedLessonNumber', undefined);

  const unitHasLevels = scriptData.lessons.reduce(
    (n, {levels}) => n || !!levels?.length,
    false
  );

  const root = createRoot(mountPoint);

  root.render(
    <Provider store={store}>
      {parentalPermissionBannerData && (
        <ParentalPermissionBanner {...parentalPermissionBannerData} />
      )}

      <UnitOverview
        id={scriptData.id}
        courseId={scriptData.course_id}
        courseOfferingId={scriptData.courseOfferingId}
        courseVersionId={scriptData.courseVersionId}
        courseTitle={scriptData.course_title}
        courseLink={scriptData.course_link}
        excludeCsfColumnInLegend={!scriptData.csf}
        teacherResources={scriptData.teacher_resources}
        studentResources={scriptData.student_resources || []}
        showCourseUnitVersionWarning={
          scriptData.show_course_unit_version_warning
        }
        showScriptVersionWarning={scriptData.show_script_version_warning}
        showRedirectWarning={scriptData.show_redirect_warning}
        redirectScriptUrl={scriptData.redirect_script_url}
        versions={scriptData.course_versions}
        courseName={scriptData.course_name}
        showAssignButton={scriptData.show_assign_button}
        isProfessionalLearningCourse={scriptData.isPlCourse}
        userId={scriptData.user_id}
        userType={scriptData.user_type}
        assignedSectionId={scriptData.assigned_section_id}
        showCalendar={scriptData.showCalendar}
        weeklyInstructionalMinutes={scriptData.weeklyInstructionalMinutes}
        unitCalendarLessons={scriptData.calendarLessons}
        unitHasLevels={unitHasLevels}
        isMigrated={scriptData.is_migrated}
        scriptOverviewPdfUrl={scriptData.scriptOverviewPdfUrl}
        scriptResourcesPdfUrl={scriptData.scriptResourcesPdfUrl}
        showUnversionedRedirectWarning={
          scriptData.show_unversioned_redirect_warning
        }
        isCsdOrCsp={scriptData.isCsd || scriptData.isCsp}
        completedLessonNumber={completedLessonNumber}
        publishedState={scriptData.publishedState}
        participantAudience={scriptData.participantAudience}
      />
    </Provider>
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
      ...currentSection,
    };
  }
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(currentSection.id.toString()));
}
