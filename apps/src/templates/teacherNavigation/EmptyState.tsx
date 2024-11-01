import React from 'react';
import {NavLink} from 'react-router-dom';
// import {useNavigate, NavLink} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import CalendarNotAvailable from '@cdo/apps/templates/teacherNavigation/images/CalendarNotAvailable.svg';
import NoUnitAssigned from '@cdo/apps/templates/teacherNavigation/images/NoUnitAssigned.svg';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

export const tryThis = 9;

interface EmptyStateItem {
  headline: string;
  descriptionText: string | null;
  imageComponent: JSX.Element;
  button: JSX.Element | null;
}

type EmptyStateType = {
  noStudents: EmptyStateItem;
  noCurriculumAssigned: EmptyStateItem;
  noUnitAssigned: EmptyStateItem;
  noLessonMaterialsForLegacyCourses: EmptyStateItem;
  noCalendarForLegacyCourses: EmptyStateItem;
  noLessonMaterialsForThisLesson: EmptyStateItem;
  noCalendarForThisUnit: EmptyStateItem;
  noUnitAssignedForCalendarOrLessonMaterials: EmptyStateItem;
};

export const EMPTY_STATE: EmptyStateType = {
  noStudents: {
    headline: i18n.emptySectionHeadline(),
    descriptionText: i18n.emptySectionDescription(),
    imageComponent: <img src={emptyDesk} alt="empty desk" />,
    button: (
      <NavLink
        key={TEACHER_NAVIGATION_PATHS.roster}
        to={TEACHER_NAVIGATION_PATHS.roster}
        className={styles.navLink}
      >
        {i18n.addStudents()}
      </NavLink>
    ),
  },
  noCurriculumAssigned: {
    headline: i18n.emptySectionHeadline(),
    descriptionText: i18n.noCurriculumAssigned(),
    imageComponent: <img src={blankScreen} alt="blank screen" />,
    button: <LinkButton href="/catalog" text={i18n.browseCurriculum()} />,
  },
  noUnitAssigned: {
    headline: i18n.almostThere(),
    descriptionText: i18n.noUnitAssigned({
      courseName: '',
    }),
    imageComponent: <img src={NoUnitAssigned} alt={i18n.almostThere()} />,
    // button: <Button onClick={navigateToCoursePage} text={i18n.assignAUnit()} />,
    button: (
      <Button
        onClick={() => console.log('clicked')}
        text={i18n.assignAUnit()}
      />
    ),
  },
  noLessonMaterialsForLegacyCourses: {
    headline: i18n.lessonMaterialsAreNotAvailable(),
    descriptionText: i18n.lessonMaterialsLegacyMessage({
      courseName: 'courseName',
    }),
    imageComponent: (
      <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
    ),
    // button: <Button onClick={navigateToCoursePage} text={i18n.goToCourse()} />,
    button: (
      <Button
        onClick={() => console.log('clicked')}
        text={i18n.assignAUnit()}
      />
    ),
  },
  noCalendarForLegacyCourses: {
    headline: i18n.calendarNotAvailable(),
    descriptionText: i18n.calendarLegacyMessage({courseName: 'courseName'}),
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  },
  noLessonMaterialsForThisLesson: {
    headline: i18n.lessonMaterialsNone(),
    descriptionText: null,
    imageComponent: (
      <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
    ),
    button: null,
  },
  noCalendarForThisUnit: {
    headline: i18n.calendarNotAvailable(),
    descriptionText: null,
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  },
  noUnitAssignedForCalendarOrLessonMaterials: {
    headline: i18n.almostThere(),
    descriptionText: i18n.noUnitAssigned({
      page: i18n.theCalendar(),
      courseName: 'courseName',
    }),
    imageComponent: <img src={NoUnitAssigned} alt={i18n.almostThere()} />,
    // button: <Button onClick={navigateToCoursePage} text={i18n.assignAUnit()} />,
    button: (
      <Button
        onClick={() => console.log('clicked')}
        text={i18n.assignAUnit()}
      />
    ),
  },
};

interface EmptyStateProps {
  emptyState: (typeof EMPTY_STATE)[keyof typeof EMPTY_STATE] | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({emptyState}) => {
  const imageComponent = emptyState?.imageComponent;
  const headline = emptyState?.headline;
  const descriptionText = emptyState?.descriptionText;
  const button = emptyState?.button;

  return (
    <div className={dashboardStyles.emptyClassroomDiv}>
      <div className={dashboardStyles.emptyClassroomDiv}>
        {imageComponent}
        <Heading3 className={styles.topPadding}>{headline}</Heading3>
        <BodyTwoText>{descriptionText}</BodyTwoText>
        {button}
      </div>
    </div>
  );
};
