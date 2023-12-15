import React from 'react';
import classnames from 'classnames';
import moduleStyles from '@cdo/apps/componentLibrary/segmentedButtons/segmentedButtons.module.scss';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

type SegmentedButtonIconProps = {
  iconName: string;
  iconStyle: 'light' | 'solid' | 'regular' | 'thin';
  title: string;
};

export type SegmentButtonType = 'withLabel' | 'iconOnly' | 'number';

export interface SegmentedButtonProps {
  /** Button Label */
  label?: string;
  disabled?: boolean;
  selected?: boolean;
  onClick: () => void;
  buttonType: SegmentButtonType;
  iconLeft?: SegmentedButtonIconProps;
  iconRight?: SegmentedButtonIconProps;
}

const SegmentedButton: React.FunctionComponent<SegmentedButtonProps> = ({
  label,
  disabled,
  selected,
  onClick,
  buttonType,
  iconLeft,
  iconRight,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      key={label}
      className={classnames(
        moduleStyles.segmentedButton,
        moduleStyles[`segmentedButton-${buttonType}`],
        selected && moduleStyles.selectedSegmentedButton
      )}
    >
      {iconLeft && (
        <FontAwesomeV6Icon
          iconName={iconLeft.iconName}
          iconStyle={iconLeft.iconStyle}
          title={iconLeft.title}
        />
      )}
      {label && <span>{label}</span>}
      {iconRight && (
        <FontAwesomeV6Icon
          iconName={iconRight.iconName}
          iconStyle={iconRight.iconStyle}
          title={iconRight.title}
        />
      )}
    </button>
  );
};

export default SegmentedButton;
