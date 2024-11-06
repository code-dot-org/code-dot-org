import React from 'react';
import {NavLink, generatePath} from 'react-router-dom';

import {LinkButton} from '@cdo/apps/componentLibrary/button';
import emptyDesk from '@cdo/apps/templates/teacherDashboard/images/empty_desk.svg';
import blankScreen from '@cdo/apps/templates/teacherDashboard/images/no_curriculum_assigned.svg';
import NoUnitAssigned from '@cdo/apps/templates/teacherNavigation/images/NoUnitAssigned.svg';
import TeacherDashboardEmptyState from '@cdo/apps/templates/teacherNavigation/images/TeacherDashboardEmptyState.svg';
import i18n from '@cdo/locale';

import {
  LABELED_TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_PATHS,
} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

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
