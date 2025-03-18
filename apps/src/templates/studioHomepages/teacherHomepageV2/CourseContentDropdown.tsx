import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_SECTIONS_URL} from '../../teacherNavigation/TeacherNavigationPaths';

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
  const navigate = useNavigate();
  const [lessonList, setLessonList] = useState<UnitLessonOptions[]>([]);

  // Retrieve units and lessons for the section
  useEffect(() => {
    if (section.unitId) {
      HttpClient.fetchJson<UnitLessonOptions[]>(
        `/sections/${section.id}/retrieve_lessons_for_dropdown`
      )
        .then(response => {
          const lessons: UnitLessonOptions[] = response.value.map(lesson => {
            if (lesson.text.includes('Unit')) {
              lesson.text = lesson.text.replace(' - ', ': ');
            } else if (!lesson.text.includes('Lesson')) {
              lesson.text = `${i18n.lesson()} ${lesson.text}`;
            }
            return lesson;
          });
          setLessonList(lessons);
        })
        .catch(error => console.error(error));
    }
  }, [section.id, section.unitId]);

  const dropdownOptions = useMemo(() => {
    const options = [{value: i18n.goToLesson(), text: i18n.goToLesson()}];
    options.push(...lessonList);
    return options;
  }, [lessonList]);

  const onDropdownChange = (args: React.ChangeEvent<HTMLSelectElement>) => {
    if (args.target.value !== 'Go to') {
      if (!section.unitId) {
        const unit = args.target.value.replace('/s/', '');
        navigate(
          `../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/unit/${unit}`
        );
      }
      window.location.href = `..${args.target.value}`;
    }
  };

  return (
    <div className={styles.courseContentDropdownContainer}>
      <BodyThreeText>
        <b>{`${i18n.course()}: `}</b>
        {section.courseDisplayName}
      </BodyThreeText>
      {section.unitId ? (
        <SimpleDropdown
          className={styles.courseContentDropdown}
          name="go-to-lesson-dropdown"
          labelText={i18n.goToLesson()}
          isLabelVisible={false}
          items={dropdownOptions}
          selectedValue={i18n.goToLesson()}
          size="m"
          dropdownTextThickness="thin"
          onChange={args => onDropdownChange(args)}
        />
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
