import {initializeHiddenScripts} from '@cdo/apps/code-studio/hiddenLessonRedux';
import plcHeaderReducer, {
  setPlcHeader,
} from '@cdo/apps/code-studio/plc/plcHeaderRedux';
import progress from '@cdo/apps/code-studio/progress';
import {registerReducers} from '@cdo/apps/redux';
import {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import {NotificationType} from '@cdo/apps/sharedComponents/Notification';
import googlePlatformApi, {
  loadGooglePlatformApi,
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';
import {
  setPageType,
  pageTypes,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {PeerReviewLessonInfo} from '@cdo/apps/types/progressTypes';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  addAnnouncement,
  clearAnnouncements,
  VisibilityType,
} from '../../announcementsRedux';
import {setCalendarData} from '../../calendarRedux';
import {setVerified, setVerifiedResources} from '../../verifiedInstructorRedux';

export interface UnitSummaryResponse {
  unitData: UnitData;
  plcBreadcrumb: {
    unit_name: string;
    course_view_path: string;
  };
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
  course_link: string | null;
  course_title: string | null;
  course_name: string | null;
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
  section_hidden_unit_info: {[sectionId: string]: string[]};
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

export const setUnitSummaryReduxData = (
  unitSummaryResponse: UnitSummaryResponse,
  dispatch: AppDispatch,
  userType: string,
  userId: number
) => {
  if (!unitSummaryResponse) {
    return;
  }
  const unitData = unitSummaryResponse.unitData;
  const plcBreadcrumb = unitSummaryResponse.plcBreadcrumb;

  dispatch(setLocaleCode(unitData.locale_code));

  if (plcBreadcrumb) {
    // Dispatch breadcrumb props so that UnitOverviewHeader can add the breadcrumb
    // as appropriate
    registerReducers({plcHeader: plcHeaderReducer});
    dispatch(
      setPlcHeader(plcBreadcrumb.unit_name, plcBreadcrumb.course_view_path)
    );
  }

  dispatch(setVerifiedResources(!!unitData.has_verified_resources));

  if (unitData.is_verified_instructor) {
    dispatch(setVerified());
  }

  if (unitData.announcements) {
    unitData.announcements.forEach(announcement =>
      dispatch(addAnnouncement(announcement))
    );
  } else {
    dispatch(clearAnnouncements());
  }

  dispatch(
    setCalendarData({
      showCalendar: !!unitData.showCalendar,
      calendarLessons: unitData.calendarLessons,
      versionYear: unitData.version_year
        ? parseInt(unitData.version_year)
        : null,
    })
  );

  progress.initViewAsWithoutStore(
    dispatch,
    userId !== null,
    unitData.is_instructor
  );
  dispatch(initializeHiddenScripts(unitData.section_hidden_unit_info));
  dispatch(setPageType(pageTypes.scriptOverview));

  progress.initCourseProgress(unitData, false);

  const mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);

  //TODO
  // const completedLessonNumber = queryParams('completedLessonNumber');
  // This query param is immediately removed so that it is not included in the links
  // rendered on this page
  // updateQueryParam('completedLessonNumber', undefined);

  registerReducers({googlePlatformApi});
  dispatch(loadGooglePlatformApi()).catch(e => console.warn(e));
};
