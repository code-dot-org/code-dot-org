import classnames from 'classnames';
import React, {useCallback} from 'react';

import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import moduleStyles from '@cdo/apps/componentLibrary/segmentedButtons/segmentedButtons.module.scss';

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
  /** Segmented Button Type
   * Please note (!) 'buttonType' affects which icons(props) can be rendered.
   * 'withLabel' - we can render 'iconLeft' and/or 'iconRight' only (both of them are optional)
   * 'iconOnly' - we have to render 'icon'.
   * 'number' - we can not render any icons at all.
   * */
  buttonType?: SegmentButtonType;
  /** Icon left from label*/
  iconLeft?: FontAwesomeV6IconProps;
  /** Icon right from label */
  iconRight?: FontAwesomeV6IconProps;
  /** Icon for IconOnly button type */
  icon?: FontAwesomeV6IconProps;
  id?: string;
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
  id,
}) => {
  const handleClick = useCallback(() => onChange(value), [onChange, value]);

  return (
    <button
      id={id}
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
      {buttonType === 'withLabel' && iconLeft && (
        <FontAwesomeV6Icon
          iconName={iconLeft.iconName}
          iconStyle={iconLeft.iconStyle}
          title={iconLeft.title}
        />
      )}
      {label && <span>{label}</span>}
      {buttonType === 'withLabel' && iconRight && (
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
