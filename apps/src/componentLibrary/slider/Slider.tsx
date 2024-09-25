import classnames from 'classnames';
import React, {ChangeEvent, HTMLAttributes} from 'react';

import {Button, ButtonProps} from '@cdo/apps/componentLibrary/button';
import Typography from '@cdo/apps/componentLibrary/typography';

import moduleStyles from './slider.module.scss';

export interface SliderProps extends HTMLAttributes<HTMLInputElement> {
  /** Slider onChange handler*/
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
     The name attribute is used to reference elements in a JavaScript,
     or to reference form data after a form is submitted.
     Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value?: number | string;
  /** Slider label */
  label?: string;
  /** Is Slider disabled */
  disabled?: boolean;
  color?: 'black' | 'brand' | 'white';
  isCentered?: boolean;
  step?: number | string;
  minValue?: number | string;
  maxValue?: number | string;
  showLeftButton?: boolean;
  leftButtonProps?: ButtonProps;
  showRightButton?: boolean;
  rightButtonProps?: ButtonProps;
}

const defaultSliderButtonProps: ButtonProps = {
  type: 'tertiary',
  color: 'black',
  isIconOnly: true,
  size: 'xs',
};

// TODO:
// * MARKUP
//  - demo stepper
//  - centered mode
//  - percents mode
// * styles
// * add stories
// * add tests
// * cleanup
// * update README

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/SliderTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Slider Component.
 * Can be used to render a slider or as a part of bigger/more complex components (e.g. some forms).
 */
const Slider: React.FunctionComponent<SliderProps> = ({
  label,
  onChange,
  name,
  value,
  disabled = false,
  color = 'black',
  isCentered = false,
  step = 1,
  minValue = 0,
  maxValue = 100,
  leftButtonProps,
  rightButtonProps,
  ...HTMLAttributes
}) => {
  const labelId = `${name}-label`;
  // Calculate the center value based on min and max values
  const centerValue = (Number(minValue) + Number(maxValue)) / 2;

  // If isCentered is true and no value is provided, set the value to the center
  const sliderValue = isCentered && value === undefined ? centerValue : value;

  return (
    <label
      className={classnames(
        moduleStyles.sliderLabel,
        moduleStyles[`sliderLabel-${color}`]
      )}
    >
      <div className={moduleStyles.sliderLabelSection}>
        {label && (
          <Typography
            id={labelId}
            semanticTag="span"
            visualAppearance={'body-two'}
          >
            {label}
          </Typography>
        )}

        <span>{value || 0}</span>
      </div>

      <div className={moduleStyles.sliderMainContainer}>
        {
          <Button
            {...defaultSliderButtonProps}
            {...leftButtonProps}
            aria-label={'hesta'}
            icon={{iconName: 'turtle'}}
            // @ts-expect-error fix types later
            onClick={() => onChange({target: {value: +value - +step}})}
          />
        }
        <div className={moduleStyles.sliderWrapper}>
          <input
            type="range"
            name={name}
            min={minValue}
            max={maxValue}
            value={sliderValue}
            step={step}
            disabled={disabled}
            onChange={onChange}
            aria-labelledby={labelId}
            {...HTMLAttributes}
          />
          {isCentered && (
            <div
              className={moduleStyles.centerMark}
              style={{left: `calc(${(centerValue / +maxValue) * 100}% - 1px)`}}
            />
          )}
        </div>
        {true && (
          <Button
            {...defaultSliderButtonProps}
            {...rightButtonProps}
            aria-label={'hesta'}
            icon={{iconName: 'rabbit'}}
            // @ts-expect-error fix types later
            onClick={() => onChange({target: {value: +value + +step}})}
          />
        )}
      </div>
    </label>
  );
};

export default Slider;
