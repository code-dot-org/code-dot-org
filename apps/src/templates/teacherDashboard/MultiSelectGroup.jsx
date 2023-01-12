import React, {useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {multiSelectOptionShape} from './shapes';
import styles from './multi-select-group.module.scss';

// NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
// natively understands it as an array. Set `required` to `true` if you want
// the user to have to select at least one of the options to proceed.
export default function MultiSelectGroup({label, name, required, options}) {
  const inputName = `${name}[]`;
  const [values, setValues] = useState(
    Object.fromEntries(options.map(o => [o.value, false]))
  );

  return (
    <div className={styles.multiSelectGroup}>
      <fieldset>
        <label>{label}</label>
        {options.map((option, index) => (
          <MultiSelectButton
            label={option.label}
            name={inputName}
            value={option.value}
            key={option.value}
            checked={values[option.value]}
            required={required ? !Object.values(values).some(v => !!v) : false}
            onCheckedChange={checked => {
              setValues({
                ...values,
                [option.value]: checked
              });
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
        onInvalid={e =>
          e.target.setCustomValidity('Please choose at least one option')
        }
      />
      <label htmlFor={uniqueId}>{label}</label>
    </div>
  );
}

MultiSelectGroup.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(multiSelectOptionShape).isRequired
};

MultiSelectButton.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  required: PropTypes.bool.isRequired,
  onCheckedChange: PropTypes.func.isRequired
};
