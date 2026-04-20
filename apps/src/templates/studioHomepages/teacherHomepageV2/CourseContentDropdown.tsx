import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import {Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import LinkOption from './LinkOption';
import {TaskButton} from './TaskButton';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
<<<<<<< HEAD
  disabled?: boolean;
=======
  demoType?: DemoType;
  disabled?: boolean;
  onNavigateToPath?: (path: string, eventName: string) => void;
>>>>>>> befac7035d0 (Add dropdown disabled state for demo card actions)
}

export interface CourseContentDropdownBaseProps {
  section: Section;
  disabled: boolean;
  shouldShowLessonDropdown: boolean | string;
  lessonSource: number | string;
  renderLessonOption: (lesson: UnitLessonOption) => React.ReactNode;
  renderCourseAction: () => React.ReactNode;
}

export interface UnitLessonOption {
  value: string;
  text: string;
}

export const getLessonEventName = (lessonValue: string) =>
  lessonValue.includes('/lessons/')
    ? EVENTS.SECTION_CARD_JUMP_TO_LESSON_CLICKED
    : EVENTS.SECTION_CARD_JUMP_TO_UNIT_OVERVIEW_CLICKED;

export const CourseContentDropdownBase: React.FC<
  CourseContentDropdownBaseProps
> = ({
  section,
<<<<<<< HEAD
  disabled,
  shouldShowLessonDropdown,
  lessonSource,
  renderLessonOption,
  renderCourseAction,
=======
  demoType,
  disabled = false,
  onNavigateToPath,
>>>>>>> befac7035d0 (Add dropdown disabled state for demo card actions)
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
<<<<<<< HEAD
  }, [lessonList, lessonSource, shouldShowLessonDropdown]);
=======
  }, [section, lessonList, demoType]);

  const dropdownOptions = useMemo(
    () =>
      lessonList.map(lesson =>
        onNavigateToPath ? (
          <li key={lesson.value}>
            <button
              type="button"
              className={styles.dropdownMenuItem}
              disabled={disabled}
              onClick={() =>
                onNavigateToPath(
                  lesson.value,
                  lesson.value.includes('/lessons/')
                    ? EVENTS.SECTION_CARD_JUMP_TO_LESSON_CLICKED
                    : EVENTS.SECTION_CARD_JUMP_TO_UNIT_OVERVIEW_CLICKED
                )
              }
            >
              <span>{lesson.text}</span>
            </button>
          </li>
        ) : (
          <LinkOption
            key={lesson.value}
            value={lesson.value}
            label={lesson.text}
            labelStyle={lesson.value.includes('/lessons/') ? 'i' : 'b'}
            url={lesson.value}
            eventName={
              lesson.value.includes('/lessons/')
                ? EVENTS.SECTION_CARD_JUMP_TO_LESSON_CLICKED
                : EVENTS.SECTION_CARD_JUMP_TO_UNIT_OVERVIEW_CLICKED
            }
            eventOptions={{lesson: lesson.value}}
          />
        )
      ),
    [lessonList, onNavigateToPath, disabled]
  );
>>>>>>> befac7035d0 (Add dropdown disabled state for demo card actions)

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
<<<<<<< HEAD
=======
      ) : onNavigateToPath ? (
        <button
          type="button"
          className={styles.demoActionButton}
          disabled={disabled}
          onClick={() =>
            onNavigateToPath(
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
>>>>>>> befac7035d0 (Add dropdown disabled state for demo card actions)
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
