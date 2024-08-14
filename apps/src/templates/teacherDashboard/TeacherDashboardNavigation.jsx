import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {NavLink} from 'react-router-dom';

import i18n from '@cdo/locale';

import {
  LABELED_TEACHER_DASHBOARD_PATHS,
  TEACHER_DASHBOARD_PATHS,
} from '../teacherNavigation/TeacherDashboardPaths';

import styles from './teacher-dashboard.module.scss';

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
