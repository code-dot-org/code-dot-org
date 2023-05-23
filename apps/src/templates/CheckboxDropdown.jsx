import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@cdo/apps/componentLibrary/typography';
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
      aria-haspopup={true}
      aria-label={`${name} filter dropdown`}
    >
      {checkedOptions.length > 0 && (
        <FontAwesome
          id={'check-icon'}
          icon="check-circle"
          title={i18n.filterCheckIconTitle({filter_label: label})}
        />
      )}
      {label}
      <FontAwesome id={'chevron-down-icon'} icon={'chevron-down'} />
    </button>
    <form className="dropdown-menu">
      <ul className={style.dropdownCheckboxUL}>
        {Object.keys(allOptions).map(optionKey => (
          <li key={optionKey} className="checkbox form-group">
            <label>
              <input
                type="checkbox"
                name={optionKey}
                value={optionKey}
                checked={checkedOptions.includes(optionKey)}
                onChange={onChange}
              />
              <Typography semanticTag="span" visualAppearance="body-one">
                {allOptions[optionKey]}
              </Typography>
            </label>
          </li>
        ))}
        <button
          id={'select-all'}
          className={style.affectAllButton}
          type="button"
          onClick={() => handleSelectAll(name)}
        >
          {i18n.selectAll()}
        </button>
        <button
          id={'clear-all'}
          className={style.affectAllButton}
          type="button"
          onClick={() => handleClearAll(name)}
        >
          {i18n.clearAll()}
        </button>
      </ul>
    </form>
  </div>
);
CheckboxDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  allOptions: PropTypes.objectOf(PropTypes.string).isRequired,
  checkedOptions: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
  handleClearAll: PropTypes.func.isRequired,
};

export default CheckboxDropdown;
