import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import styles from './teacher-navigation.module.scss';

interface TeacherNavigationSidebarOptionProps {
  icon: string;
  optionTitle: string;
  isSelected: boolean;
}

// consider making a function to apply styles based on isSelected
// const appliedStyles ={
//     isSelected ? styles.selected : styles.sidebarOption
// }

const TeacherNavigationSidebarOption: React.FC<
  TeacherNavigationSidebarOptionProps
> = ({icon, optionTitle, isSelected}) => {
  return (
    <div className={styles.sidebarOption}>
      <FontAwesomeV6Icon className={styles.optionIcon} iconName={icon} />
      <BodyTwoText className={styles.linkText}>{optionTitle}</BodyTwoText>
    </div>
  );
};

export default TeacherNavigationSidebarOption;
