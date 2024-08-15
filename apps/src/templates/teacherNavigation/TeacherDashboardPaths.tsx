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
};

export const TEACHER_NAVIGATION_PATHS = {
  dashboard: ':sectionId',
  progress: ':sectionId/progress',
  textResponses: ':sectionId/text_responses',
  assessments: ':sectionId/assessments',
  projects: ':sectionId/projects',
  stats: ':sectionId/stats',
  manageStudents: ':sectionId/manage_students',
  loginInfo: ':sectionId/login_info',
  standardsReport: ':sectionId/standards_report',
  aiTutorChatMessages: ':sectionId/ai_tutor',
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
];

export const SECTION_ID_PATH_PART = `/:sectionId`;
export const getSectionRouterPath = (pathUrl: string) =>
  `${SECTION_ID_PATH_PART}${pathUrl}`;
