import CloseButton from '@code-dot-org/component-library/closeButton';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Heading6} from '@code-dot-org/component-library/typography';
import FocusTrap from 'focus-trap-react';
import React from 'react';
import {createPortal} from 'react-dom';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import useDropdownPosition from '@cdo/apps/lab2/hooks/useDropdownPosition';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import commonI18n from '@cdo/locale';

import moduleStyles from './settings-dropdowns.module.scss';

interface SettingsDropdownsProps {
  closeDropdown: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
  settings: Setting[];
}

export interface Setting {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}

const SettingsDropdowns: React.FunctionComponent<SettingsDropdownsProps> = ({
  closeDropdown,
  buttonRef,
  settings,
}) => {
  const dropdownRef = useOutsideClick<HTMLDivElement>(closeDropdown);

  // We need to set the theme here because the dropdown is rendered in a portal, outside of the
  // main lab container.
  const {theme} = useTheme();

  const dropdownStyles = useDropdownPosition(buttonRef, dropdownRef);

  const dropdownColor = theme === 'Dark' ? 'white' : 'black';

  return createPortal(
    <FocusTrap
      focusTrapOptions={{
        onDeactivate: closeDropdown,
        clickOutsideDeactivates: true,
      }}
    >
      <div
        className={moduleStyles.settingsDropdown}
        ref={dropdownRef}
        role="dialog"
        style={dropdownStyles}
        aria-modal="true"
        aria-label={commonI18n.settings()}
        data-theme={theme}
      >
        <div className={moduleStyles.header}>
          <Heading6 className={moduleStyles.heading}>
            {commonI18n.settings()}
          </Heading6>
          <CloseButton
            onClick={closeDropdown}
            aria-label={codebridgeI18n.closeSettings()}
            id="close-settings-dropdown"
          />
        </div>
        {settings.map(setting => (
          <div className={moduleStyles.dropdownRow} key={setting.id}>
            <label htmlFor={setting.id} className={moduleStyles.dropdownLabel}>
              {setting.label}
            </label>
            <SimpleDropdown
              labelText={setting.label}
              isLabelVisible={false}
              onChange={event => setting.onChange(event.target.value)}
              items={setting.options}
              selectedValue={setting.selectedValue}
              name={setting.id}
              size="s"
              color={dropdownColor}
            />
          </div>
        ))}
      </div>
    </FocusTrap>,
    document.body
  );
};

export default React.memo(SettingsDropdowns);
