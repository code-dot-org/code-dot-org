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
  /** Is button disabled */
  disabled?: boolean;
  /** Is button selected */
  selected?: boolean;
  /** Button onClick handler */
  onClick: () => void;
  /** Segmented Button Type */
  buttonType?: SegmentButtonType;
  /** Icon left from label*/
  iconLeft?: SegmentedButtonIconProps;
  /** Icon right from label */
  iconRight?: SegmentedButtonIconProps;
}

const SegmentedButton: React.FunctionComponent<SegmentedButtonProps> = ({
  label,
  disabled,
  selected,
  onClick,
  buttonType = 'withLabel',
  iconLeft,
  iconRight,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
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
