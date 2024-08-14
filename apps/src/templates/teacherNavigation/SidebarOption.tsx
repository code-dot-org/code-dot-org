import classNames from 'classnames';
import React from 'react';
import {NavLink, generatePath} from 'react-router-dom';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import styles from './teacher-navigation.module.scss';

interface SidebarOptionProps {
  icon: string;
  optionTitle: string;
  isSelected: boolean;
  link: string;
  sectionId: number;
}

const SidebarOption: React.FC<SidebarOptionProps> = ({
  icon,
  optionTitle,
  isSelected,
  link,
  sectionId,
}) => {
  return (
    <NavLink
      key={link}
      to={generatePath(link, {sectionId: sectionId})}
      className={classNames(styles.sidebarOption, {
        [styles.selected]: isSelected,
      })}
    >
      <FontAwesomeV6Icon className={styles.optionIcon} iconName={icon} />
      <BodyTwoText className={styles.linkText}>{optionTitle}</BodyTwoText>
    </NavLink>
  );
};

export default SidebarOption;
