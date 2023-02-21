import React, {useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {multiSelectOptionShape} from './shapes';
import styles from './multi-select-group.module.scss';

// NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
// natively understands it as an array. Set `required` to `true` if you want
// the user to have to select at least one of the options to proceed.
// For an example of `values` format, see this component's storybook file.
export default function MultiSelectGroup({
  label,
  name,
  required,
  options,
  setSelected
}) {
  const inputName = `${name}[]`;

  const [values, setValues] = useState(
    Object.fromEntries(options.map(o => [o.value, false]))
  );

  return (
    <div className={styles.multiSelectGroup}>
      <fieldset>
        <label>{label}</label>
        {options.map(option => (
          <MultiSelectButton
            label={option.label}
            name={inputName}
            value={option.value}
            key={option.value}
            checked={values[option.value]}
            // The child's `required` prop will be set to `false` if the
            // Group's `required` prop is falsy. It will be set to `true` if
            // the Group's `required` prop is truthy AND none of the options
            // are `checked`, or `false` if at least one of the options is
            // `checked`.
            required={required ? !Object.values(values).some(v => !!v) : false}
            onCheckedChange={checked => {
              const newValues = {
                ...values,
                [option.value]: checked
              };
              setValues(newValues);
              setSelected(Object.keys(newValues).filter(k => newValues[k]));
            }}
          />
        ))}
      </fieldset>
    </div>
  );
}

function MultiSelectButton({
  label,
  name,
  value,
  checked,
  required,
  onCheckedChange
}) {
  const uniqueId = _.uniqueId();
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
        onInvalid={e => e.target.setCustomValidity(i18n.chooseAtLeastOne())}
      />
      <label htmlFor={uniqueId}>{label}</label>
    </div>
  );
}

MultiSelectGroup.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(multiSelectOptionShape).isRequired,
  setSelected: PropTypes.func.isRequired
};

MultiSelectButton.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  required: PropTypes.bool.isRequired,
  onCheckedChange: PropTypes.func.isRequired
};
