import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import {
  DemoType,
  Section,
} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import LinkOption from './LinkOption';
import {TaskButton} from './TaskButton';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
  disabled?: boolean;
}

interface DemoSectionCourseContentDropdownProps {
  section: Section;
  demoType?: DemoType;
  disabled?: boolean;
  beforeNavigate: (path: string, eventName: string) => void;
}

interface CourseContentDropdownBaseProps {
  section: Section;
  disabled: boolean;
  shouldShowLessonDropdown: boolean;
  lessonSource: number | DemoType;
  renderLessonOption: (lesson: UnitLessonOption) => React.ReactNode;
  renderCourseAction: () => React.ReactNode;
}

interface UnitLessonOption {
  value: string;
  text: string;
}

const getLessonEventName = (lessonValue: string) =>
  lessonValue.includes('/lessons/')
    ? EVENTS.SECTION_CARD_JUMP_TO_LESSON_CLICKED
    : EVENTS.SECTION_CARD_JUMP_TO_UNIT_OVERVIEW_CLICKED;

const CourseContentDropdownBase: React.FC<CourseContentDropdownBaseProps> = ({
  section,
  disabled,
  shouldShowLessonDropdown,
  lessonSource,
  renderLessonOption,
  renderCourseAction,
}) => {
  const [lessonList, setLessonList] = useState<UnitLessonOption[]>([]);

  useEffect(() => {
    const fetchLessonList = async () => {
      HttpClient.fetchJson<UnitLessonOption[]>(
        `/sections/${lessonSource}/retrieve_lessons_for_dropdown`
      )
        .then(response => setLessonList(response.value))
        .catch(error => console.error(error));
    };

    if (shouldShowLessonDropdown && lessonList.length === 0) {
      fetchLessonList();
    }
  }, [lessonList, lessonSource, shouldShowLessonDropdown]);

  return (
    <div className={styles.courseContentDropdownContainer}>
      <Typography
        className={styles.courseTitleText}
        id={`course-content-dropdown-${section.name.replaceAll(' ', '-')}`}
        variant="body3"
        gutterBottom
      >
        <b>{`${i18n.course()}: `}</b>
        {section.courseDisplayName}
      </Typography>
      {shouldShowLessonDropdown ? (
        <CustomDropdown
          className={styles.courseContentDropdown}
          name="go-to-lesson"
          labelText={i18n.jumpTo()}
          labelType="thin"
          disabled={disabled || lessonList.length === 0}
          size="m"
        >
          <ul>{lessonList.map(renderLessonOption)}</ul>
        </CustomDropdown>
      ) : (
        renderCourseAction()
      )}
    </div>
  );
};

export const CourseContentDropdown: React.FC<CourseContentDropdownProps> = ({
  section,
  disabled = false,
}) => (
  <CourseContentDropdownBase
    section={section}
    disabled={disabled}
    shouldShowLessonDropdown={Boolean(section.unitId)}
    lessonSource={section.id}
    renderLessonOption={lesson => (
      <LinkOption
        key={lesson.value}
        value={lesson.value}
        label={lesson.text}
        labelStyle={lesson.value.includes('/lessons/') ? 'i' : 'b'}
        url={lesson.value}
        eventName={getLessonEventName(lesson.value)}
        eventOptions={{lesson: lesson.value}}
      />
    )}
    renderCourseAction={() => (
      <TaskButton
        buttonText={i18n.goToCourse()}
        icon="desktop"
        sectionId={section.id}
        sectionName={section.name}
        path={`courses/${section.courseVersionName}`}
      />
    )}
  />
);

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
