import React from 'react';
import {useLoaderData} from 'react-router-dom';

import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import CourseOverview from './CourseOverview';

interface CourseOverviewData {
  courseSummary: {
    name: string;
    title: string;
    assignment_family_title: string;
    id: number;
    course_offering_id: number;
    course_version_id: number;
    description_student: string;
    description_teacher: string;
    teacher_resources: string;
    student_resources: string;
    scripts: string;
    show_assign_button: boolean;
    participant_audience: string;
    course_versions: object;
  };
  showRedirectWarning: boolean;
  redirectToCourseUrl: string;
  showVersionWarning: boolean;
}

export const teacherCourseOverviewLoader = ({params}): CourseOverviewData => {
  return {
    courseSummary: {
      name: 'courseName',
      title: 'courseTitle',
      assignment_family_title: 'assignmentFamilyTitle',
      id: 1,
      course_offering_id: 1,
      course_version_id: 1,
      description_student: 'descriptionStudent',
      description_teacher: 'descriptionTeacher',
      teacher_resources: 'teacherResources',
      student_resources: 'studentResources',
      scripts: 'scripts',
      show_assign_button: true,
      participant_audience: 'participantAudience',
      course_versions: {
        id: 1,
      },
    },
    showRedirectWarning: true,
    redirectToCourseUrl: '/courses/1',
    showVersionWarning: true,
  };
};

const TeacherCourseOverview: React.FC = () => {
  const userId = null;
  const sections = null;
  const {
    courseSummary,
    showRedirectWarning,
    redirectToCourseUrl,
    showVersionWarning,
  } = useLoaderData() as CourseOverviewData;

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
        !!showVersionWarning &&
        Object.values(courseSummary.course_versions).length > 1
      }
      showRedirectWarning={showRedirectWarning}
      redirectToCourseUrl={redirectToCourseUrl}
      showAssignButton={courseSummary.show_assign_button}
      userId={userId}
      userType={UserTypes.TEACHER}
      participantAudience={courseSummary.participant_audience}
    />
  );
};

export default TeacherCourseOverview;
