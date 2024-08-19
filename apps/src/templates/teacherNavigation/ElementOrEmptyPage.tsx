import React from 'react';
import {NavLink} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

interface ElementOrEmptyPageProps {
  showNoStudents: boolean;
  showNoCurriculumAssigned: boolean;
  element: React.ReactElement;
}

const ElementOrEmptyPage: React.FC<ElementOrEmptyPageProps> = ({
  showNoStudents,
  showNoCurriculumAssigned,
  element,
}) => {
  const textDescription = showNoStudents
    ? i18n.emptySectionDescription()
    : i18n.noCurriculumAssigned();

  const displayedImage = showNoStudents ? (
    <img src={emptyDesk} alt="empty desk" />
  ) : (
    <img src={blankScreen} alt="blank screen" />
  );

  const link = showNoStudents ? (
    <NavLink
      key={TEACHER_NAVIGATION_PATHS.manageStudents}
      to={TEACHER_NAVIGATION_PATHS.manageStudents}
      className={styles.navLink}
    >
      {i18n.addStudents()}
    </NavLink>
  ) : (
    <LinkButton href="/catalog" text={i18n.browseCurriculum()} />
  );

  if (!showNoStudents && !showNoCurriculumAssigned) {
    return element;
  } else {
    return (
      <div className={dashboardStyles.emptyClassroomDiv}>
        <div className={dashboardStyles.emptyClassroomDiv}>
          {displayedImage}
          <Heading3 className={styles.topPadding}>
            {i18n.emptySectionHeadline()}
          </Heading3>
          <BodyTwoText>{textDescription}</BodyTwoText>
          {link}
        </div>
      </div>
    );
  }
};

export default ElementOrEmptyPage;
