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
  /** Slider onChange handler
   * @param {ChangeEvent<HTMLInputElement>} event - The change event triggered by the slider. */
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** The name attribute specifies the name of an input element.
   * The name attribute is used to reference elements in JavaScript,
   * or to reference form data after a form is submitted.
   * Note: Only form elements with a name attribute will have their values passed when submitting a form. */
  name: string;
  /** The value attribute specifies the value of an input element. */
  value: number | string;
  /** Slider label */
  label?: string;
  /** Is Slider disabled */
  disabled?: boolean;
  /** Color of the slider track
   * @default 'black'* */
  color?: 'black' | 'brand' | 'white';
  /** Is the slider centered
   * @default false */
  isCentered?: boolean;
  /** Is the slider in percent mode
   * @default false */
  isPercentMode?: boolean;
  /** Step value for the slider
   * @default 1 */
  step?: number;
  /** [WIP] Array of step values for the slider */
  steps?: number[];
  /** Is the slider in right-to-left mode
   * @default false */
  isRtl?: boolean;
  /** Minimum value for the slider
   * @default 0 */
  minValue?: number;
  /** Maximum value for the slider
   * @default 100 */
  maxValue?: number;
  /** Props for the left control button */
  leftButtonProps?: ButtonProps;
  /** Props for the right control button */
  rightButtonProps?: ButtonProps;
  /** Custom class name */
  className?: string;
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
    disabled: moduleStyles.sliderBlackTrackDisabledColor,
  },
  brand: {
    fill: moduleStyles.sliderBrandTrackFillColor,
    empty: moduleStyles.sliderBrandTrackEmptyColor,
    disabled: moduleStyles.sliderBrandTrackDisabledColor,
  },
  white: {
    fill: moduleStyles.sliderWhiteTrackFillColor,
    empty: moduleStyles.sliderWhiteTrackEmptyColor,
    disabled: moduleStyles.sliderWhiteTrackDisabledColor,
  },
};

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/SliderTest.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
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
  isRtl = document.documentElement.dir === 'rtl',
  minValue = 0,
  maxValue = 100,
  leftButtonProps,
  rightButtonProps,
  className,
  ...HTMLInputAttributes
}) => {
  const labelId = `${name}-label`;
  const fillColor = sliderTrackColorsMap[color][disabled ? 'disabled' : 'fill'];
  const emptyColor =
    sliderTrackColorsMap[color][disabled ? 'disabled' : 'empty'];
  const gradientDirection = isRtl ? 'left' : 'right';

  const [backgroundStyle, setBackgroundStyle] = useState('');

  // Override min and max values for percent mode
  const minSliderValue = isPercentMode && minValue === undefined ? 0 : minValue;
  const maxSliderValue =
    isPercentMode && minValue === undefined ? 100 : maxValue;

  // TODO: Uncomment when working on adding steps support OR working on adding center mark
  // // Calculate the center value based on min and max values
  // const centerValue = (Number(minValue) + Number(maxValue)) / 2;

  // Calculate percentage fill for gradient
  const calculateFillPercent = useCallback(
    (value: number) => {
      const center = (Number(minSliderValue) + Number(maxSliderValue)) / 2;
      if (isCentered) {
        if (value >= center) {
          // Value is on the right side of the center
          return {
            fillPercent:
              ((value - center) / (Number(maxSliderValue) - center)) * 50 + 50,
            leftFill: false, // No left fill, fill right side only
          };
        } else {
          // Value is on the left side of the center
          return {
            fillPercent:
              50 - ((center - value) / (center - Number(minSliderValue))) * 50,
            leftFill: true, // Left fill from center
          };
        }
      } else {
        // Regular fill calculation
        return {
          fillPercent:
            (100 * (value - Number(minSliderValue))) /
            (Number(maxSliderValue) - Number(minSliderValue)),
          leftFill: false,
        };
      }
    },
    [isCentered, minSliderValue, maxSliderValue]
  );

  // TODO: Uncomment when working on adding steps support
  // // Function to snap the value to the nearest step in the steps array
  // const snapToStep = (value: number) => {
  //   if (!steps || steps.length === 0) {
  //     return value; // If no steps are provided, return the value as is
  //   }
  //   return steps.reduce((prev, curr) =>
  //     Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  //   );
  // };

  // Update the value on input change and snap it to the nearest step
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // TODO: Uncomment when working on adding steps support
    // const snappedValue = snapToStep(Number(event.target.value));

    const snappedValue = Number(event.target.value);
    onChange({...event, target: {...event.target, value: `${snappedValue}`}});
  };

  const handleControlButtonClick = useCallback(
    (operation: 'subtract' | 'add') => {
      const newValue = operation === 'subtract' ? +value - step : +value + step;

      if (newValue >= minValue && newValue <= maxValue) {
        onChange({
          target: {value: `${newValue}`},
        } as ChangeEvent<HTMLInputElement>);
      }
    },
    [maxValue, minValue, onChange, step, value]
  );

  // TODO: Uncomment when working on adding steps support
  // // Function to calculate the position of a step as a percentage
  // const calculateStepPosition = (stepValue: number) => {
  //   const percentage =
  //     ((stepValue - Number(minValue)) / (Number(maxValue) - Number(minValue))) *
  //     100;
  //   return `${percentage}%`;
  // };

  // Update the background gradient style based on the slider value
  useEffect(() => {
    const {fillPercent, leftFill} = calculateFillPercent(Number(value));
    if (isCentered) {
      // Centered mode: adjust gradient to fill from center outwards
      setBackgroundStyle(
        leftFill
          ? `linear-gradient(to ${gradientDirection}, ${emptyColor} ${fillPercent}%, ${fillColor} ${fillPercent}%, ${fillColor} 50%, ${emptyColor} 50%)`
          : `linear-gradient(to ${gradientDirection}, ${emptyColor} 50%, ${fillColor} 50%, ${fillColor} ${fillPercent}%, ${emptyColor} ${fillPercent}%)`
      );
    } else {
      setBackgroundStyle(
        `linear-gradient(to ${gradientDirection}, ${fillColor} ${fillPercent}%, ${emptyColor} ${fillPercent}%)`
      );
    }
  }, [
    value,
    fillColor,
    emptyColor,
    minSliderValue,
    maxSliderValue,
    calculateFillPercent,
    isCentered,
    gradientDirection,
    isRtl,
  ]);

  return (
    <div
      className={classnames(
        moduleStyles.slider,
        moduleStyles[`slider-${color}`],
        disabled && moduleStyles.isDisabled,
        className
      )}
    >
      <div className={moduleStyles.sliderLabelSection}>
        {label && (
          <label id={labelId} className={moduleStyles.sliderLabel}>
            {label}
          </label>
        )}

        {/* Display the value with a % sign if percentMode is true */}
        <span>{isPercentMode ? `${value}%` : value}</span>
      </div>

      <div className={moduleStyles.sliderMainContainer}>
        {leftButtonProps && (
          <Button
            {...defaultSliderButtonProps}
            color={color === 'white' ? 'white' : 'black'}
            onClick={() => handleControlButtonClick('subtract')}
            disabled={disabled}
            {...leftButtonProps}
          />
        )}
        <div className={moduleStyles.sliderWrapper}>
          <input
            type="range"
            name={name}
            min={minSliderValue}
            max={maxSliderValue}
            value={value}
            step={step}
            disabled={disabled}
            onChange={handleChange}
            aria-labelledby={labelId}
            style={{background: backgroundStyle}} // Apply dynamic background gradient style
            {...HTMLInputAttributes}
          />
          {/* // TODO: Uncomment when working on adding steps support OR working on adding center mark*/}
          {/*/!* Render center mark *!/*/}
          {/*{isCentered && (*/}
          {/*  <div*/}
          {/*    className={moduleStyles.centerMark}*/}
          {/*    data-testid="slider-center-mark"*/}
          {/*    style={{*/}
          {/*      left: `calc(${*/}
          {/*        ((centerValue - Number(minSliderValue)) /*/}
          {/*          (Number(maxSliderValue) - Number(minSliderValue))) **/}
          {/*        100*/}
          {/*      }% - 1px)`,*/}
          {/*    }}*/}
          {/*  />*/}
          {/*)}*/}

          {/*// TODO: Uncomment when working on adding steps support*/}
          {/*/!* Render visual step marks *!/*/}
          {/*{steps && steps.length > 0 && (*/}
          {/*  <div className={moduleStyles.stepMarksContainer}>*/}
          {/*    {steps.map((stepValue, index) => (*/}
          {/*      <div*/}
          {/*        key={index}*/}
          {/*        className={moduleStyles.stepMark}*/}
          {/*        style={{left: calculateStepPosition(stepValue)}}*/}
          {/*      />*/}
          {/*    ))}*/}
          {/*  </div>*/}
          {/*/!*)}*!/*/}
        </div>
        {rightButtonProps && (
          <Button
            {...defaultSliderButtonProps}
            color={color === 'white' ? 'white' : 'black'}
            onClick={() => handleControlButtonClick('add')}
            disabled={disabled}
            {...rightButtonProps}
          />
        )}
      </div>
    </div>
  );
};

export default Slider;
