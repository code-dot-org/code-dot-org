import classNames from 'classnames';
import React, {useCallback} from 'react';

import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import moduleStyles from '@cdo/apps/componentLibrary/tabs/tabs.module.scss';

export interface TabModel {
  value: string;
  text: string;
  iconLeft?: FontAwesomeV6IconProps;
  iconRight?: FontAwesomeV6IconProps;
  isIconOnly?: boolean;
  icon?: FontAwesomeV6IconProps;
  tabContent: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps extends TabModel {
  isSelected: boolean;
  onClick: (value: string) => void;
  tabPanelId: string;
  tabButtonId: string;
}

const _Tab: React.FunctionComponent<TabsProps> = ({
  isSelected,
  onClick,
  value,
  text,
  iconLeft,
  iconRight,
  isIconOnly,
  icon,
  tabPanelId,
  tabButtonId,
  disabled = false,
}) => {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);

  return (
    <li
      role="presentation"
      className={classNames(
        moduleStyles.tab,
        isSelected && moduleStyles.active
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={tabPanelId}
        id={tabButtonId}
        onClick={handleClick}
        className={classNames(isSelected && moduleStyles.active)}
        disabled={disabled}
      >
        {icon?.title}
        {iconLeft?.title}
        {text}
        {iconRight?.title}
      </button>
    </li>
  );
};

export default _Tab;
