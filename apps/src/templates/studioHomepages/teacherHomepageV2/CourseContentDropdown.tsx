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

  // Retrieve units and lessons for the section
  useEffect(() => {
    if (section.unitId) {
      HttpClient.fetchJson<UnitLessonOptions[]>(
        `/sections/${section.id}/retrieve_lessons_for_dropdown`
      )
        .then(response => setLessonList(response.value))
        .catch(error => console.error(error));
    }
  }, [section.id, section.unitId]);

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
      <BodyThreeText>
        <b>{`${i18n.course()}: `}</b>
        {section.courseDisplayName}
      </BodyThreeText>
      {section.unitId ? (
        <CustomDropdown
          name="go-to-lesson-dropdown"
          labelText={i18n.jumpTo()}
          labelType="thin"
          size="m"
          disabled={lessonList.length === 0}
        >
          <ul>{dropdownOptions}</ul>
        </CustomDropdown>
      ) : (
        <TaskButton
          buttonText={i18n.goToCourse()}
          icon="desktop"
          sectionId={section.id}
          path={`courses/${section.courseVersionName}`}
        />
      )}
    </div>
  );
};
