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
  disabled?: boolean;
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
  disabled,
  shouldShowLessonDropdown,
  lessonSource,
  renderLessonOption,
  renderCourseAction,
}) => {
  const [lessonList, setLessonList] = useState<UnitLessonOption[]>([]);
  const [hasLoadedLessonList, setHasLoadedLessonList] = useState(false);

  useEffect(() => {
    setLessonList([]);
    setHasLoadedLessonList(false);
  }, [lessonSource]);

  useEffect(() => {
    const fetchLessonList = async () => {
      HttpClient.fetchJson<UnitLessonOption[]>(
        `/sections/${lessonSource}/retrieve_lessons_for_dropdown`
      )
        .then(response =>
          setLessonList(Array.isArray(response.value) ? response.value : [])
        )
        .finally(() => setHasLoadedLessonList(true))
        .catch(error => console.error(error));
    };

    if (shouldShowLessonDropdown && !hasLoadedLessonList) {
      fetchLessonList();
    }
  }, [hasLoadedLessonList, lessonSource, shouldShowLessonDropdown]);

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
