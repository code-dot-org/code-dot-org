import classNames from 'classnames';
import uniq from 'lodash/uniq';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import Chip from './_Chip';

import moduleStyles from './chip.module.scss';

export interface ChipsProps {
  /** Chips group label */
  label?: string;
  /** Chips group name */
  name: string;
  /** Chips required state */
  required?: boolean;
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
 * * (see apps/test/unit/componentLibrary/ChipsTest.jsx)
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

  return (
    <div
      className={classNames(
        moduleStyles.chips,
        moduleStyles[`chips-${color}`],
        moduleStyles[`chips-${size}`],
        className
      )}
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
              // The child's `required` prop will be set to `false` if the
              // Group's `required` prop is falsy. It will be set to `true` if
              // the Group's `required` prop is truthy AND none of the options
              // are `checked`, or `false` if at least one of the options is
              // `checked`.
              required={required ? values.length === 0 : false}
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
