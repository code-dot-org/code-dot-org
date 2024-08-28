import _ from 'lodash';
import React from 'react';
import {useSelector} from 'react-redux';
import {useLoaderData} from 'react-router-dom';

import {
  addAnnouncement,
  VisibilityType,
} from '@cdo/apps/code-studio/announcementsRedux';
import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {getUserSignedInFromCookieAndDom} from '@cdo/apps/code-studio/initSigninState';
import {
  setVerified,
  setVerifiedResources,
} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {getStore} from '@cdo/apps/redux';
import {NotificationType} from '@cdo/apps/sharedComponents/Notification';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  CourseRoles,
  setUserRoleInCourse,
  setUserSignedIn,
} from '../currentUserRedux';
import {pageTypes, setPageType} from '../teacherDashboard/teacherSectionsRedux';

import CourseOverview from './CourseOverview';

interface Resource {
  id: number;
  key: string;
  markdownKey: string;
  name: string;
  url: string;
  isRollup: boolean;
}

interface Version {
  id: number;
  key: string;
  version_year: string;
  content_root_id: number;
  name: string;
  units: object[];
  is_recommended: boolean;
  is_stable: boolean;
  locales: string[];
  path: string;
  type: string;
}

interface CourseSummary {
  name: string;
  title: string;
  assignment_family_title: string;
  id: number;
  course_offering_id: number;
  course_version_id: number;
  description_student: string;
  description_teacher: string;
  teacher_resources: Resource[];
  student_resources: Resource[];
  scripts: object[];
  show_assign_button: boolean;
  participant_audience: string;
  course_versions: {[id: string]: Version};
  announcements: Announcement[];
  has_verified_resources: boolean;
}

interface Announcement {
  key: string;
  notice: string;
  details: string;
  link: string;
  type: keyof typeof NotificationType;
  visibility: keyof typeof VisibilityType;
  dismissible: boolean;
  buttonText: string | null;
}

interface CourseOverviewData {
  courseSummary: CourseSummary;
  isVerifiedInstructor: boolean;
  hiddenScripts: string[];
}

const courseSummaryCachedLoader = _.memoize(async courseVersionName =>
  getAuthenticityToken()
    .then(token =>
      fetch(`/dashboardapi/course_summary/${courseVersionName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token,
        },
      })
    )
    .then(response => response.json())
);

export const teacherCourseOverviewLoader =
  async (): Promise<CourseOverviewData | null> => {
    const state = getStore().getState().teacherSections;

    const selectedSection = state.sections[state.selectedSectionId];

    if (!selectedSection || !selectedSection?.courseVersionName) {
      return null;
    }

    return courseSummaryCachedLoader(selectedSection.courseVersionName).then(
      response => ({
        courseSummary: response.unit_group,
        isVerifiedInstructor: response.is_verified_instructor,
        hiddenScripts: response.hidden_scripts,
      })
    );
  };

const TeacherCourseOverview: React.FC = () => {
  const loadedData = useLoaderData() as CourseOverviewData | null;

  const sections = useSelector(
    (state: {
      teacherSections: {
        sections: {id: number; name: string}[];
      };
    }) => Object.values(state.teacherSections.sections)
  );

  const userId = useSelector(
    (state: {currentUser: {userId: number}}) => state.currentUser.userId
  );

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!loadedData) {
      return;
    }

    const courseSummary = loadedData.courseSummary;
    if (courseSummary.has_verified_resources) {
      dispatch(setVerifiedResources());
    }

    dispatch(setPageType(pageTypes.courseOverview));

    dispatch(setUserSignedIn(getUserSignedInFromCookieAndDom()));

    dispatch(setViewType(ViewType.Instructor));
    dispatch(setUserRoleInCourse(CourseRoles.Instructor));

    if (loadedData.isVerifiedInstructor) {
      dispatch(setVerified());
    }

    if (loadedData.hiddenScripts) {
      dispatch(initializeHiddenScripts(loadedData.hiddenScripts));
    }

    const announcements = courseSummary.announcements as Announcement[];
    if (announcements) {
      announcements.forEach(announcement =>
        dispatch(addAnnouncement(announcement))
      );
    }
  }, [loadedData, dispatch]);

  if (!loadedData) {
    return <Spinner />;
  }

  const {courseSummary} = loadedData;

  return (
    <CourseOverview
      name={courseSummary.name}
      title={courseSummary.title}
      assignmentFamilyTitle={courseSummary.assignment_family_title}
      id={courseSummary.id}
      courseOfferingId={courseSummary.course_offering_id}
      courseVersionId={courseSummary.course_version_id}
      descriptionStudent={courseSummary.description_student}
      descriptionTeacher={courseSummary.description_teacher}
      sectionsInfo={sections}
      teacherResources={courseSummary.teacher_resources}
      studentResources={courseSummary.student_resources}
      scripts={courseSummary.scripts}
      versions={courseSummary.course_versions}
      showVersionWarning={
        !!false && Object.values(courseSummary.course_versions).length > 1
      }
      showRedirectWarning={false}
      redirectToCourseUrl={''}
      showAssignButton={courseSummary.show_assign_button}
      userId={userId}
      userType={UserTypes.TEACHER}
      participantAudience={courseSummary.participant_audience}
    />
  );
};

export default TeacherCourseOverview;
