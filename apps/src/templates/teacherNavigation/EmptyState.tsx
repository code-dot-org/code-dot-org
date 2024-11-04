import React from 'react';
import {NavLink, generatePath} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {Heading3, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import CalendarNotAvailable from '@cdo/apps/templates/teacherNavigation/images/CalendarNotAvailable.svg';
import NoUnitAssigned from '@cdo/apps/templates/teacherNavigation/images/NoUnitAssigned.svg';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import i18n from '@cdo/locale';

import {
  LABELED_TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_PATHS,
} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

interface EmptyStateItem {
  headline: string;
  descriptionText: string | null;
  imageComponent: JSX.Element;
  button: JSX.Element | null;
}

export const getNoStudentsEmptyState = () => {
  return {
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
  };
};

export const getNoCurriculumAssignedEmptyState = () => {
  return {
    headline: i18n.emptySectionHeadline(),
    descriptionText: i18n.noCurriculumAssigned(),
    imageComponent: <img src={blankScreen} alt="blank screen" />,
    button: <LinkButton href="/catalog" text={i18n.browseCurriculum()} />,
  };
};

export const getNoUnitAssignedEmptyState = (
  sectionId: number,
  courseVersionName: string
) => {
  return {
    headline: i18n.almostThere(),
    descriptionText: i18n.noUnitAssigned({
      courseName: '',
    }),
    imageComponent: <img src={NoUnitAssigned} alt={i18n.almostThere()} />,
    button: (
      <LinkButton
        href={
          '/teacher_dashboard' +
          generatePath(
            LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl,
            {
              sectionId: sectionId,
              courseVersionName: courseVersionName,
            }
          )
        }
        text={i18n.assignAUnit()}
      />
    ),
  };
};

export const getNoLessonMaterialsForLegacyCourses = (
  sectionId: number,
  courseVersionName: string
) => {
  return {
    headline: i18n.lessonMaterialsAreNotAvailable(),
    descriptionText: i18n.lessonMaterialsLegacyMessage({
      courseName: 'courseName',
    }),
    imageComponent: (
      <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
    ),
    button: (
      <LinkButton
        href={
          '/teacher_dashboard' +
          generatePath(
            LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl,
            {
              sectionId: sectionId,
              courseVersionName: courseVersionName,
            }
          )
        }
        text={i18n.assignAUnit()}
      />
    ),
  };
};

export const getNoCalendarForLegacyCourses = (courseName: string) => {
  return {
    headline: i18n.calendarNotAvailable(),
    descriptionText: i18n.calendarLegacyMessage({courseName: courseName}),
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  };
};

export const getNoLessonMaterialsForThisLesson = () => {
  return {
    headline: i18n.lessonMaterialsNone(),
    descriptionText: null,
    imageComponent: (
      <img src={TeacherDashboardEmptyState} alt={i18n.almostThere()} />
    ),
    button: null,
  };
};

export const getNoCalendarForThisUnit = () => {
  return {
    headline: i18n.calendarNotAvailable(),
    descriptionText: null,
    imageComponent: (
      <img src={CalendarNotAvailable} alt={i18n.calendarNotAvailable()} />
    ),
    button: null,
  };
};

export const getNoUnitAssignedForCalendarOrLessonMaterials = (
  sectionId: number,
  courseVersionName: string,
  courseDisplayName: string,
  pageName: string
) => {
  return {
    headline: i18n.almostThere(),
    descriptionText: i18n.noUnitAssigned({
      page: pageName,
      courseName: courseDisplayName,
    }),
    imageComponent: <img src={NoUnitAssigned} alt={i18n.almostThere()} />,
    button: (
      <LinkButton
        href={
          '/teacher_dashboard' +
          generatePath(
            LABELED_TEACHER_NAVIGATION_PATHS.courseOverview.absoluteUrl,
            {
              sectionId: sectionId,
              courseVersionName: courseVersionName,
            }
          )
        }
        text={i18n.assignAUnit()}
      />
    ),
  };
};

interface EmptyStateProps {
  emptyStateDetails: EmptyStateItem;
}

export const EmptyState: React.FC<EmptyStateProps> = ({emptyStateDetails}) => {
  const imageComponent = emptyStateDetails?.imageComponent;
  const headline = emptyStateDetails?.headline;
  const descriptionText = emptyStateDetails?.descriptionText;
  const button = emptyStateDetails?.button;

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
