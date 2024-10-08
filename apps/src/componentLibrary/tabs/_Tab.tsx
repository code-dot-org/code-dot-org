import classNames from 'classnames';
import React, {useCallback} from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {TooltipProps, WithTooltip} from '@cdo/apps/componentLibrary/tooltip';

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
  /** Tab tooltip props */
  tooltip?: TooltipProps;
  /** Tab icon */
  icon?: FontAwesomeV6IconProps;
  /** Tab size (e.g. Used for closableButton) */
  size?: ComponentSizeXSToL;
  /** Tab content */
  tabContent: React.ReactNode;
  /** Is tab disabled */
  disabled?: boolean;
  /** Is tab closable */
  isClosable?: boolean;
  /** Callback when tab is closed */
  onClose?: () => void;
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

const renderTabButtonContent = (
  isIconOnly: boolean,
  icon?: FontAwesomeV6IconProps,
  text?: string,
  iconLeft?: FontAwesomeV6IconProps,
  iconRight?: FontAwesomeV6IconProps,
  isClosable?: boolean
) => {
  if (isIconOnly && icon) {
    return <FontAwesomeV6Icon {...icon} />;
  }
  return (
    <>
      {iconLeft && <FontAwesomeV6Icon {...iconLeft} />}
      {text && <span>{text}</span>}
      {iconRight && !isClosable && <FontAwesomeV6Icon {...iconRight} />}
    </>
  );
};
const _Tab: React.FunctionComponent<TabsProps> = ({
  isSelected,
  onClick,
  value,
  text,
  iconLeft,
  iconRight,
  icon,
  tooltip,
  size,
  tabPanelId,
  tabButtonId,
  disabled = false,
  isIconOnly = false,
  isClosable = false,
  onClose = () => {},
}) => {
  const handleClick = useCallback(() => onClick(value), [onClick, value]);
  checkTabForErrors(isIconOnly, icon, text);

  const buttonContent = renderTabButtonContent(
    isIconOnly,
    icon,
    text,
    iconLeft,
    iconRight,
    isClosable
  );

  const buttonElement = (
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
      {buttonContent}
      {isClosable && (
        <CloseButton
          onClick={onClose}
          size={size}
          aria-label={`Close ${text}`}
        />
      )}
    </button>
  );

  return (
    <li role="presentation">
      {tooltip ? (
        <WithTooltip tooltipProps={tooltip}>{buttonElement}</WithTooltip>
      ) : (
        buttonElement
      )}
    </li>
  );
};

export default _Tab;
