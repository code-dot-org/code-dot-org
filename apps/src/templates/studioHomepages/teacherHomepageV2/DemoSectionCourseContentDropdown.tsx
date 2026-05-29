import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import {
  DemoType,
  Section,
} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import {
  CourseContentDropdownBase,
  getLessonEventName,
} from './CourseContentDropdown';

import styles from './teacherHomepage.module.scss';

interface DemoSectionCourseContentDropdownProps {
  section: Section;
  demoType?: DemoType;
  disabled?: boolean;
  beforeNavigate: (path: string, eventName: string) => void;
}

export const DemoSectionCourseContentDropdown: React.FC<
  DemoSectionCourseContentDropdownProps
> = ({section, demoType, disabled = false, beforeNavigate}) => (
  <CourseContentDropdownBase
    section={section}
    disabled={disabled}
    shouldShowLessonDropdown={Boolean(section.unitId || demoType)}
    lessonSource={demoType || section.id}
    renderLessonOption={lesson => (
      <li key={lesson.value}>
        {/* Use a button here because demo flows perform work before
            navigation. The menu item stays keyboard reachable and correctly
            exposed as an action, while non-demo entries remain real links. */}
        <button
          type="button"
          className={styles.dropdownMenuItem}
          disabled={disabled}
          aria-label={`Create demo section and go to '${lesson.text}'`}
          onClick={() =>
            beforeNavigate(lesson.value, getLessonEventName(lesson.value))
          }
        >
          <span>{lesson.text}</span>
        </button>
      </li>
    )}
    renderCourseAction={() => (
      <button
        type="button"
        className={styles.demoActionButton}
        disabled={disabled}
        onClick={() =>
          beforeNavigate(
            `courses/${section.courseVersionName}`,
            EVENTS.SECTION_CARD_GO_TO_COURSE_BUTTON_CLICKED
          )
        }
      >
        <div className={styles.taskButtonLeft}>
          <FontAwesomeV6Icon
            className={styles.taskButtonIcons}
            iconName="desktop"
            iconStyle="solid"
          />
          <Typography variant="body3" gutterBottom>
            {i18n.goToCourse()}
          </Typography>
        </div>
        <FontAwesomeV6Icon
          className={styles.taskButtonArrow}
          iconName="arrow-right"
          iconStyle="solid"
        />
      </button>
    )}
  />
);
