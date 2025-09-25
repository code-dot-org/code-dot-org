import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';
import {NavLink} from 'react-router-dom';

import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';

import styles from './teacherHomepage.module.scss';

interface EmptyStateButtonProps {
  buttonText: string;
  icon: string;
  sectionId: number;
  path: string;
}

/**
 * EmptyStateButton component.
 * Used to render a button that displays when a teacher has not assigned a course or added students to a section.
 * @param buttonText - Text to display on the button.
 * @param icon - FontAwesome Icon to display on the left of the button.
 * @param sectionId - Section ID to navigate to in teacher dashboard
 * @param path - Path to navigate to in teacher dashboard
 */
export const EmptyStateButton: React.FC<EmptyStateButtonProps> = ({
  buttonText,
  icon,
  sectionId,
  path,
}) => {
  const inDashboard: boolean = Object.values(TEACHER_NAVIGATION_PATHS).includes(
    path
  );
  return inDashboard ? (
    <NavLink
      id={`ui-test-empty-state-button-${buttonText.replaceAll(' ', '-')}`}
      className={styles.emptyStateButton}
      to={`${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${path}`}
    >
      <div className={styles.taskButtonLeft}>
        <FontAwesomeV6Icon
          className={styles.emptyStateButtonIcon}
          iconName={icon}
          iconStyle={'solid'}
        />
        <BodyThreeText>{buttonText}</BodyThreeText>
      </div>
      <FontAwesomeV6Icon
        className={styles.emptyStateButtonIcon}
        iconName={'plus'}
        iconStyle={'solid'}
      />
    </NavLink>
  ) : (
    <a
      id={`ui-test-empty-state-button-${buttonText.replaceAll(' ', '-')}`}
      className={styles.emptyStateButton}
      href={path}
    >
      <div className={styles.taskButtonLeft}>
        <FontAwesomeV6Icon
          className={styles.emptyStateButtonIcon}
          iconName={icon}
          iconStyle={'solid'}
        />
        <BodyThreeText>{buttonText}</BodyThreeText>
      </div>
      <FontAwesomeV6Icon
        className={styles.emptyStateButtonIcon}
        iconName={'plus'}
        iconStyle={'solid'}
      />
    </a>
  );
};
