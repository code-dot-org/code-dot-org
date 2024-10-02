import classnames from 'classnames';
import React, {
  ChangeEvent,
  HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {Button, ButtonProps} from '@cdo/apps/componentLibrary/button';

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
  isPercentMode?: boolean;
  step?: number | string;
  steps?: number[];
  defaultValue?: number | string;
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

const sliderTrackColorsMap = {
  black: {
    fill: moduleStyles.sliderBlackTrackFillColor,
    empty: moduleStyles.sliderBlackTrackEmptyColor,
  },
  brand: {
    fill: moduleStyles.sliderBrandTrackFillColor,
    empty: moduleStyles.sliderBrandTrackEmptyColor,
  },
  white: {
    fill: moduleStyles.sliderWhiteTrackFillColor,
    empty: moduleStyles.sliderWhiteTrackEmptyColor,
  },
};

// TODO:
// * MARKUP
//  - demo stepper +
//  - centered mode +
//  - percents mode +
// * styles
// * add stories
// * add tests
// * cleanup
// * update README

// structure:
// .slider
//  .sliderLabelSection
//    span - label
//    span - value
//  .sliderMainContainer
//    button - left button
//    .sliderWrapper
//      input[type="range"]
//      .centerMark
//      .stepMarksContainer
//        .stepMark[]
//    button - right button

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
  isPercentMode = false,
  step = 1,
  steps,
  defaultValue = 0,
  minValue = 0,
  maxValue = 100,
  leftButtonProps,
  rightButtonProps,
  ...HTMLInputAttributes
}) => {
  const labelId = `${name}-label`;
  const fillColor = sliderTrackColorsMap[color].fill;
  const emptyColor = sliderTrackColorsMap[color].empty;

  const [backgroundStyle, setBackgroundStyle] = useState('');

  // Override min and max values for percent mode
  const minSliderValue = isPercentMode && minValue === undefined ? 0 : minValue;
  const maxSliderValue =
    isPercentMode && minValue === undefined ? 100 : maxValue;

  // Calculate the center value based on min and max values
  const centerValue = (Number(minValue) + Number(maxValue)) / 2;

  // If isCentered is true and no value is provided, set the value to the center
  const sliderValue =
    isCentered && value === undefined ? centerValue : value || defaultValue;

  // Calculate percentage fill for gradient
  const calculateFillPercent = useCallback(
    (value: number) => {
      return `${
        (100 * (value - Number(minSliderValue))) /
        (Number(maxSliderValue) - Number(minSliderValue))
      }%`;
    },
    [minSliderValue, maxSliderValue]
  );
  // Function to snap the value to the nearest step in the steps array
  const snapToStep = (value: number) => {
    if (!steps || steps.length === 0) {
      return value; // If no steps are provided, return the value as is
    }
    return steps.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };

  // Update the value on input change and snap it to the nearest step
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const snappedValue = snapToStep(Number(event.target.value));
    onChange({...event, target: {...event.target, value: `${snappedValue}`}});
  };

  // Function to calculate the position of a step as a percentage
  const calculateStepPosition = (stepValue: number) => {
    const percentage =
      ((stepValue - Number(minValue)) / (Number(maxValue) - Number(minValue))) *
      100;
    return `${percentage}%`;
  };

  // Function to calculate the background style for the slider
  useEffect(() => {
    const fillPercent = calculateFillPercent(Number(sliderValue));
    setBackgroundStyle(
      `linear-gradient(to right, ${fillColor} ${fillPercent}, ${emptyColor} ${fillPercent})`
    );
  }, [
    sliderValue,
    fillColor,
    emptyColor,
    minSliderValue,
    maxSliderValue,
    calculateFillPercent,
  ]);

  return (
    <label
      className={classnames(
        moduleStyles.slider,
        moduleStyles[`slider-${color}`]
      )}
    >
      <div className={moduleStyles.sliderLabelSection}>
        {label && (
          <span id={labelId} className={moduleStyles.sliderLabel}>
            {label}
          </span>
        )}

        {/* Display the value with a % sign if percentMode is true */}
        <span>
          {isPercentMode ? `${sliderValue}%` : sliderValue || defaultValue}
        </span>
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
            min={minSliderValue}
            max={maxSliderValue}
            defaultValue={defaultValue}
            value={sliderValue}
            step={step}
            disabled={disabled}
            onChange={handleChange}
            aria-labelledby={labelId}
            style={{background: backgroundStyle}} // Apply dynamic background gradient style
            {...HTMLInputAttributes}
          />
          {isCentered && (
            <div
              className={moduleStyles.centerMark}
              style={{
                left: `calc(${
                  ((centerValue - Number(minSliderValue)) /
                    (Number(maxSliderValue) - Number(minSliderValue))) *
                  100
                }% - 1px)`,
              }}
            />
          )}
          {/* Render visual step marks */}
          {steps && steps.length > 0 && (
            <div className={moduleStyles.stepMarksContainer}>
              {steps.map((stepValue, index) => (
                <div
                  key={index}
                  className={moduleStyles.stepMark}
                  style={{left: calculateStepPosition(stepValue)}}
                />
              ))}
            </div>
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
