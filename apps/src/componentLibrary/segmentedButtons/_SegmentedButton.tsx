import React, {useCallback} from 'react';
import classnames from 'classnames';
import moduleStyles from '@cdo/apps/componentLibrary/segmentedButtons/segmentedButtons.module.scss';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

type SegmentedButtonIconProps = {
  iconName: string;
  iconStyle: 'light' | 'solid' | 'regular' | 'thin';
  title: string;
};

export type SegmentButtonType = 'withLabel' | 'iconOnly' | 'number';

export interface SegmentedButtonModel {
  /** Button Label */
  label?: string;
  /** Is button disabled */
  disabled?: boolean;
  /** Is button selected */
  selected?: boolean;
  /** Button unique value. Used for selected/not selected logic */
  value: string;
  /** Segmented Button Type */
  buttonType?: SegmentButtonType;
  /** Icon left from label*/
  iconLeft?: SegmentedButtonIconProps;
  /** Icon right from label */
  iconRight?: SegmentedButtonIconProps;
  /** Icon for IconOnly button type */
  icon?: SegmentedButtonIconProps;
}

interface SegmentedButtonProps extends SegmentedButtonModel {
  /** Segmented Button onChange handler */
  onChange: (value: string) => void;
}

const SegmentedButton: React.FunctionComponent<SegmentedButtonProps> = ({
  label,
  disabled,
  selected,
  buttonType = 'withLabel',
  iconLeft,
  iconRight,
  icon,
  value,
  onChange,
}) => {
  const handleClick = useCallback(() => onChange(value), [onChange, value]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={classnames(
        moduleStyles.segmentedButton,
        moduleStyles[`segmentedButton-${buttonType}`],
        selected && moduleStyles.selectedSegmentedButton
      )}
    >
      {buttonType === 'iconOnly' && icon && (
        <FontAwesomeV6Icon
          iconName={icon.iconName}
          iconStyle={icon.iconStyle}
          title={icon.title}
        />
      )}
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
