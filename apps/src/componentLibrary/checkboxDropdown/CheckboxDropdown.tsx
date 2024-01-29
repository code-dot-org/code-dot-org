import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
// import moduleStyles from './checkboxDropdown.module.scss';
import style from '@cdo/apps/templates/checkbox-dropdown.module.scss';
import Button from '@cdo/apps/templates/Button';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import i18n from '@cdo/locale';

import Typography from '@cdo/apps/componentLibrary/typography';
import Checkbox from '@cdo/apps/componentLibrary/checkbox';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {
  DropdownProvider,
  useDropdownContext,
} from '@cdo/apps/componentLibrary/common/contexts/DropdownContext';

// import CheckboxDropdownOption from './_CheckbpxDropdownOption';

export interface CheckboxDropdownProps {
  /** CheckboxDropdown name */
  name: string;
  /** CheckboxDropdown color */
  color?: 'white' | 'black';
  /** CheckboxDropdown size */
  size: ComponentSizeXSToL;
  /** CheckboxDropdown disabled state */
  disabled?: boolean;
  /** CheckboxDropdown label */
  labelText: string;
  /** CheckboxDropdown options */
  allOptions: {value: string; label: string}[];
  /** CheckboxDropdown checked options */
  checkedOptions: string[];
  /** CheckboxDropdown onChange handler */
  onChange: (args: React.ChangeEvent<HTMLInputElement>) => void;
  /** CheckboxDropdown onSelectAll handler */
  onSelectAll: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** CheckboxDropdown onClearAll handler */
  onClearAll: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
  labelText,
  allOptions,
  checkedOptions = [],
  onChange,
  onSelectAll,
  onClearAll,
  // disabled = false,
  // color = 'black',
  // size = 'm',
}) => {
  const {activeDropdownName, setActiveDropdownName} = useDropdownContext();
  const dropdownRef: React.MutableRefObject<HTMLDivElement | null> =
    useRef(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent<Document>) => {
      console.log('handleClickOutside triggered');
      if (
        activeDropdownName &&
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        console.log('handleClickOutside if statement triggered');
        setActiveDropdownName('');
      }
    },
    [dropdownRef, setActiveDropdownName, activeDropdownName]
  );

  useEffect(() => {
    // 'as any' used to fix following TS errpr:
    // TS2769: No overload matches this call.
    // Overload 1 of 2,
    // (type: "mousedown", listener: (this: Document, ev: MouseEvent) => any, options?: boolean | AddEventListenerOptions | undefined): void
    // , gave the following error.
    // Argument of type (event: MouseEvent<Document>) => void is not assignable to parameter of type (this: Document, ev: MouseEvent) => any
    // Types of parameters event and ev are incompatible.
    document.addEventListener('mousedown', handleClickOutside as never);
    document.addEventListener('keydown', handleClickOutside as never);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as never);
      document.removeEventListener('keydown', handleClickOutside as never);
    };
  }, [handleClickOutside]);

  const toggleDropdown = useCallback(() => {
    console.log('toggleDropdown triggered');
    console.log(activeDropdownName);
    if (activeDropdownName !== name) {
      setActiveDropdownName(name);
    } else {
      setActiveDropdownName('');
    }
  }, [name, activeDropdownName, setActiveDropdownName]);

  const isOpen = useMemo(
    () => activeDropdownName === name,
    [activeDropdownName, name]
  );

  // console.log(isOpen);
  // console.log(activeDropdownName);
  // console.log(name);

  // Collapse dropdown if 'Escape' is pressed
  const onKeyDown: (e: KeyboardEvent) => void = e => {
    // console.log('triggered');
    if (e.keyCode === 27) {
      e.currentTarget.classList.remove('open');
    }
  };
  // const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log('handleOnChange triggered', e);
  //   console.log('handleOnChange target', e.target.value);
  //   onChange(e);
  // };
  console.log(allOptions);
  console.log(checkedOptions);
  return (
    <div
      id={`${name}-dropdown`}
      className={classNames('dropdown', {open: isOpen})}
      onKeyDown={onKeyDown}
      ref={dropdownRef}
    >
      <button
        id={`${name}-dropdown-button`}
        type="button"
        className={classNames('selectbox', style.dropdownButton)}
        data-toggle="dropdown"
        aria-haspopup={true}
        aria-label={`${name} filter dropdown`}
        onClick={toggleDropdown}
      >
        {checkedOptions.length > 0 && (
          <FontAwesomeV6Icon
            // id={'check-icon'}
            iconName="check-circle"
            iconStyle="solid"
            title={i18n.filterCheckIconTitle({filter_label: labelText})}
          />
        )}
        <Typography semanticTag="span" visualAppearance="body-two">
          {labelText}
        </Typography>
        <FontAwesomeV6Icon
          // id="chevron-down-icon"
          iconStyle="solid"
          iconName="chevron-down"
        />
      </button>
      <form
        className={classNames('dropdown-menu', style.dropDownMenuContainer)}
      >
        <ul className={style.dropdownCheckboxUL}>
          {allOptions.map(({value, label}) => (
            <li key={value} className="checkbox form-group">
              <Checkbox
                checked={checkedOptions.includes(value)}
                onChange={onChange}
                name={value}
                value={value}
                label={label}
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

export default (props: CheckboxDropdownProps) => (
  <DropdownProvider>
    <CheckboxDropdown {...props} />
  </DropdownProvider>
);
