import classNames from 'classnames';
import React from 'react';
import {NavLink, generatePath} from 'react-router-dom';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

interface SidebarOptionProps {
  icon: string;
  isSelected: boolean;
  sectionId: number;
  pathKey: keyof typeof LABELED_TEACHER_NAVIGATION_PATHS;
}

const SidebarOption: React.FC<SidebarOptionProps> = ({
  icon,
  isSelected,
  sectionId,
  pathKey,
}) => {
  // Perhaps UseMemo here instead of generating the path each time
  // const link = LABELED_TEACHER_NAVIGATION_PATHS[pathKey].absoluteUrl;
  // const optionTitle = LABELED_TEACHER_NAVIGATION_PATHS[pathKey].label;

  return (
    <NavLink
      key={LABELED_TEACHER_NAVIGATION_PATHS[pathKey].label}
      to={generatePath(LABELED_TEACHER_NAVIGATION_PATHS[pathKey].absoluteUrl, {
        sectionId: sectionId,
      })}
      className={classNames(styles.sidebarOption, {
        [styles.selected]: isSelected,
      })}
    >
      <FontAwesomeV6Icon className={styles.optionIcon} iconName={icon} />
      <BodyTwoText className={styles.linkText}>
        {LABELED_TEACHER_NAVIGATION_PATHS[pathKey].label}
      </BodyTwoText>
    </NavLink>
  );
};

export default SidebarOption;
