import _ from 'lodash';
import React from 'react';
import {useSelector} from 'react-redux';
import {generatePath, useNavigate, useParams} from 'react-router-dom';

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
import {TEACHER_NAVIGATION_PATHS} from '../teacherNavigation/TeacherNavigationPaths';

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

interface Section {
  id: number;
  name: string;
  courseId: number | null;
  unitName: string | null;
  courseVersionName: string | null;
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

const TeacherCourseOverview: React.FC = () => {
  const [courseSummary, setCourseSummary] =
    React.useState<CourseSummary | null>(null);
  const [isVerifiedInstructor, setIsVerifiedInstructor] =
    React.useState<boolean>(false);
  const [hiddenScripts, setHiddenScripts] = React.useState<string[] | null>(
    null
  );

  const navigate = useNavigate();

  const params = useParams();

  const sections = useSelector(
    (state: {
      teacherSections: {
        sections: Section[];
      };
    }) => state.teacherSections.sections
  );

  const selectedSection = useSelector(
    (state: {
      teacherSections: {
        sections: Section[];
        selectedSectionId: number;
      };
    }) =>
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
  );

  React.useEffect(() => {
    if (!selectedSection || !selectedSection?.courseVersionName) {
      return;
    }
    if (!selectedSection.courseId && selectedSection.unitName) {
      navigate(
        generatePath('../' + TEACHER_NAVIGATION_PATHS.unitOverview, {
          unitName: selectedSection.unitName,
        }),
        {replace: true}
      );
      return;
    }

    if (selectedSection.courseVersionName !== params.courseVersionName) {
      navigate(
        generatePath('../' + TEACHER_NAVIGATION_PATHS.courseOverview, {
          courseVersionName: selectedSection.courseVersionName,
        }),
        {replace: true}
      );
      return;
    }

    courseSummaryCachedLoader(selectedSection.courseVersionName).then(
      response => {
        setCourseSummary(response.unit_group);
        setIsVerifiedInstructor(response.is_verified_instructor);
        setHiddenScripts(response.hidden_scripts);
      }
    );
  }, [
    navigate,
    selectedSection,
    params.courseVersionName,
    setCourseSummary,
    setIsVerifiedInstructor,
    setHiddenScripts,
  ]);

  const userId = useSelector(
    (state: {currentUser: {userId: number}}) => state.currentUser.userId
  );

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!courseSummary) {
      return;
    }

    if (courseSummary.has_verified_resources) {
      dispatch(setVerifiedResources());
    }

    dispatch(setPageType(pageTypes.courseOverview));

    dispatch(setUserSignedIn(getUserSignedInFromCookieAndDom()));

    dispatch(setViewType(ViewType.Instructor));
    dispatch(setUserRoleInCourse(CourseRoles.Instructor));

    if (isVerifiedInstructor) {
      dispatch(setVerified());
    }

    if (hiddenScripts) {
      dispatch(initializeHiddenScripts(hiddenScripts));
    }

    const announcements = courseSummary.announcements as Announcement[];
    if (announcements) {
      announcements.forEach(announcement =>
        dispatch(addAnnouncement(announcement))
      );
    }
  }, [courseSummary, isVerifiedInstructor, hiddenScripts, dispatch]);

  if (!courseSummary) {
    return <Spinner />;
  }

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
      showRedirectWarning={false} // TODO: https://codedotorg.atlassian.net/browse/TEACH-1374
      redirectToCourseUrl={''}
      showAssignButton={courseSummary.show_assign_button}
      userId={userId}
      userType={UserTypes.TEACHER}
      participantAudience={courseSummary.participant_audience}
    />
  );
};

export default TeacherCourseOverview;
