import PropTypes from 'prop-types';
import React from 'react';
import {NavLink} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {
  Heading3,
  BodyTwoText,
  Heading1,
} from '@cdo/apps/componentLibrary/typography';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import i18n from '@cdo/locale';

import {TEACHER_DASHBOARD_PATHS} from '../teacherNavigation/TeacherDashboardPaths';

import styles from './teacher-dashboard.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

function EmptySection({hasStudents, hasCurriculumAssigned}) {
  const textDescription = !hasStudents
    ? i18n.emptySectionDescription()
    : i18n.noCurriculumAssigned();

  const displayedImage = !hasStudents ? (
    <img src={emptyDesk} alt="empty desk" />
  ) : (
    <img src={blankScreen} alt="blank screen" />
  );

  const emptySectionGraphic = className => (
    <div className={className}>
      {displayedImage}
      <Heading3 className={styles.topPadding}>
        {i18n.emptySectionHeadline()}
      </Heading3>
      <BodyTwoText>{textDescription}</BodyTwoText>
      {!hasStudents && (
        <NavLink
          key={TEACHER_DASHBOARD_PATHS.manageStudents}
          to={TEACHER_DASHBOARD_PATHS.manageStudents}
          className={styles.navLink}
        >
          {i18n.addStudents()}
        </NavLink>
      )}
      {!hasCurriculumAssigned && hasStudents && (
        <LinkButton href="/catalog" text={i18n.browseCurriculum()} />
      )}
    </div>
  );

  return (
    <div className={dashboardStyles.emptyClassroomDiv}>
      {location.pathname === TEACHER_DASHBOARD_PATHS.progress && (
        <div>
          <Heading1>{i18n.progress()}</Heading1>
          {emptySectionGraphic(dashboardStyles.emptyClassroomProgress)}
        </div>
      )}
      {location.pathname !== TEACHER_DASHBOARD_PATHS.progress &&
        emptySectionGraphic(dashboardStyles.emptyClassroom)}
    </div>
  );
}

EmptySection.propTypes = {
  className: PropTypes.string,
  hasStudents: PropTypes.bool,
  hasCurriculumAssigned: PropTypes.bool,
};

export default EmptySection;
