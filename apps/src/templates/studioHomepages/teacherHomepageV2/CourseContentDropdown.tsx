import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState, useMemo} from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

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
  const [unitLessons, setUnitLessons] = useState<UnitLessons[]>([]);

  // Retrieve units and lessons for the section
  useEffect(() => {
    HttpClient.fetchJson<UnitLessons[]>(
      `/sections/retrieve_units_and_lessons/${section.id}`
    )
      .then(response => setUnitLessons(response.value))
      .catch(error => console.error(error));
  }, [section.id]);

  const dropdownOptions = useMemo(() => {
    const options = [{value: 'Go to a lesson', text: 'Go to a lesson'}];
    options.push(...unitLessons);
    return options;
  }, [unitLessons]);

  const onDropdownChange = (args: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(args.target.value);
    window.location.href = `..${args.target.value}`;
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
        color="gray"
        dropdownTextThickness="thin"
        onChange={args => onDropdownChange(args)}
      />
    </div>
  );
};
