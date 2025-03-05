import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {ActionDropdownOption} from '@code-dot-org/component-library/dropdown/actionDropdown';
import React from 'react';
import {useNavigate, NavigateFunction} from 'react-router-dom';

import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

export interface SectionOptionsDropdownProps {
  sectionId: number;
}

const onSectionSettingsClick = (
  navigate: NavigateFunction,
  sectionId: number
) => {
  navigate(
    `${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${TEACHER_NAVIGATION_PATHS.settings}`
  );
};

const onRosterClick = (navigate: NavigateFunction, sectionId: number) => {
  navigate(
    `${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${TEACHER_NAVIGATION_PATHS.roster}`
  );
};

const onLoginCardsClick = (navigate: NavigateFunction, sectionId: number) => {
  navigate(
    `${TEACHER_NAVIGATION_SECTIONS_URL}/${sectionId}/${TEACHER_NAVIGATION_PATHS.loginInfo}`
  );
};

export const SectionOptionsDropdown: React.FC<SectionOptionsDropdownProps> = ({
  sectionId,
}) => {
  const navigate = useNavigate();

  const dropdownOptions: ActionDropdownOption[] = [
    {
      value: 'sectionSettings',
      label: i18n.sectionSettings(),
      icon: {iconName: 'gear', iconStyle: 'solid'},
      onClick: () => onSectionSettingsClick(navigate, sectionId),
    },
    {
      value: 'roster',
      label: i18n.roster(),
      icon: {iconName: 'user', iconStyle: 'solid'},
      onClick: () => onRosterClick(navigate, sectionId),
    },
    {
      value: 'loginCards',
      label: i18n.loginCards(),
      icon: {iconName: 'id-card', iconStyle: 'solid'},
      onClick: () => onLoginCardsClick(navigate, sectionId),
    },
  ];

  return (
    <ActionDropdown
      name="section-options-dropdown"
      labelText="Section Options"
      menuPlacement="right"
      triggerButtonProps={{
        isIconOnly: true,
        icon: {
          iconName: 'ellipsis-vertical',
          iconStyle: 'solid',
        },
        color: 'gray',
        type: 'tertiary',
        size: 's',
        className: styles.dropdownButton,
        ariaLabel: i18n.sectionOptionsDropdown(),
      }}
      options={dropdownOptions}
    />
  );
};
