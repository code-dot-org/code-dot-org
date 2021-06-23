import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import CourseOverview from '@cdo/apps/templates/courseOverview/CourseOverview';
import announcementReducer, {
  addAnnouncement
} from '@cdo/apps/code-studio/announcementsRedux';
import clientState from '@cdo/apps/code-studio/clientState';
import {convertAssignmentVersionShapeFromServer} from '@cdo/apps/templates/teacherDashboard/shapes';
import {getStore} from '@cdo/apps/code-studio/redux';
import {getUserSignedInFromCookieAndDom} from '@cdo/apps/code-studio/initSigninState';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {
  pageTypes,
  selectSection,
  setPageType,
  setSections
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {registerReducers} from '@cdo/apps/redux';
import {setUserSignedIn} from '@cdo/apps/templates/currentUserRedux';
import {
  setVerified,
  setVerifiedResources
} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {tooltipifyVocabulary} from '@cdo/apps/utils';

$(document).ready(showCourseOverview);

function showCourseOverview() {
  const script = document.querySelector('script[data-courses-show]');
  const scriptData = JSON.parse(script.dataset.coursesShow);
  const courseSummary = scriptData.course_summary;
  const isTeacher = scriptData.is_teacher;
  const userId = scriptData.user_id;

  const teacherResources = (courseSummary.teacher_resources || []).map(
    ([type, link]) => ({
      type,
      link
    })
  );
  const store = getStore();

  if (courseSummary.has_verified_resources) {
    store.dispatch(setVerifiedResources());
  }

  store.dispatch(setPageType(pageTypes.courseOverview));

  store.dispatch(setUserSignedIn(getUserSignedInFromCookieAndDom()));

  if (isTeacher) {
    store.dispatch(setViewType(ViewType.Teacher));
    store.dispatch(setSections(scriptData.sections));

    if (scriptData.is_verified_teacher) {
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

  const versions = courseSummary.versions;

  const announcements = courseSummary.announcements;
  if (announcements) {
    registerReducers({announcements: announcementReducer});
    announcements.forEach(announcement =>
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

  // Eventually we want to do this all via redux
  ReactDOM.render(
    <Provider store={store}>
      <CourseOverview
        name={courseSummary.name}
        title={courseSummary.title}
        assignmentFamilyTitle={courseSummary.assignment_family_title}
        id={courseSummary.id}
        descriptionStudent={courseSummary.description_student}
        descriptionTeacher={courseSummary.description_teacher}
        sectionsInfo={scriptData.sections}
        teacherResources={teacherResources}
        migratedTeacherResources={courseSummary.migrated_teacher_resources}
        studentResources={courseSummary.student_resources}
        isTeacher={isTeacher}
        viewAs={ViewType.Teacher}
        scripts={courseSummary.scripts}
        isVerifiedTeacher={!!scriptData.is_verified_teacher}
        hasVerifiedResources={!!courseSummary.has_verified_resources}
        versions={convertAssignmentVersionShapeFromServer(versions)}
        showVersionWarning={
          !!scriptData.show_version_warning && versions.length > 1
        }
        showRedirectWarning={scriptData.show_redirect_warning}
        redirectToCourseUrl={scriptData.redirect_to_course_url}
        showAssignButton={courseSummary.show_assign_button}
        userId={userId}
        useMigratedResources={courseSummary.is_migrated}
      />
    </Provider>,
    document.getElementById('course_overview')
  );
  tooltipifyVocabulary();
}
