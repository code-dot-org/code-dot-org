import {
  default as FontAwesomeV6Icon,
  kitIcons,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';
import {NavLink, generatePath} from 'react-router-dom';

import {LABELED_TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

import styles from './teacher-navigation.module.scss';

interface SidebarOptionProps {
  isSelected: boolean;
  sectionId?: number;
  courseVersionName?: string;
  unitPosition?: number;
  unitName: string | null;
  pathKey: keyof typeof LABELED_TEACHER_NAVIGATION_PATHS;
  showErrorIcon: boolean;
}

const SidebarOption: React.FC<SidebarOptionProps> = ({
  isSelected,
  sectionId,
  courseVersionName,
  unitPosition,
  unitName,
  pathKey,
  showErrorIcon,
}) => {
  const option = LABELED_TEACHER_NAVIGATION_PATHS[pathKey];
  // Only some options carry a status tag (e.g. "Beta").
  const tag = 'tag' in option ? option.tag : undefined;
  return (
    <NavLink
      key={option.label}
      to={generatePath(option.absoluteUrl, {
        sectionId: sectionId,
        courseVersionName: courseVersionName,
        unitPosition: unitPosition,
        unitName: unitName,
      })}
      className={classNames(styles.sidebarOption, {
        [styles.selected]: isSelected,
      })}
    >
      <div className={styles.iconContainer}>
        <FontAwesomeV6Icon
          className={styles.optionIcon}
          iconName={option.icon || ''}
          iconFamily={kitIcons.has(option.icon || '') ? 'kit' : undefined}
        />
      </div>
      <Typography
        className={classNames(styles.linkText, {
          [styles.selected]: isSelected,
        })}
        variant="body2"
        gutterBottom
      >
        {option.label}
      </Typography>
      {tag && (
        <Tags className={styles.navTag} tagsList={[{label: tag}]} size="s" />
      )}
      {showErrorIcon && (
        <FontAwesomeV6Icon
          iconName="triangle-exclamation"
          iconStyle="solid"
          className={styles.errorIcon}
        />
      )}
    </NavLink>
  );
};

export default SidebarOption;
