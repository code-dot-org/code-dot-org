import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
}

export const CourseContentDropdown: React.FC<CourseContentDropdownProps> = ({
  section,
}) => {
  const dropdownItems = [
    {
      value: 'Go to a lesson',
      text: 'Go to a lesson',
    },
    {
      value: 'test1',
      text: 'test1',
    },
    {
      value: 'test2',
      text: 'test2',
    },
    {
      value: 'test3',
      text: 'test3',
    },
  ];

  const onDropdownChange = (args: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(args.target.value);
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
        items={dropdownItems}
        selectedValue="Go to a lesson"
        size="m"
        color="gray"
        dropdownTextThickness="thin"
        onChange={args => onDropdownChange(args)}
      />
    </div>
  );
};
