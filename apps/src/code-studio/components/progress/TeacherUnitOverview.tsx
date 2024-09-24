import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {NotificationType} from '@cdo/apps/sharedComponents/Notification';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {PeerReviewLessonInfo} from '@cdo/apps/types/progressTypes';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {VisibilityType} from '../../announcementsRedux';

import UnitOverview from './UnitOverview';

interface Section {
  id: number;
  courseVersionId: number;
  courseVersionName: string;
  courseOfferingId: number;
  unitId: number;
  unitName: string;
  courseDisplayName: string;
}

interface Resource {
  id: number;
  key: string;
  markdownKey: string;
  name: string;
  url: string;
  isRollup: boolean;
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

interface DropdownUnit {
  id: number;
  name: string;
  path: string;
  lesson_extras_available: boolean;
  text_to_speech_enabled: boolean;
  position: number;
  requires_verified_instructor: boolean;
}

interface CourseVersion {
  id: number;
  key: string;
  version_year: string;
  content_root_id: number;
  name: string;
  path: string;
  type: string;
  is_stable: boolean;
  is_recommended: boolean;
  locales: string[];
  units: {[id: number]: DropdownUnit};
}

interface LessonGroup {
  id: number;
  key: string;
  display_name: string;
  description: string;
  big_questions: string | null;
  user_facing: boolean;
  position: number | null;
}

interface Level {}

interface Lesson {
  levels: Level[];
}

interface CalendarLesson {
  id: number;
  lessonNumber: number;
  title: string;
  duration: number;
  assessment: boolean;
  unplugged: boolean;
  url: string;
}

interface UnitData {
  is_instructor: boolean;
  is_verified_instructor: boolean;
  locale: string;
  locale_code: string;
  course_link: string;
  course_title: string;
  id: string;
  name: string;
  title: string;
  description: string;
  studentDescription: string;
  publishedState: string;
  instructionType: string;
  instructorAudience: string;
  participantAudience: string;
  loginRequired: boolean;
  plc: boolean;
  hideable_lessons: boolean;
  disablePostMilestone: boolean;
  csf: boolean;
  isCsd: boolean;
  isCsp: boolean;
  only_instructor_review_required: boolean;
  peerReviewsRequired: number;
  peerReviewLessonInfo: PeerReviewLessonInfo | null;
  student_detail_progress_view: boolean;
  project_widget_visible: boolean;
  project_widget_types: string[];
  teacher_resources: Resource[];
  student_resources: Resource[];
  lesson_extras_available: boolean;
  has_verified_resources: boolean;
  curriculum_path: string | null;
  announcements: Announcement[];
  age_13_required: boolean;
  show_course_unit_version_warning: boolean;
  show_script_version_warning: boolean;
  course_versions: {[id: number]: CourseVersion};
  supported_locales: string[] | null;
  section_hidden_unit_info: {[sectionId: number]: number[]};
  pilot_experiment: string | null;
  editor_experiment: string | null;
  show_assign_button: boolean;
  project_sharing: boolean;
  curriculum_umbrella: string;
  family_name: string | null;
  version_year: string | null;
  hasStandards: boolean;
  tts: boolean;
  deprecated: boolean;
  is_course: boolean;
  is_migrated: boolean;
  scriptPath: string | null;
  showCalendar: boolean;
  weeklyInstructionalMinutes: number | null;
  includeStudentLessonPlans: boolean;
  useLegacyLessonPlans: boolean;
  scriptOverviewPdfUrl: string;
  scriptResourcesPdfUrl: string;
  updated_at: string;
  isPlCourse: boolean;
  showAiAssessmentsAnnouncement: boolean;
  lessonGroups: LessonGroup[];
  lessons: Lesson[];
  deeperLearningCourse: string | null;
  wrapupVideo: string | null;
  calendarLessons: CalendarLesson[];
}

interface UnitSummaryResponse {
  unitData: UnitData;
  plcBreadcrumb: {
    unit_name: string;
    course_view_path: string;
  };
}

interface TeacherUnitOverviewProps {
  // Define any props you need here
}

const TeacherUnitOverview: React.FC<TeacherUnitOverviewProps> = props => {
  const [unitSummaryResponse, setUnitSummaryResponse] =
    useState<UnitSummaryResponse | null>(null);

  const selectedSection = useSelector(
    (state: {
      teacherSections: {sections: Section[]; selectedSectionId: number};
    }) =>
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
  );

  const unitName = useSelector(
    (state: {unitSelection: {unitName: string}}) => state.unitSelection.unitName
  );

  const {userId, userType} = useAppSelector(state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
  }));

  React.useEffect(() => {
    if (!unitName) {
      return;
    }
    setUnitSummaryResponse(null);

    getAuthenticityToken()
      .then(token =>
        fetch(`/dashboardapi/unit_summary/${unitName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token,
          },
        })
      )
      .then(response => response.json())
      .then(responseJson => setUnitSummaryResponse(responseJson));
  }, [unitName]);

  if (!unitSummaryResponse) {
    return <Spinner size={'large'} />;
  }

  const unitHasLevels = unitSummaryResponse.unitData.lessons.reduce(
    (n, {levels}) => n || !!levels?.length,
    false
  );

  const showAiAssessmentsAnnouncement =
    unitSummaryResponse.unitData.showAiAssessmentsAnnouncement &&
    experiments.isEnabled(experiments.AI_ASSESSMENTS_ANNOUNCEMENT);

  return (
    <UnitOverview
      id={selectedSection.unitId}
      courseId={selectedSection.courseVersionId} // TODO: This is not the correct prop
      courseOfferingId={selectedSection.courseOfferingId}
      courseVersionId={selectedSection.courseVersionId}
      courseTitle={unitSummaryResponse.unitData.course_title}
      courseLink={unitSummaryResponse.unitData.course_link}
      excludeCsfColumnInLegend={!unitSummaryResponse.unitData.csf}
      teacherResources={unitSummaryResponse.unitData.teacher_resources}
      studentResources={unitSummaryResponse.unitData.student_resources || []}
      showCourseUnitVersionWarning={
        unitSummaryResponse.unitData.show_course_unit_version_warning
      }
      showScriptVersionWarning={
        unitSummaryResponse.unitData.show_script_version_warning
      }
      showRedirectWarning={false} // TODO: https://codedotorg.atlassian.net/browse/TEACH-1374
      redirectScriptUrl={''}
      versions={unitSummaryResponse.unitData.course_versions}
      courseName={selectedSection.courseDisplayName}
      showAssignButton={unitSummaryResponse.unitData.show_assign_button}
      isProfessionalLearningCourse={unitSummaryResponse.unitData.isPlCourse}
      userId={userId}
      userType={userType}
      assignedSectionId={selectedSection.id}
      showCalendar={unitSummaryResponse.unitData.showCalendar}
      weeklyInstructionalMinutes={
        unitSummaryResponse.unitData.weeklyInstructionalMinutes
      }
      unitCalendarLessons={unitSummaryResponse.unitData.calendarLessons}
      unitHasLevels={unitHasLevels}
      isMigrated={unitSummaryResponse.unitData.is_migrated}
      scriptOverviewPdfUrl={unitSummaryResponse.unitData.scriptOverviewPdfUrl}
      scriptResourcesPdfUrl={unitSummaryResponse.unitData.scriptResourcesPdfUrl}
      isCsdOrCsp={
        unitSummaryResponse.unitData.isCsd || unitSummaryResponse.unitData.isCsp
      }
      completedLessonNumber={null} // Do we need this query param
      publishedState={unitSummaryResponse.unitData.publishedState}
      participantAudience={unitSummaryResponse.unitData.participantAudience}
      showAiAssessmentsAnnouncement={showAiAssessmentsAnnouncement}
    />
  );
};

export default TeacherUnitOverview;
