import React from 'react';
import {useSelector} from 'react-redux';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import UnitOverview from './UnitOverview';

interface Section {
  id: number;
  courseVersionId: number;
  courseVersionName: string;
  courseOfferingId: number;
  unitId: number;
  courseDisplayName: string;
}

interface TeacherUnitOverviewProps {
  // Define any props you need here
}

const TeacherUnitOverview: React.FC<TeacherUnitOverviewProps> = props => {
  const selectedSection = useSelector(
    (state: {
      teacherSections: {sections: Section[]; selectedSectionId: number};
    }) =>
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
  );

  const {userId, userType} = useAppSelector(state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
  }));

  return (
    <UnitOverview
      id={selectedSection.unitId}
      courseId={selectedSection.courseVersionId} // TODO: This is not the correct prop
      courseOfferingId={selectedSection.courseOfferingId}
      courseVersionId={selectedSection.courseVersionId}
      courseTitle={'courseTitle'}
      courseLink={'courseLink'}
      excludeCsfColumnInLegend={false}
      teacherResources={[]}
      studentResources={[]}
      showCourseUnitVersionWarning={false}
      showScriptVersionWarning={false}
      showRedirectWarning={false}
      redirectScriptUrl={'https://example.com'}
      versions={[]}
      courseName={'courseName'}
      showAssignButton={true}
      isProfessionalLearningCourse={false}
      userId={userId}
      userType={userType}
      assignedSectionId={selectedSection.id}
      showCalendar={true}
      weeklyInstructionalMinutes={45}
      unitCalendarLessons={[]}
      unitHasLevels={true}
      isMigrated={true}
      scriptOverviewPdfUrl={'https://example.com'}
      scriptResourcesPdfUrl={'https://example.com'}
      isCsdOrCsp={true}
      completedLessonNumber={0}
      publishedState={'stable'}
      participantAudience={'student'}
      showAiAssessmentsAnnouncement={false}
    />
  );
};

export default TeacherUnitOverview;
