import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

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
    <div
      className={classNames(styles.sidebarOption, {
        [styles.selected]: isSelected,
      })}
    >
      <FontAwesomeV6Icon className={styles.optionIcon} iconName={icon} />
      <BodyTwoText className={styles.linkText}>{optionTitle}</BodyTwoText>
    </div>
  );
};

export default TeacherNavigationSidebarOption;
