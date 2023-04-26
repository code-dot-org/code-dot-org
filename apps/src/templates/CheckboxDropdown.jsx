import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from './FontAwesome';

const CheckboxDropdown = ({
  name,
  label,
  allOptions,
  checkedOptions = [],
  onChange,
}) => (
  <div id={`${name}-dropdown`} className="dropdown">
    <button
      id={`${name}-dropdown-button`}
      type="button"
      className="selectbox"
      data-toggle="dropdown"
    >
      {checkedOptions.length > 0 && <FontAwesome icon="check-circle" />}
      {label}
    </button>
    <ul className="dropdown-menu">
      <form>
        {Object.keys(allOptions).map(optionKey => (
          <li key={optionKey} className="checkbox form-group">
            <input
              type="checkbox"
              id={`${name}-${optionKey}-check`}
              name={optionKey}
              value={optionKey}
              checked={checkedOptions.includes(optionKey)}
              onChange={onChange}
            />
            <label htmlFor={`${name}-${optionKey}-check`}>
              {allOptions[optionKey]}
            </label>
          </li>
        ))}
      </form>
    </ul>
  </div>
);
CheckboxDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  allOptions: PropTypes.objectOf(PropTypes.string).isRequired,
  checkedOptions: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default CheckboxDropdown;
