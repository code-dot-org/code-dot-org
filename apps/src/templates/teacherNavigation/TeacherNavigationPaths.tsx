import i18n from '@cdo/locale';

export const SECTION_ID_PATH_PART = `/:sectionId`;

export const TEACHER_NAVIGATION_PATHS = {
  progress: '/:sectionId/progress',
  textResponses: '/:sectionId/text_responses',
  assessments: '/:sectionId/assessments',
  projects: '/:sectionId/projects',
  stats: '/:sectionId/stats',
  manageStudents: '/:sectionId/manage_students',
  loginInfo: '/:sectionId/login_info',
  standardsReport: '/:sectionId/standards_report',
  aiTutorChatMessages: '/:sectionId/ai_tutor',
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
