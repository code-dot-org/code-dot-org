import _ from 'lodash';
import React from 'react';
import {useSelector} from 'react-redux';
import {
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

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
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {NotificationType} from '@cdo/apps/sharedComponents/Notification';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  CourseRoles,
  setUserRoleInCourse,
  setUserSignedIn,
} from '../currentUserRedux';
import {pageTypes, setPageType} from '../teacherDashboard/teacherSectionsRedux';
import {selectedSectionSelector} from '../teacherDashboard/teacherSectionsReduxSelectors';
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

export interface Version {
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

interface Response {
  course_summary: CourseSummary;
  is_verified_instructor: boolean;
  hidden_scripts: string[];
  show_version_warning: boolean;
  redirect_to_course_url: string | null;
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

const courseSummaryCachedLoader = _.memoize(async courseVersionName =>
  HttpClient.fetchJson<Response>(
    `/dashboardapi/course_summary/${courseVersionName}`
  ).then(response => response?.value)
);

const TeacherCourseOverview: React.FC = () => {
  const [courseSummary, setCourseSummary] =
    React.useState<CourseSummary | null>(null);
  const [isVerifiedInstructor, setIsVerifiedInstructor] =
    React.useState<boolean>(false);
  const [hiddenScripts, setHiddenScripts] = React.useState<string[] | null>(
    null
  );
  const [redirectToCourseUrl, setRedirectToCourseUrl] =
    React.useState<string>('');
  const [showVersionWarning, setShowVersionWarning] =
    React.useState<boolean>(false);

  const navigate = useNavigate();

  const params = useParams();
  const [searchParams] = useSearchParams();

  const sections = useAppSelector(state => state.teacherSections.sections);

  const selectedSection = useAppSelector(selectedSectionSelector);

  React.useEffect(() => {
    if (
      !selectedSection ||
      !selectedSection?.courseVersionName ||
      parseInt(params.sectionId || '-1') !== selectedSection.id
    ) {
      return;
    }
    if (
      selectedSection.unitName &&
      (!selectedSection.courseId || selectedSection.isAssignedSingleUnitCourse)
    ) {
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

    courseSummaryCachedLoader(selectedSection.courseVersionName)
      .then(response => {
        if (response) {
          setCourseSummary(response.course_summary as CourseSummary);
          setIsVerifiedInstructor(response.is_verified_instructor);
          setHiddenScripts(response.hidden_scripts as string[]);
          setShowVersionWarning(response.show_version_warning);
          setRedirectToCourseUrl(response.redirect_to_course_url || '');

          analyticsReporter.sendEvent(
            EVENTS.TEACHER_NAV_COURSE_OVERVIEW_PAGE_VIEWED,
            {
              courseVersionName: selectedSection.courseVersionName,
            }
          );
        }
      })
      .catch(error => {
        console.error('Error loading course overview', error);

        analyticsReporter.sendEvent(EVENTS.TEACHER_NAV_COURSE_OVERVIEW_FAILED, {
          courseVersionName: selectedSection.courseVersionName,
        });
      });
  }, [
    navigate,
    selectedSection,
    params.courseVersionName,
    setCourseSummary,
    setIsVerifiedInstructor,
    setHiddenScripts,
    params.sectionId,
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

    const announcements = courseSummary.announcements as Announcement[];
    if (announcements) {
      announcements.forEach(announcement =>
        dispatch(addAnnouncement(announcement))
      );
    }
  }, [courseSummary, dispatch]);

  React.useEffect(() => {
    if (isVerifiedInstructor) {
      dispatch(setVerified());
    }
  }, [isVerifiedInstructor, dispatch]);

  React.useEffect(() => {
    if (hiddenScripts) {
      dispatch(initializeHiddenScripts(hiddenScripts));
    }
  }, [hiddenScripts, dispatch]);

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
      sectionsInfo={Object.values(sections)}
      teacherResources={courseSummary.teacher_resources}
      studentResources={courseSummary.student_resources}
      scripts={courseSummary.scripts}
      versions={courseSummary.course_versions}
      showVersionWarning={
        showVersionWarning &&
        Object.values(courseSummary.course_versions).length > 1
      }
      showRedirectWarning={searchParams.get('redirect_warning') === 'true'}
      redirectToCourseUrl={redirectToCourseUrl}
      showAssignButton={courseSummary.show_assign_button}
      userId={userId}
      userType={UserTypes.TEACHER}
      participantAudience={courseSummary.participant_audience}
    />
  );
};

export default TeacherCourseOverview;
