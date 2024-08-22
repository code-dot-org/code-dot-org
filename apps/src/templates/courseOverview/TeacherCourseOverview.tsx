import React from 'react';
import {useSelector} from 'react-redux';
import {useLoaderData} from 'react-router-dom';

import {getStore} from '@cdo/apps/redux';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

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

interface UnitGroup {
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
}

interface CourseOverviewData {
  courseSummary: UnitGroup;
  isVerifiedInstructor: boolean;
}

export const teacherCourseOverviewLoader =
  async (): Promise<CourseOverviewData | null> => {
    const state = getStore().getState().teacherSections;

    const selectedSection = state.sections[state.selectedSectionId];
    if (!selectedSection || !selectedSection?.courseVersionName) {
      return null;
    }

    const response = await fetch(
      `/dashboardapi/course_summary/${selectedSection.courseVersionName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      }
    );

    return await response.json().then(response => {
      console.log('lfm cs', {response});
      return {
        courseSummary: response.unit_group,
        isVerifiedInstructor: response.is_verified_instructor,
      };
    });
  };

const TeacherCourseOverview: React.FC = () => {
  const loadedData = useLoaderData() as CourseOverviewData | null;

  const sections = useSelector(
    (state: {
      teacherSections: {
        sections: {id: number; name: string}[];
      };
    }) => state.teacherSections.sections
  );

  const userId = useSelector(
    (state: {currentUser: {userId: number}}) => state.currentUser.userId
  );

  if (!loadedData) {
    return <div>Null loaded data</div>;
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
