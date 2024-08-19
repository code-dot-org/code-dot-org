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
};

const getAbsolutePath = (name: string) =>
  `${TEACHER_NAVIGATION_SECTIONS_URL}/${SPECIFIC_SECTION_BASE_URL}/${name}`;

export const LABELED_TEACHER_NAVIGATION_PATHS = {
  progress: {
    url: TEACHER_NAVIGATION_PATHS.progress,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.progress),
    label: i18n.progress(),
  },
  textResponses: {
    url: TEACHER_NAVIGATION_PATHS.textResponses,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.textResponses),
    label: i18n.teacherTabStatsTextResponses(),
  },
  assessments: {
    url: TEACHER_NAVIGATION_PATHS.assessments,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.assessments),
    label: i18n.assessments(),
  },
  projects: {
    url: TEACHER_NAVIGATION_PATHS.projects,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.projects),
    label: i18n.studentProjects(),
  },
  stats: {
    url: TEACHER_NAVIGATION_PATHS.stats,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.stats),
    label: i18n.teacherTabStats(),
  },
  manageStudents: {
    url: TEACHER_NAVIGATION_PATHS.manageStudents,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.manageStudents),
    label: i18n.roster(),
  },
  loginInfo: {
    url: TEACHER_NAVIGATION_PATHS.loginInfo,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.loginInfo),
    label: null,
  },
  standardsReport: {
    url: TEACHER_NAVIGATION_PATHS.standardsReport,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.standardsReport),
    label: null,
  },
  aiTutorChatMessages: {
    url: TEACHER_NAVIGATION_PATHS.aiTutorChatMessages,
    absoluteUrl: getAbsolutePath(TEACHER_NAVIGATION_PATHS.aiTutorChatMessages),
    label: null,
  },
};
