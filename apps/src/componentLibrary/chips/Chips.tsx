import React, {useEffect} from 'react';
import _ from 'lodash';
// import i18n from '@cdo/locale';
import styles from './chip.module.scss';

export interface ChipProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  required: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Chip: React.FunctionComponent<ChipProps> = ({
  label,
  name,
  value,
  checked,
  required,
  onCheckedChange,
}) => {
  const uniqueId = `multi-${_.uniqueId()}`;

  useEffect(() => {
    // Reset validity on every render so it gets checked again.
    // Otherwise, removing the `required` attribute doesn't work as expected.
    const input = document.querySelector(
      `input#${uniqueId}`
    ) as HTMLInputElement;
    if (input) {
      input.setCustomValidity('');
    }
  });

  return (
    <div>
      <input
        id={uniqueId}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        required={required}
        onChange={e => {
          onCheckedChange(e.target.checked);
          // Reset validity so it gets checked again.
          e.target.setCustomValidity('');
        }}
        onInvalid={e => {
          // e.target.setCustomValidity(i18n.chooseAtLeastOne());
        }}
      />
      <label htmlFor={uniqueId}>{label}</label>
    </div>
  );
};

export interface ChipsProps {
  label?: string;
  name: string;
  required?: boolean;
  options: {value: string; label: string}[];
  values: string[];
  setValues: (values: string[]) => void;
  invalidMessage?: string;
}

// NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
// natively understands it as an array. Set `required` to `true` if you want
// the user to have to select at least one of the options to proceed.
// You probably want `values` to start out as an empty array.
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
const MultiSelectGroup: React.FunctionComponent<ChipsProps> = ({
  label,
  name,
  required,
  options,
  values,
  setValues,
}) => {
  const inputName = `${name}[]`;

  return (
    <div className={styles.multiSelectGroup} data-testid={`chips-${name}`}>
      <fieldset>
        {label && <label className={styles.typographyLabel}>{label}</label>}

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

// function MultiSelectButton2({}) {}
//
// MultiSelectButton2.propTypes = {
//   label: PropTypes.string.isRequired,
//   name: PropTypes.string.isRequired,
//   value: PropTypes.string.isRequired,
//   checked: PropTypes.bool.isRequired,
//   required: PropTypes.bool.isRequired,
//   onCheckedChange: PropTypes.func.isRequired,
// };

export default MultiSelectGroup;
