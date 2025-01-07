import classNames from 'classnames';
import uniq from 'lodash/uniq';
import {useEffect} from 'react';

import {ComponentSizeXSToL} from '@/common/types';

import Chip from './_Chip';

import moduleStyles from './chip.module.scss';

export interface ChipsProps {
  /** Chips group label */
  label?: string;
  /** Chips group name */
  name: string;
  /** Chips required state */
  required?: boolean;
  /** Error to display if selection required and none made */
  requiredMessageText?: string;
  /** Chips disabled state */
  disabled?: boolean;
  /** Chips text type (thickness) */
  textThickness?: 'thick' | 'thin';
  /** List of chips to render */
  options: {value: string; label: string}[];
  /** List of selected chips values */
  values: string[];
  /** Callback to update selected chips values */
  setValues: (values: string[]) => void;
  /** Chips color */
  color?: 'black' | 'gray';
  /** Size of chips */
  size?: ComponentSizeXSToL;
  /** Custom className */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Chips.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Chips Component.
 * Can be used to render chips or as a part of bigger/more complex components (e.g. forms).
 */
const Chips: React.FunctionComponent<ChipsProps> = ({
  label,
  name,
  required,
  requiredMessageText,
  disabled,
  options,
  values,
  setValues,
  textThickness = 'thin',
  color = 'black',
  size = 'm',
  className,
}) => {
  // NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
  // natively understands it as an array. Set `required` to `true` if you want
  // the user to have to select at least one of the options to proceed.
  // You probably want `values` to start out as an empty array.
  const inputName = `${name}[]`;

  useEffect(() => {
    if (required && !requiredMessageText) {
      console.warn(
        'For usages of the Chips component where the "required" prop is set to true, a localized error message to display when no option is selected is needed.',
      );
    }
  }, [required, requiredMessageText]);

  return (
    <div
      className={classNames(
        moduleStyles.chips,
        moduleStyles[`chips-${color}`],
        moduleStyles[`chips-${size}`],
        className,
      )}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid={`chips-${name}`}
    >
      <fieldset>
        {label && <label className={moduleStyles.groupLabel}>{label}</label>}

        <div className={moduleStyles.chipsContainer}>
          {options.map(option => (
            <Chip
              label={option.label}
              name={inputName}
              value={option.value}
              key={option.value}
              textThickness={textThickness}
              checked={values.includes(option.value)}
              // The `required` prop for each individual _Chip (option) is determined based on the `required` prop
              // of the Chips (group):
              // - If the Chips (group) `required` prop is `false`, all _Chip (option) `required` props will also
              // be `false`.
              // - If the Chips (group) `required` prop is `true`, the _Chip (option) `required` prop will be:
              //    - `true` if none of the _Chip (options) are `checked`.
              //    - `false` if at least one of the _Chip (options) is `checked`.
              required={required ? values.length === 0 : false}
              requiredMessageText={requiredMessageText}
              disabled={disabled}
              onCheckedChange={checked => {
                if (checked) {
                  // Add this value to the `values` array.
                  setValues(uniq([...values, option.value]));
                } else {
                  // Remove this value from the `values` array.
                  setValues(values.filter(v => v !== option.value));
                }
              }}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default Chips;
