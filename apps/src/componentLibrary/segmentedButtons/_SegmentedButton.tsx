import React, {useCallback} from 'react';
import classnames from 'classnames';
import moduleStyles from '@cdo/apps/componentLibrary/segmentedButtons/segmentedButtons.module.scss';
import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

export type SegmentButtonType = 'withLabel' | 'iconOnly' | 'number';

export interface BaseSegmentedButtonModel {
  /** Button Label */
  label?: string;
  /** Is button disabled */
  disabled?: boolean;
  /** Is button selected */
  selected?: boolean;
  /** Button unique value. Used for selected/not selected logic */
  value: string;
  /** Segmented Button Type */
  buttonType: SegmentButtonType;
}

export interface WithLabelSegmentedButtonModel
  extends BaseSegmentedButtonModel {
  buttonType: 'withLabel';
  /** Icon left from label */
  iconLeft?: FontAwesomeV6IconProps;
  /** Icon right from label */
  iconRight?: FontAwesomeV6IconProps;
}

export interface IconOnlySegmentedButtonModel extends BaseSegmentedButtonModel {
  buttonType: 'iconOnly';
  /** Icon for IconOnly button type */
  icon: FontAwesomeV6IconProps;
}

export interface NumberSegmentedButtonModel extends BaseSegmentedButtonModel {
  buttonType: 'number';
  // No icon related properties for 'number' type
}

export type SegmentedButtonModel =
  | WithLabelSegmentedButtonModel
  | IconOnlySegmentedButtonModel
  | NumberSegmentedButtonModel;

export type SegmentedButtonProps = SegmentedButtonModel & {
  /** Segmented Button onChange handler */
  onChange: (value: string) => void;
};

/** Type Guards to make sure we can access type specific props */
export function isWithLabelSegmentedButtonModel(
  model: SegmentedButtonModel
): model is WithLabelSegmentedButtonModel {
  return model.buttonType === 'withLabel';
}

export function isIconOnlySegmentedButtonModel(
  model: SegmentedButtonModel
): model is IconOnlySegmentedButtonModel {
  return model.buttonType === 'iconOnly';
}

const SegmentedButton: React.FunctionComponent<
  SegmentedButtonProps
> = props => {
  const {
    label,
    disabled,
    selected,
    buttonType = 'withLabel',
    value,
    onChange,
  } = props;

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
      {isIconOnlySegmentedButtonModel(props) && props.icon && (
        <FontAwesomeV6Icon
          iconName={props.icon.iconName}
          iconStyle={props.icon.iconStyle}
          title={props.icon.title}
        />
      )}
      {isWithLabelSegmentedButtonModel(props) && props.iconLeft && (
        <FontAwesomeV6Icon
          iconName={props.iconLeft.iconName}
          iconStyle={props.iconLeft.iconStyle}
          title={props.iconLeft.title}
        />
      )}
      {label && <span>{label}</span>}
      {isWithLabelSegmentedButtonModel(props) && props.iconRight && (
        <FontAwesomeV6Icon
          iconName={props.iconRight.iconName}
          iconStyle={props.iconRight.iconStyle}
          title={props.iconRight.title}
        />
      )}
    </button>
  );
};

export default SegmentedButton;
