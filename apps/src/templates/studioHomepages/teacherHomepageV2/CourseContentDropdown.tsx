import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_SECTIONS_URL} from '../../teacherNavigation/TeacherNavigationPaths';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
}

interface UnitLessons {
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
  const [unitLessons, setUnitLessons] = useState<UnitLessons[]>([]);

  // Retrieve units and lessons for the section
  useEffect(() => {
    HttpClient.fetchJson<UnitLessons[]>(
      `/sections/retrieve_lessons_for_dropdown/${section.id}`
    )
      .then(response => {
        const lessons: UnitLessons[] = response.value.map(lesson => {
          if (lesson.text.includes('Unit')) {
            lesson.text = lesson.text.replace(' - ', ': ');
          } else {
            lesson.text = `${i18n.lesson()} ${lesson.text}`;
          }
          return lesson;
        });
        setUnitLessons(lessons);
      })
      .catch(error => console.error(error));
  }, [section.id, section.unitId]);

  const dropdownOptions = useMemo(() => {
    const options = [{value: 'Go to', text: i18n.goTo()}];
    options.push(...unitLessons);
    return options;
  }, [unitLessons]);

  const onDropdownChange = (args: React.ChangeEvent<HTMLSelectElement>) => {
    if (args.target.value !== 'Go to') {
      if (!section.unitId) {
        const unit = args.target.value.replace('/s/', '');
        navigate(
          `../${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/unit/${unit}`
        );
      }
      console.log(args.target.value);
      window.location.href = `..${args.target.value}`;
    }
  };

  return (
    <div className={styles.courseContentDropdownContainer}>
      <BodyThreeText>
        <b>{`${i18n.course()}: `}</b>
        {section.courseDisplayName}
      </BodyThreeText>
      <SimpleDropdown
        className={styles.courseContentDropdown}
        name="go-to-lesson-dropdown"
        labelText="Go to a lesson"
        isLabelVisible={false}
        items={dropdownOptions}
        selectedValue="Go to a lesson"
        size="m"
        dropdownTextThickness="thin"
        onChange={args => onDropdownChange(args)}
      />
    </div>
  );
};
