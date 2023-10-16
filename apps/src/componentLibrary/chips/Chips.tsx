import React, {useEffect, useRef} from 'react';
import _ from 'lodash';

const commonI18n = require('@cdo/locale');
import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './chip.module.scss';

export interface ChipProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  required: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Chip: React.FunctionComponent<ChipProps> = ({
  label,
  name,
  value,
  checked,
  required,
  disabled,
  onCheckedChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = `multi-${_.uniqueId()}`;

  useEffect(() => {
    // Reset validity on every render so it gets checked again.
    // Otherwise, removing the `required` attribute doesn't work as expected.
    const input = inputRef.current;
    if (input) {
      input.setCustomValidity('');
    }
  }, [inputRef, onCheckedChange]);

  return (
    <div>
      <label className={moduleStyles.chip}>
        <input
          ref={inputRef}
          id={uniqueId}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          required={required}
          disabled={disabled}
          onChange={e => {
            onCheckedChange(e.target.checked);
            // Reset validity so it gets checked again.
            e.target.setCustomValidity('');
          }}
          onInvalid={e => {
            (e.target as HTMLInputElement).setCustomValidity(
              commonI18n.chooseAtLeastOne()
            );
          }}
        />
        {label}
      </label>

      {/*<label htmlFor={uniqueId}></label>*/}
    </div>
  );
};

export interface ChipsProps {
  label?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  options: {value: string; label: string}[];
  values: string[];
  setValues: (values: string[]) => void;
  size?: ComponentSizeXSToL;
}

// NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
// natively understands it as an array. Set `required` to `true` if you want
// the user to have to select at least one of the options to proceed.
// You probably want `values` to start out as an empty array.
// TODO: add different sizes
/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/ChipsTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 *
 * Design System: Chips Component.
 * Can be used to render chips or as a part of bigger/more complex components (e.g. some forms).
 */
const Chips: React.FunctionComponent<ChipsProps> = ({
  label,
  name,
  required,
  disabled,
  options,
  values,
  setValues,
  size = 'm',
}) => {
  const inputName = `${name}[]`;

  return (
    <div className={moduleStyles.chips} data-testid={`chips-${name}`}>
      <fieldset>
        {label && <label className={moduleStyles.groupLabel}>{label}</label>}

        {options.map(option => (
          <Chip
            label={option.label}
            name={inputName}
            value={option.value}
            key={option.value}
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
                setValues(_.uniq([...values, option.value]));
              } else {
                // Remove this value from the `values` array.
                setValues(values.filter(v => v !== option.value));
              }
            }}
          />
        ))}
      </fieldset>
    </div>
  );
};

export default Chips;
