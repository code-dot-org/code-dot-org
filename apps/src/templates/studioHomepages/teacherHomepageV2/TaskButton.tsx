import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';
import {NavLink} from 'react-router-dom';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {TEACHER_NAVIGATION_SECTIONS_URL} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';

import styles from './teacherHomepage.module.scss';

interface TaskButtonProps {
  buttonText: string;
  icon: string;
  sectionId: number;
  sectionName: string;
  path: string;
}

/**
 * TaskButton component.
 * Used to render a button that navigates to a specific page in the teacher dashboard.
 * @param buttonText - Text to display on the button.
 * @param icon - FontAwesome Icon to display on the left of the button.
 * @param sectionId - Section ID to navigate to in teacher dashboard
 * @param path - Path to navigate to in teacher dashboard
 */
export const TaskButton: React.FC<TaskButtonProps> = ({
  buttonText,
  icon,
  sectionId,
  sectionName,
  path,
}) => {
  const sendEvent = () => {
    const navEvent =
      path === 'progress'
        ? EVENTS.SECTION_CARD_VIEW_PROGRESS_CLICKED
        : path === 'materials'
        ? EVENTS.SECTION_CARD_VIEW_LESSON_MATERIALS_CLICKED
        : EVENTS.SECTION_CARD_GO_TO_COURSE_BUTTON_CLICKED;
    analyticsReporter.sendEvent(navEvent, {}, PLATFORMS.BOTH);
  };

  return (
    <NavLink
      id={`task-button-${buttonText.replaceAll(
        ' ',
        '-'
      )}-${sectionName.replaceAll(' ', '-')}`}
      className={styles.taskButtons}
      onClick={sendEvent}
      to={`${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${path}`}
    >
      <div className={styles.taskButtonLeft}>
        <FontAwesomeV6Icon
          className={styles.taskButtonIcons}
          iconName={icon}
          iconStyle={'solid'}
        />
        <BodyThreeText>{buttonText}</BodyThreeText>
      </div>
      <FontAwesomeV6Icon
        className={styles.taskButtonArrow}
        iconName={'arrow-right'}
        iconStyle={'solid'}
      />
    </NavLink>
  );
};
