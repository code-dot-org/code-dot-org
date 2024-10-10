import React from 'react';
import {useSelector} from 'react-redux';
import {useNavigate, NavLink} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

interface ElementOrEmptyPageProps {
  showNoStudents: boolean;
  showNoCurriculumAssigned: boolean;
  showNoUnitAssigned?: boolean;
  courseName?: string;
  element: React.ReactElement;
}

const ElementOrEmptyPage: React.FC<ElementOrEmptyPageProps> = ({
  showNoStudents,
  showNoCurriculumAssigned,
  showNoUnitAssigned,
  courseName,
  element,
}) => {
  const isLoadingSectionData = useSelector(
    (state: {teacherSections: {isLoadingSectionData: boolean}}) =>
      state.teacherSections.isLoadingSectionData
  );

  const textDescription = () => {
    if (showNoStudents) {
      return i18n.emptySectionDescription();
    } else if (showNoCurriculumAssigned) {
      return i18n.noCurriculumAssigned();
    } else {
      return i18n.noUnitAssigned({courseName: courseName});
    }
  };

  const displayedImage = () => {
    if (showNoStudents) {
      return <img src={emptyDesk} alt="empty desk" />;
    } else if (showNoCurriculumAssigned) {
      return <img src={blankScreen} alt="blank screen" />;
    } else {
      return <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />;
    }
  };

  const link = () => {
    if (showNoStudents) {
      return (
        <NavLink
          key={TEACHER_NAVIGATION_PATHS.manageStudents}
          to={TEACHER_NAVIGATION_PATHS.manageStudents}
          className={styles.navLink}
        >
          {i18n.addStudents()}
        </NavLink>
      );
    } else if (showNoCurriculumAssigned) {
      return <LinkButton href="/catalog" text={i18n.browseCurriculum()} />;
    } else {
      return (
        <Button onClick={navigateToCoursePage} text={i18n.assignAUnit()} />
      );
    }
  };

  const heading =
    showNoStudents || showNoCurriculumAssigned
      ? i18n.emptySectionHeadline()
      : i18n.almostThere();

  const navigate = useNavigate();

  const navigateToCoursePage = () => {
    navigate(`../${TEACHER_NAVIGATION_PATHS.courseOverview}`, {
      relative: 'path',
    });
  };

  // Don't show the empty state if we're still loading data
  if (
    isLoadingSectionData ||
    (!showNoStudents && !showNoCurriculumAssigned && !showNoUnitAssigned)
  ) {
    return element;
  } else {
    return (
      <div className={dashboardStyles.emptyClassroomDiv}>
        <div className={dashboardStyles.emptyClassroomDiv}>
          {displayedImage()}
          <Heading3 className={styles.topPadding}>{heading}</Heading3>
          <BodyTwoText>{textDescription()}</BodyTwoText>
          {link()}
        </div>
      </div>
    );
  }
};

export default ElementOrEmptyPage;
