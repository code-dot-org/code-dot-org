import React, {useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {multiSelectOptionShape} from './shapes';
import styles from './multi-select-group.module.scss';

// NOTE: The `name` will show up in the DOM with an appended `[]`, so Rails
// natively understands it as an array. Set `required` to `true` if you want
// the user to have to select at least one of the options to proceed.
export default function MultiSelectGroup({name, required, options}) {
  const inputName = `${name}[]`;
  const [values, setValues] = useState(options.map(_ => false));

  return (
    <div className={styles.multiSelectGroup}>
      <fieldset>
        {options.map((option, index) => (
          <MultiSelectButton
            name={inputName}
            value={option.value}
            key={option.value}
            label={option.label}
            required={required ? !values.some(v => !!v) : false}
            onChange={event => {
              const newValue = event.target.checked;
              const newValues = values.map((v, i) => {
                if (i === index) {
                  return newValue;
                }
                return v;
              });
              setValues(newValues);

              // Reset validity so it gets checked again.
              event.target.setCustomValidity('');
            }}
          />
        ))}
      </fieldset>
    </div>
  );
}

function MultiSelectButton({name, value, label, required, onChange}) {
  const uniqueId = _.uniqueId();
  return (
    <div>
      <input
        id={uniqueId}
        type="checkbox"
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        onInvalid={e =>
          e.target.setCustomValidity('Please choose at least one grade')
        }
      />
      <label htmlFor={uniqueId}>{label}</label>
    </div>
  );
}

MultiSelectGroup.propTypes = {
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(multiSelectOptionShape).isRequired
};

MultiSelectButton.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
};
