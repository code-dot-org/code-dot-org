import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState, useMemo} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import LinkOption from './LinkOption';
import {TaskButton} from './TaskButton';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
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
}) => {
  const [lessonList, setLessonList] = useState<UnitLessonOptions[]>([]);

  useEffect(() => {
    const fetchLessonList = async () => {
      HttpClient.fetchJson<UnitLessonOptions[]>(
        `/sections/${section.id}/retrieve_lessons_for_dropdown`
      )
        .then(response => setLessonList(response.value))
        .catch(error => console.error(error));
    };

    if (section.unitId && lessonList.length === 0) {
      fetchLessonList();
    }
  }, [section, lessonList]);

  const dropdownOptions = useMemo(
    () =>
      lessonList.map(lesson => (
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
      )),
    [lessonList]
  );

  return (
    <div className={styles.courseContentDropdownContainer}>
      <BodyThreeText
        className={styles.courseTitleText}
        id={`course-content-dropdown-${section.name.replaceAll(' ', '-')}`}
      >
        <b>{`${i18n.course()}: `}</b>
        {section.courseDisplayName}
      </BodyThreeText>
      {section.unitId ? (
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
