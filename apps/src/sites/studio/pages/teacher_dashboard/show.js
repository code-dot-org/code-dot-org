import $ from 'jquery';
import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

import announcementReducer from '@cdo/apps/code-studio/announcementsRedux';
import hiddenLesson, {
  initializeHiddenScripts,
} from '@cdo/apps/code-studio/hiddenLessonRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progressRedux from '@cdo/apps/code-studio/progressRedux';
import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';
import verifiedInstructor from '@cdo/apps/code-studio/verifiedInstructorRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import mapboxReducer, {setMapboxAccessToken} from '@cdo/apps/redux/mapbox';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setCurrentUserHasSeenStandardsReportInfo,
} from '@cdo/apps/templates/currentUserRedux';
import manageStudents, {
  setLoginType,
  setShowSharingColumn,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionStandardsProgress from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import progressV2Feedback from '@cdo/apps/templates/sectionProgressV2/progressV2FeedbackRedux';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import teacherSections, {
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setSections,
  setStudentsForCurrentSection,
  setAuthProviders,
  pageTypes,
  setPageType,
  beginCreatingSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionProviderName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {setSelectedSectionData} from '@cdo/apps/templates/teacherNavigation/selectedSectionLoader';
import {showV2TeacherDashboard} from '@cdo/apps/templates/teacherNavigation/TeacherNavFlagUtils';
import TeacherNavigationRouter from '@cdo/apps/templates/teacherNavigation/TeacherNavigationRouter';
import experiments from '@cdo/apps/util/experiments';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  section,
  sections,
  localeCode,
  hasSeenStandardsReportInfo,
  canViewStudentAIChatMessages,
} = scriptData;

$(document).ready(function () {
  registerReducers({
    teacherSections,
    manageStudents,
    sectionProgress,
    progressV2Feedback,
    unitSelection,
    stats,
    sectionAssessments,
    currentUser,
    sectionStandardsProgress,
    locales,
    viewAs,
    hiddenLesson,
    verifiedInstructor,
    announcementReducer,
    progressRedux,
    isRtl,
    mapbox: mapboxReducer,
  });

  const store = getStore();
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSections(sections, false));
  store.dispatch(setLocaleCode(localeCode));

  const showAITutorTab = canViewStudentAIChatMessages;

  // When removing v1TeacherDashboard after v2 launch, remove `selectedSection` from api response.
  const getV1TeacherDashboard = () => {
    // Removes the trailing part of the current location path that is not needed for the router `basename`.
    // For example, if the current location path is `/teacher_dashboard/sections/1/progress`,
    // the router `basename` should be `/teacher_dashboard/sections/1`.
    const baseUrl = window.location.pathname.replace(
      RegExp(`(/teacher_dashboard/sections/${section.id}).*`),
      '$1'
    );

    const selectedSectionFromList = sections.find(s => s.id === section.id);
    const selectedSection = {...selectedSectionFromList, ...section};

    store.dispatch(selectSection(selectedSection.id));
    store.dispatch(
      setStudentsForCurrentSection(selectedSection.id, selectedSection.students)
    );
    store.dispatch(setRosterProvider(selectedSection.login_type));
    store.dispatch(setRosterProviderName(selectedSection.login_type_name));
    store.dispatch(setLoginType(selectedSection.login_type));
    if (
      !selectedSection.sharing_disabled &&
      selectedSection.script.project_sharing
    ) {
      store.dispatch(setShowSharingColumn(true));
    }

    // Default the scriptId to the script assigned to the section
    const defaultScriptId = selectedSection.script
      ? selectedSection.script.id
      : null;
    if (defaultScriptId) {
      store.dispatch(setScriptId(defaultScriptId));
    }

    if (experiments.isEnabled('teacher-homepage-v2')) {
      const script = document.querySelector('script[data-homepage]');
      console.log(script);
      const homepageData = JSON.parse(script.dataset.homepage);
      // const isTeacher = homepageData.isTeacher;
      // const isEnglish = homepageData.isEnglish;
      // const announcementOverride = homepageData.announcement;
      // const specialAnnouncement = homepageData.specialAnnouncement;
      // const studentSpecialAnnouncement =
      //   homepageData.studentSpecialAnnouncement;
      const query = queryString.parse(window.location.search);
      store.dispatch(setAuthProviders(homepageData.providers));
      store.dispatch(initializeHiddenScripts(homepageData.hiddenScripts));
      store.dispatch(setPageType(pageTypes.homepage));
      store.dispatch(setLocaleCode(homepageData.localeCode));
      if (homepageData.mapboxAccessToken) {
        store.dispatch(setMapboxAccessToken(homepageData.mapboxAccessToken));
      }
      // remove courseOfferingId, courseVersionId, and unitId params so that if we
      // navigate back we don't get the create section dialog again
      let courseOfferingId;
      let courseVersionId;
      let unitId;
      let participantType;
      if (query.courseOfferingId) {
        courseOfferingId = parseInt(query.courseOfferingId, 10);
        updateQueryParam('courseOfferingId', undefined, true);
      }
      if (query.courseVersionId) {
        courseVersionId = parseInt(query.courseVersionId, 10);
        updateQueryParam('courseVersionId', undefined, true);
      }
      if (query.unitId) {
        unitId = parseInt(query.unitId, 10);
        updateQueryParam('unitId', undefined, true);
      }
      if (query.participantType) {
        participantType = queryParams('participantType');
        updateQueryParam('participantType', undefined, true);
      }
      if ((courseOfferingId && courseVersionId) || query.openAddSectionDialog) {
        updateQueryParam('openAddSectionDialog', undefined, true);
        store.dispatch(
          beginCreatingSection(
            courseOfferingId,
            courseVersionId,
            unitId,
            participantType
          )
        );
      }

      // const announcement = getTeacherAnnouncement(announcementOverride);
      // const parentalPermissionBanner =
      //   homepageData.parentalPermissionBanner && (
      //     <ParentalPermissionBanner
      //       key="parental-permission-banner"
      //       {...homepageData.parentalPermissionBanner}
      //     />
      //   );
    }

    return (
      <BrowserRouter basename={baseUrl}>
        <TeacherDashboard
          studioUrlPrefix={scriptData.studioUrlPrefix}
          sectionId={selectedSection.id}
          sectionName={selectedSection.name}
          studentCount={selectedSection.students.length}
          anyStudentHasProgress={selectedSection.any_student_has_progress}
          showAITutorTab={showAITutorTab}
          sectionProviderName={sectionProviderName(
            store.getState(),
            selectedSection.id
          )}
        />
      </BrowserRouter>
    );
  };

  const getV2TeacherDashboard = () => {
    const selectedSectionFromList = sections.find(s => s.id === section.id);
    const selectedSection = {...selectedSectionFromList, ...section};

    getStore().dispatch(selectSection(selectedSection.id));

    setSelectedSectionData(selectedSection);

    return (
      <TeacherNavigationRouter
        studioUrlPrefix={scriptData.studioUrlPrefix}
        showAITutorTab={showAITutorTab}
      />
    );
  };

  ReactDOM.render(
    <Provider store={store}>
      {!showV2TeacherDashboard()
        ? getV1TeacherDashboard()
        : getV2TeacherDashboard()}
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
