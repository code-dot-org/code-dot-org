import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {NavLink} from 'react-router-dom';

import i18n from '@cdo/locale';

import styles from './teacher-dashboard.module.scss';

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

export default function TeacherDashboardNavigation({links, showAITutorTab}) {
  const aiTutorLinks = showAITutorTab
    ? [
        {
          label: i18n.aiTutor(),
          url: TEACHER_DASHBOARD_PATHS.aiTutorChatMessages,
        },
      ]
    : [];
  const renderedLinks = [
    ...(links || LABELED_TEACHER_DASHBOARD_PATHS),
    ...aiTutorLinks,
  ];

  return (
    <div id="uitest-teacher-dashboard-nav" className={styles.navContainer}>
      {renderedLinks.map(link => (
        <NavLink
          key={link.url}
          to={link.url}
          className={({isActive}) =>
            classNames(
              styles.linkContainer,
              isActive && styles.activeLinkContainer
            )
          }
        >
          <div className={styles.link}>{link.label}</div>
        </NavLink>
      ))}
    </div>
  );
}

TeacherDashboardNavigation.propTypes = {
  showAITutorTab: PropTypes.bool,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};
