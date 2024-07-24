import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import announcementReducer, {
  addAnnouncement,
} from '@cdo/apps/code-studio/announcementsRedux';
import clientState from '@cdo/apps/code-studio/clientState';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {getUserSignedInFromCookieAndDom} from '@cdo/apps/code-studio/initSigninState';
import {getStore} from '@cdo/apps/code-studio/redux';
import {
  setVerified,
  setVerifiedResources,
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {registerReducers} from '@cdo/apps/redux';
import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import {
  setUserSignedIn,
  setUserRoleInCourse,
  CourseRoles,
} from '@cdo/apps/templates/currentUserRedux';
import {
  pageTypes,
  selectSection,
  setPageType,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const script = document.querySelector('script[data-courses-show]');
  const scriptData = JSON.parse(script.dataset.coursesShow);
  const courseSummary = scriptData.course_summary;
  const isInstructor = scriptData.is_instructor;
  const userId = scriptData.user_id;

  const store = getStore();

  if (courseSummary.has_verified_resources) {
    store.dispatch(setVerifiedResources());
  }

  store.dispatch(setPageType(pageTypes.courseOverview));

  store.dispatch(setUserSignedIn(getUserSignedInFromCookieAndDom()));

  if (isInstructor) {
    store.dispatch(setViewType(ViewType.Instructor));
    store.dispatch(setUserRoleInCourse(CourseRoles.Instructor));
    store.dispatch(setSections(scriptData.sections));

    if (scriptData.is_verified_instructor) {
      store.dispatch(setVerified());
    }

    const sectionId = clientState.queryParams('section_id');
    if (sectionId) {
      store.dispatch(selectSection(sectionId));
    }
  }

  if (scriptData.hidden_scripts) {
    store.dispatch(initializeHiddenScripts(scriptData.hidden_scripts));
  }

  const versions = courseSummary.course_versions;

  const announcements = courseSummary.announcements;
  if (announcements) {
    registerReducers({announcements: announcementReducer});
    announcements.forEach(announcement =>
      store.dispatch(addAnnouncement(announcement))
    );
  }

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <Provider store={store}>
      <CourseOverview
        name={courseSummary.name}
        title={courseSummary.title}
        assignmentFamilyTitle={courseSummary.assignment_family_title}
        id={courseSummary.id}
        courseOfferingId={courseSummary.course_offering_id}
        courseVersionId={courseSummary.course_version_id}
        descriptionStudent={courseSummary.description_student}
        descriptionTeacher={courseSummary.description_teacher}
        sectionsInfo={scriptData.sections}
        teacherResources={courseSummary.teacher_resources}
        studentResources={courseSummary.student_resources}
        scripts={courseSummary.scripts}
        versions={versions}
        showVersionWarning={
          !!scriptData.show_version_warning &&
          Object.values(versions).length > 1
        }
        showRedirectWarning={scriptData.show_redirect_warning}
        redirectToCourseUrl={scriptData.redirect_to_course_url}
        showAssignButton={courseSummary.show_assign_button}
        userId={userId}
        userType={scriptData.user_type}
        participantAudience={courseSummary.participant_audience}
      />
    </Provider>,
    document.getElementById('course_overview')
  );
  tooltipifyVocabulary();
}
