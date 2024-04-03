import classNames from 'classnames';
import React, {useCallback} from 'react';

import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from './tabs.module.scss';

export interface TabModel {
  /** Unique value of the tab */
  value: string;
  /** Tab text */
  text?: string;
  /** Icon left from label */
  iconLeft?: FontAwesomeV6IconProps;
  /** Icon right from label */
  iconRight?: FontAwesomeV6IconProps;
  /** Whether button should be icon only */
  isIconOnly?: boolean;
  /** Tab icon */
  icon?: FontAwesomeV6IconProps;
  /** Tab content */
  tabContent: React.ReactNode;
  /** Is tab disabled */
  disabled?: boolean;
}

interface TabsProps extends TabModel {
  /** Is tab selected */
  isSelected: boolean;
  /** Tab onClick handler */
  onClick: (value: string) => void;
  /** The ID of the panel element that this tab controls */
  tabPanelId: string;
  /** The ID of the button element (_Tab) */
  tabButtonId: string;
}

const checkTabForErrors = (
  isIconOnly: boolean,
  icon: FontAwesomeV6IconProps | undefined,
  text: string | undefined
) => {
  if (isIconOnly && !icon) {
    throw new Error('IconOnly tabs must have an icon');
  }

  if (!isIconOnly && !text) {
    throw new Error('Tabs that are not icon only must have text');
  }
};

const _Tab: React.FunctionComponent<TabsProps> = ({
  isSelected,
  onClick,
  value,
  text,
  iconLeft,
  iconRight,
  icon,
  tabPanelId,
  tabButtonId,
  disabled = false,
  isIconOnly = false,
}) => {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);
  checkTabForErrors(isIconOnly, icon, text);

  return (
    <li role="presentation">
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={tabPanelId}
        id={tabButtonId}
        className={classNames(
          isSelected && moduleStyles.selectedTab,
          isIconOnly && moduleStyles.iconOnlyTab
        )}
        onClick={handleClick}
        disabled={disabled}
      >
        {isIconOnly && icon && <FontAwesomeV6Icon {...icon} />}
        {!isIconOnly && (
          <>
            {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
            {text && <span>{text}</span>}
            {iconRight && <FontAwesomeV6Icon {...iconRight} />}
          </>
        )}
      </button>
    </li>
  );
};

export default _Tab;
