import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_BASE_URL,
  TEACHER_NAVIGATION_PATHS,
  TEACHER_NAVIGATION_SECTIONS_URL,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';

import styles from './prepare-list.module.scss';

export type PrepareEmptyStateType =
  | 'no_course'
  | 'no_unit'
  | 'no_students'
  | 'completed'
  | 'unavailable';

interface PrepareEmptyStateProps {
  type: PrepareEmptyStateType;
  section: Section;
}

// Where a teacher goes to (re)assign a course/unit, or add students, for this section.
const catalogPath = '/catalog';
const sectionPagePath = (sectionId: number, page: string) =>
  `${TEACHER_NAVIGATION_BASE_URL}${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${page}`;
const courseOverviewPath = (sectionId: number) =>
  sectionPagePath(sectionId, 'courses');
const rosterPath = (sectionId: number) =>
  sectionPagePath(sectionId, TEACHER_NAVIGATION_PATHS.roster);

const PrepareEmptyState: React.FC<PrepareEmptyStateProps> = ({
  type,
  section,
}) => {
  const courseName =
    section.courseDisplayName ?? section.unitName ?? 'this course';

  const content = {
    no_course: {
      title: 'No course assigned',
      description:
        'Assign a course to access prep content for this class section.',
      buttonText: 'Assign a course',
      buttonHref: catalogPath,
    },
    no_unit: {
      title: 'Almost there!',
      description: `Choose a unit within ${courseName} to access prep content for this class section.`,
      buttonText: 'Assign a unit',
      buttonHref: courseOverviewPath(section.id),
    },
    no_students: {
      title: 'No students yet',
      description: `Add students to this class section to access prep content customized to their progress in the unit.`,
      buttonText: 'Add students',
      buttonHref: rosterPath(section.id),
    },
    completed: {
      title: "You're all done!",
      description: `There's nothing left to prep for in ${courseName}. Assign something new to keep using prep content.`,
      buttonText: 'Change assignment',
      buttonHref: courseOverviewPath(section.id),
    },
    unavailable: {
      title: "The assigned course isn't available anymore",
      description: `${courseName} has been retired. Assign something new to keep using prep content.`,
      buttonText: 'Browse courses',
      buttonHref: catalogPath,
    },
  }[type];

  return (
    <div className={styles.sectionEmptyState}>
      <h3 className={styles.sectionEmptyStateTitle}>{content.title}</h3>
      <p className={styles.sectionEmptyStateDescription}>
        {content.description}
      </p>
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        href={content.buttonHref}
      >
        {content.buttonText}
      </MuiButton>
    </div>
  );
};

export default PrepareEmptyState;
