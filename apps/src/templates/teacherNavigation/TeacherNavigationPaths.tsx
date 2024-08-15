import i18n from '@cdo/locale';

export const TEACHER_NAVIGATION_BASE_URL = `/teacher_dashboard/`;

export const TEACHER_NAVIGATION_SECTIONS_URL = '/sections';
export const SPECIFIC_SECTION_BASE_URL = `/sections/:sectionId`;

export const TEACHER_NAVIGATION_PATHS = {
  progress: '/sections/:sectionId/progress',
  textResponses: '/sections/:sectionId/text_responses',
  assessments: '/sections/:sectionId/assessments',
  projects: '/sections/:sectionId/projects',
  stats: '/sections/:sectionId/stats',
  manageStudents: '/sections/:sectionId/manage_students',
  loginInfo: '/sections/:sectionId/login_info',
  standardsReport: '/sections/:sectionId/standards_report',
  aiTutorChatMessages: '/sections/:sectionId/ai_tutor',
};

export const LABELED_TEACHER_NAVIGATION_PATHS = {
  progress: {
    url: TEACHER_NAVIGATION_PATHS.progress,
    label: i18n.progress(),
  },
  textResponses: {
    url: TEACHER_NAVIGATION_PATHS.textResponses,
    label: i18n.teacherTabStatsTextResponses(),
  },
  assessments: {
    url: TEACHER_NAVIGATION_PATHS.assessments,
    label: i18n.assessments(),
  },
  projects: {
    url: TEACHER_NAVIGATION_PATHS.projects,
    label: i18n.studentProjects(),
  },
  stats: {
    url: TEACHER_NAVIGATION_PATHS.stats,
    label: i18n.teacherTabStats(),
  },
  manageStudents: {
    url: TEACHER_NAVIGATION_PATHS.manageStudents,
    label: i18n.roster(),
  },
  loginInfo: {
    url: TEACHER_NAVIGATION_PATHS.loginInfo,
    label: null,
  },
  standardsReport: {
    url: TEACHER_NAVIGATION_PATHS.standardsReport,
    label: null,
  },
  aiTutorChatMessages: {
    url: TEACHER_NAVIGATION_PATHS.aiTutorChatMessages,
    label: null,
  },
};
