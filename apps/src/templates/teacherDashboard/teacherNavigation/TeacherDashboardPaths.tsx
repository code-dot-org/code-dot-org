import i18n from '@cdo/locale';

export const TEACHER_DASHBOARD_PATHS = {
  progress: '/progress',
  textResponses: '/text_responses',
  assessments: '/assessments',
  projects: '/projects',
  stats: '/stats',
  manageStudents: '/manage_students',
  loginInfo: '/login_info',
  standardsReport: '/standards_report',
  aiTutorChatMessages: '/ai_tutor',
  lessonMaterials: '/materials',
  lessonPlans: '/plans',
  slideDecks: '/decks',
  calendar: '/calendar',
  courseOverview: '/course',
  unitOverview: '/unit',
  settings: '/settings',
};

export const LABELED_TEACHER_DASHBOARD_PATHS = [
  {
    label: i18n.teacherTabProgress(),
    url: TEACHER_DASHBOARD_PATHS.progress,
  },
  {
    label: i18n.teacherTabStatsTextResponses(),
    url: TEACHER_DASHBOARD_PATHS.textResponses,
  },
  {
    label: i18n.teacherTabAssessments(),
    url: TEACHER_DASHBOARD_PATHS.assessments,
  },
  {
    label: i18n.teacherTabProjects(),
    url: TEACHER_DASHBOARD_PATHS.projects,
  },
  {
    label: i18n.teacherTabStats(),
    url: TEACHER_DASHBOARD_PATHS.stats,
  },
  {
    label: i18n.teacherTabManageStudents(),
    url: TEACHER_DASHBOARD_PATHS.manageStudents,
  },
  {
    label: i18n.lessonMaterials(),
    url: TEACHER_DASHBOARD_PATHS.lessonMaterials,
  },
  {
    label: i18n.lessonPlans(),
    url: TEACHER_DASHBOARD_PATHS.lessonPlans,
  },
  {
    label: i18n.slideDecks(),
    url: TEACHER_DASHBOARD_PATHS.slideDecks,
  },
  {
    label: i18n.calendar(),
    url: TEACHER_DASHBOARD_PATHS.calendar,
  },
  {
    label: i18n.course(),
    url: TEACHER_DASHBOARD_PATHS.courseOverview,
  },
  {
    label: i18n.unit(),
    url: TEACHER_DASHBOARD_PATHS.unitOverview,
  },
  {
    label: i18n.settings(),
    url: TEACHER_DASHBOARD_PATHS.settings,
  },
];

export const SECTION_ID_PATH_PART = `/:sectionId`;
export const getSectionRouterPath = (pathUrl: string) =>
  `${SECTION_ID_PATH_PART}${pathUrl}`;
