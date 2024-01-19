import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './checkboxDropdown.module.scss';
import style from '@cdo/apps/templates/checkbox-dropdown.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import Typography from '@cdo/apps/componentLibrary/typography';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import Button from '@cdo/apps/templates/Button';

export interface CheckboxDropdownProps {
  /** CheckboxDropdown name */
  name: string;
  /** CheckboxDropdown label */
  label: string;
  /** CheckboxDropdown options */
  allOptions: string[];
  /** CheckboxDropdown checked options */
  checkedOptions: string[];
  /** CheckboxDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLInputElement>) => void;
  /** CheckboxDropdown onSelectAll handler */
  handleSelectAll: (args: React.ChangeEvent<HTMLInputElement>) => void;
  /** CheckboxDropdown onClearAll handler */
  handleClearAll: (args: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/DropdownMenuTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Wip```
 *
 * Design System: Checkbox Dropdown Component.
 * Used to render checkbox (multiple choice) dropdowns.
 */
const CheckboxDropdown: React.FunctionComponent<CheckboxDropdownProps> = ({
  name,
  label,
  allOptions,
  checkedOptions = [],
  onChange,
  handleSelectAll,
  handleClearAll,
}) => {
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

export default CheckboxDropdown;
