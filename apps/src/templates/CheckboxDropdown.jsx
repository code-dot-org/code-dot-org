import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import Typography from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import FontAwesome from '../legacySharedComponents/FontAwesome';

import style from './checkbox-dropdown.module.scss';

const CheckboxDropdown = ({
  name,
  label,
  allOptions,
  checkedOptions = [],
  onChange,
  handleSelectAll,
  handleClearAll,
}) => {
  const onSelectAll = useCallback(() => {
    handleSelectAll(name);
  }, [name, handleSelectAll]);

  const onClearAll = useCallback(() => {
    handleClearAll(name);
  }, [name, handleClearAll]);

  // Collapse dropdown if 'Escape' is pressed
  const onKeyDown = e => {
    if (e.keyCode === 27) {
      e.currentTarget.classList.remove('open');
    }
  };

  return (
    <div id={`${name}-dropdown`} className="dropdown" onKeyDown={onKeyDown}>
      <button
        id={`${name}-dropdown-button`}
        type="button"
        className={classnames('selectbox', style.dropdownButton)}
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
        <Typography semanticTag="span" visualAppearance="body-two">
          {label}
        </Typography>
        <FontAwesome id={'chevron-down-icon'} icon={'chevron-down'} />
      </button>
      <form
        className={classnames('dropdown-menu', style.dropDownMenuContainer)}
      >
        <ul className={style.dropdownCheckboxUL}>
          {Object.keys(allOptions).map(optionKey => (
            <li key={optionKey} className="checkbox form-group">
              <Checkbox
                checked={checkedOptions.includes(optionKey)}
                onChange={onChange}
                name={optionKey}
                value={optionKey}
                label={allOptions[optionKey]}
              />
            </li>
          ))}
        </ul>
        <div className={style.bottomButtonsContainer}>
          <Button
            id="select-all"
            className={style.affectAllButton}
            type="button"
            text={i18n.selectAll()}
            onClick={onSelectAll}
            styleAsText
            color={Button.ButtonColor.brandSecondaryDefault}
          />
          <Button
            id="clear-all"
            className={style.affectAllButton}
            type="button"
            text={i18n.clearAll()}
            onClick={onClearAll}
            styleAsText
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        </div>
      </form>
    </div>
  );
};
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
