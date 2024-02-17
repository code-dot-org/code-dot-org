import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import i18n from '@cdo/locale';
import styles from './teacher-dashboard.module.scss';

export const TeacherDashboardPath = {
  progress: '/progress',
  textResponses: '/text_responses',
  assessments: '/assessments',
  projects: '/projects',
  stats: '/stats',
  manageStudents: '/manage_students',
  loginInfo: '/login_info',
  standardsReport: '/standards_report',
};

const teacherDashboardLinks = [
  {
    label: i18n.teacherTabProgress(),
    url: TeacherDashboardPath.progress,
  },
  {
    label: i18n.teacherTabStatsTextResponses(),
    url: TeacherDashboardPath.textResponses,
  },
  {
    label: i18n.teacherTabAssessments(),
    url: TeacherDashboardPath.assessments,
  },
  {
    label: i18n.teacherTabProjects(),
    url: TeacherDashboardPath.projects,
  },
  {
    label: i18n.teacherTabStats(),
    url: TeacherDashboardPath.stats,
  },
  {
    label: i18n.teacherTabManageStudents(),
    url: TeacherDashboardPath.manageStudents,
  },
];

export default function TeacherDashboardNavigation({links}) {
  const renderedLinks = links || teacherDashboardLinks;

  return (
    <div id="uitest-teacher-dashboard-nav" className={styles.navContainer}>
      {renderedLinks.map(link => (
        <NavLink
          key={link.url}
          to={link.url}
          className={styles.linkContainer}
          activeClassName={styles.activeLinkContainer}
        >
          <div className={styles.link}>{link.label}</div>
        </NavLink>
      ))}
    </div>
  );
}

TeacherDashboardNavigation.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};
