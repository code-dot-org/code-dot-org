import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import styles from './teacher-navigation.module.scss';

interface TeacherNavigationSidebarOptionProps {
  icon: string;
  optionTitle: string;
  isSelected: boolean;
}

const TeacherNavigationSidebarOption: React.FC<
  TeacherNavigationSidebarOptionProps
> = ({icon, optionTitle, isSelected}) => {
  return (
    <div className={styles.sidebarOption}>
      <a>
        <FontAwesomeV6Icon iconName={icon} />
        {optionTitle}
      </a>
    </div>
  );
};

export default TeacherNavigationSidebarOption;
