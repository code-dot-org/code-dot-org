import i18n from '@cdo/locale';

export const TEACHER_NAVIGATION_BASE_URL = `/teacher_dashboard`;

export const TEACHER_NAVIGATION_SECTIONS_URL = '/sections';
export const SPECIFIC_SECTION_BASE_URL = `:sectionId`;

export const TEACHER_NAVIGATION_PATHS = {
  progress: 'progress',
  textResponses: 'text_responses',
  assessments: 'assessments',
  projects: 'projects',
  stats: 'stats',
  manageStudents: 'manage_students',
  loginInfo: 'login_info',
  standardsReport: 'standards_report',
  aiTutorChatMessages: 'ai_tutor',
  lessonMaterials: 'materials',
  calendar: 'calendar',
  courseOverview: 'course',
  unitOverview: 'unit',
  settings: 'settings',
};

const getAbsolutePath = (name: string) =>
  `${TEACHER_NAVIGATION_SECTIONS_URL}/${SPECIFIC_SECTION_BASE_URL}/${name}`;

export const LABELED_TEACHER_NAVIGATION_PATHS = {
  progress: {
    url: TEACHER_NAVIGATION_PATHS.progress,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.progress),
    label: i18n.progress(),
    icon: 'chart-line',
  },
  textResponses: {
    url: TEACHER_NAVIGATION_PATHS.textResponses,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.textResponses),
    label: i18n.teacherTabStatsTextResponses(),
    icon: 'pen-line',
  },
  assessments: {
    url: TEACHER_NAVIGATION_PATHS.assessments,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.assessments),
    label: i18n.assessments(),
    icon: 'star',
  },
  projects: {
    url: TEACHER_NAVIGATION_PATHS.projects,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.projects),
    label: i18n.studentProjects(),
    icon: 'code',
  },
  stats: {
    url: TEACHER_NAVIGATION_PATHS.stats,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.stats),
    label: i18n.teacherTabStats(),
    icon: 'chart-simple',
  },
  manageStudents: {
    url: TEACHER_NAVIGATION_PATHS.manageStudents,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.manageStudents),
    label: i18n.roster(),
    icon: 'users',
  },
  loginInfo: {
    url: TEACHER_NAVIGATION_PATHS.loginInfo,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.loginInfo),
    // this is not part of the navigation sidebar so it doesn't need a label or icon
    label: null,
    icon: null,
  },
  standardsReport: {
    url: TEACHER_NAVIGATION_PATHS.standardsReport,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.standardsReport),
    // this is not part of the navigation sidebar so it doesn't need a label or icon
    label: null,
    icon: null,
  },
  aiTutorChatMessages: {
    url: TEACHER_NAVIGATION_PATHS.aiTutorChatMessages,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.aiTutorChatMessages),
    // this is not part of the navigation sidebar so it doesn't need a label or icon
    label: null,
    icon: null,
  },
  lessonMaterials: {
    url: TEACHER_NAVIGATION_PATHS.lessonMaterials,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.lessonMaterials),
    label: i18n.lessonMaterials(),
    icon: 'folder-open',
  },
  calendar: {
    url: TEACHER_NAVIGATION_PATHS.calendar,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.calendar),
    label: i18n.calendar(),
    icon: 'calendar',
  },
  courseOverview: {
    url: TEACHER_NAVIGATION_PATHS.courseOverview,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.courseOverview),
    label: i18n.course(),
    icon: 'desktop',
  },
  unitOverview: {
    url: TEACHER_NAVIGATION_PATHS.unitOverview,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.unitOverview),
    label: i18n.unit(),
    icon: 'desktop',
  },
  settings: {
    url: TEACHER_NAVIGATION_PATHS.settings,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.settings),
    label: i18n.settings(),
    icon: 'gear',
  },
};
