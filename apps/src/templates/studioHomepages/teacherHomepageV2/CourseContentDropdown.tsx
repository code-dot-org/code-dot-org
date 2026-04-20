import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useEffect, useState, useMemo} from 'react';

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
  demoType?: DemoType;
  onNavigateToPath?: (path: string, eventName: string) => void;
}

// Interface for the unit lessons dropdown
interface UnitLessonOptions {
  value: string;
  text: string;
}

/**
 * CourseContentDropdown component.
 * Used to render a dropdown for selecting a lesson to navigate to.
 * @param section - Section object containing the course display name.
 */
export const CourseContentDropdown: React.FC<CourseContentDropdownProps> = ({
  section,
  demoType,
  onNavigateToPath,
}) => {
  const [lessonList, setLessonList] = useState<UnitLessonOptions[]>([]);

  useEffect(() => {
    const fetchLessonList = async () => {
      const sectionIdOrDemoPreset = demoType || section.id;
      HttpClient.fetchJson<UnitLessonOptions[]>(
        `/sections/${sectionIdOrDemoPreset}/retrieve_lessons_for_dropdown`
      )
        .then(response => setLessonList(response.value))
        .catch(error => console.error(error));
    };

    if ((section.unitId || demoType) && lessonList.length === 0) {
      fetchLessonList();
    }
  }, [section, lessonList, demoType]);

  const dropdownOptions = useMemo(
    () =>
      lessonList.map(lesson =>
        onNavigateToPath ? (
          <li key={lesson.value}>
            <button
              type="button"
              className={styles.dropdownMenuItem}
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
    [lessonList, onNavigateToPath]
  );

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
      {section.unitId || demoType ? (
        <CustomDropdown
          className={styles.courseContentDropdown}
          name="go-to-lesson"
          labelText={i18n.jumpTo()}
          labelType="thin"
          disabled={lessonList.length === 0}
          size="m"
        >
          <ul>{dropdownOptions}</ul>
        </CustomDropdown>
      ) : onNavigateToPath ? (
        <button
          type="button"
          className={styles.demoActionButton}
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
      ) : (
        <TaskButton
          buttonText={i18n.goToCourse()}
          icon="desktop"
          sectionId={section.id}
          sectionName={section.name}
          path={`courses/${section.courseVersionName}`}
        />
      )}
    </div>
  );
};
