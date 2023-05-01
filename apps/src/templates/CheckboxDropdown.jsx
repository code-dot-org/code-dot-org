import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from './FontAwesome';
import i18n from '@cdo/locale';
import style from './checkbox-dropdown.module.scss';

const CheckboxDropdown = ({
  name,
  label,
  allOptions,
  checkedOptions = [],
  onChange,
  handleSelectAll,
  handleClearAll,
}) => (
  <div id={`${name}-dropdown`} className="dropdown">
    <button
      id={`${name}-dropdown-button`}
      type="button"
      className="selectbox"
      data-toggle="dropdown"
    >
      {checkedOptions.length > 0 && (
        <FontAwesome id={'check-icon'} icon="check-circle" />
      )}
      {label}
      <FontAwesome id={'chevron-down-icon'} icon={'chevron-down'} />
    </button>
    <ul className="dropdown-menu">
      <form>
        {Object.keys(allOptions).map(optionKey => (
          <li key={optionKey} className="checkbox form-group">
            <input
              type="checkbox"
              id={`${optionKey}-check`}
              name={optionKey}
              value={optionKey}
              checked={checkedOptions.includes(optionKey)}
              onChange={onChange}
            />
            <label htmlFor={`${optionKey}-check`}>
              {allOptions[optionKey]}
            </label>
          </li>
        ))}
        {handleSelectAll && (
          <button
            id={'select-all'}
            className={style.affectAllButton}
            type="button"
            onClick={() => handleSelectAll(name)}
          >
            {i18n.selectAll()}
          </button>
        )}
        {handleClearAll && (
          <button
            id={'clear-all'}
            className={style.affectAllButton}
            type="button"
            onClick={() => handleClearAll(name)}
          >
            {i18n.clearAll()}
          </button>
        )}
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
  handleSelectAll: PropTypes.func,
  handleClearAll: PropTypes.func,
};

export default CheckboxDropdown;
