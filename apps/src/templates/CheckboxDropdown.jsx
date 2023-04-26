import React from 'react';
import PropTypes from 'prop-types';

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
      {label}
    </button>
    <ul className="dropdown-menu">
      <form>
        {allOptions.map(option => (
          <li key={`${name}-${option}`} className="checkbox form-group">
            <input
              type="checkbox"
              id={`${name}-${option}-check`}
              name={option}
              value={option}
              checked={checkedOptions.includes(option)}
              onChange={onChange}
            />
            <label htmlFor={`${name}-${option}-check`}>{option}</label>
          </li>
        ))}
      </form>
    </ul>
  </div>
);
CheckboxDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  allOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  checkedOptions: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default CheckboxDropdown;
