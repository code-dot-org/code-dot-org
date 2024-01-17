import React from 'react';
import classnames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import SegmentedButton, {
  SegmentedButtonModel,
  SegmentButtonType,
  isIconOnlySegmentedButtonModel,
  isWithLabelSegmentedButtonModel,
} from './_SegmentedButton';
import moduleStyles from './segmentedButtons.module.scss';

export interface SegmentedButtonsProps {
  /** Array of props for Segmented Buttons to render */
  buttons: SegmentedButtonModel[];
  /** Segmented Buttons Size*/
  size?: ComponentSizeXSToL;
  /** Segmented Buttons Type (visual)*/
  type?: SegmentButtonType;
  /** Segmented Buttons selected button unique value */
  selectedButtonValue: string;
  /** Segmented Buttons onChange handler */
  onChange: (value: string) => void;
  /** Custom className (for example if you want to set max width of the button and/or truncate overflowed text)*/
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/SegmentedButtonsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 * Design System: Segmented Buttons Component.
 * Can be used to render Segmented Buttons. (Group of Buttons)
 */
const SegmentedButtons: React.FunctionComponent<SegmentedButtonsProps> = ({
  buttons,
  selectedButtonValue,
  onChange,
  className,
  size = 'm',
  type = 'withLabel',
}) => {
  return (
    <div
      className={classnames(
        moduleStyles.segmentedButtons,
        moduleStyles[`segmentedButtons-${size}`],
        className
      )}
    >
      {buttons.map(buttonProps => {
        const {label, disabled, value, buttonType} = buttonProps;
        return (
          <SegmentedButton
            key={label}
            selected={selectedButtonValue === value}
            label={label}
            onChange={onChange}
            disabled={disabled}
            iconLeft={
              isWithLabelSegmentedButtonModel(buttonProps)
                ? buttonProps.iconLeft
                : undefined
            }
            iconRight={
              isWithLabelSegmentedButtonModel(buttonProps)
                ? buttonProps.iconRight
                : undefined
            }
            icon={
              isIconOnlySegmentedButtonModel(buttonProps)
                ? buttonProps.icon
                : undefined
            }
            buttonType={buttonType || type}
            value={value}
          />
        );
      })}
    </div>
  );
};

export default SegmentedButtons;
