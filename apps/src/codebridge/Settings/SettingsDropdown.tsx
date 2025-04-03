import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import SimpleDropdown, {
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Heading6} from '@code-dot-org/component-library/typography';
import FocusTrap from 'focus-trap-react';
import React, {useState} from 'react';
import {createPortal} from 'react-dom';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {FontSize} from '@cdo/apps/lab2/constants';
import useDropdownPosition from '@cdo/apps/lab2/hooks/useDropdownPosition';
import {setEditorFontSize} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {trySetSessionStorage} from '@cdo/apps/utils';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './settings-dropdown.module.scss';

// fontSizeOptions contains a list of value/text from the FontSize enum,
// e.g., [{value: 'Tiny', text: 'Tiny'}, {value: 'Small', text: 'Small'}, ...]
const fontSizeOptions: SimpleDropdownProps['items'] = Object.keys(FontSize)
  .filter(key => isNaN(Number(key))) // Filters out the reverse enum keys.
  .map(key => ({
    value: key,
    text: key,
  }));
interface SettingsDropdownProps {
  closeDropdown: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
}

const SettingsDropdown: React.FunctionComponent<SettingsDropdownProps> = ({
  closeDropdown,
  buttonRef,
}) => {
  const dropdownRef = useOutsideClick<HTMLDivElement>(closeDropdown);
  const editorFontSizeKey = useAppSelector(
    state => state.lab2View.editorFontSizeKey
  );
  const selectedFontSizeKey = editorFontSizeKey;
  const {signInState} = useAppSelector(state => state.currentUser);
  const {levelProperties} = useCodebridgeContext();
  const dispatch = useAppDispatch();
  const [selectedValue, setSelectedValue] = useState(selectedFontSizeKey);

  const getSelectedKey = (value: string) => value as keyof typeof FontSize;

  const dropdownStyles = useDropdownPosition(buttonRef, dropdownRef);

  const onTextEditorDropdownChange = async (value: string) => {
    setSelectedValue(getSelectedKey(value));
  };

  const onSave = () => {
    const selectedKey = getSelectedKey(selectedValue);
    if (FontSize[selectedKey]) {
      // We want the user preference for selected font size to persist across a session
      // for signed-in users per app type.
      if (signInState === SignInState.SignedIn) {
        const sessionStorageKey = `${levelProperties.appName}CodeEditorFontSizeKey`;
        trySetSessionStorage(sessionStorageKey, selectedKey);
      }
      dispatch(setEditorFontSize(selectedKey));
    }
    closeDropdown();
  };

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
        data-theme="Dark"
      >
        <div className={moduleStyles.header}>
          <Heading6>{commonI18n.settings()}</Heading6>
          <CloseButton
            onClick={closeDropdown}
            aria-label="Close settings"
            id="close-settings-dropdown"
          />
        </div>
        <div className={moduleStyles.dropdownRow}>
          {/* Customized label for dropdown */}
          <label
            htmlFor={codebridgeI18n.textEditorFontSize()}
            className={moduleStyles.dropdownLabel}
          >
            {codebridgeI18n.textEditorFontSize()}
          </label>
          <SimpleDropdown
            labelText={codebridgeI18n.textEditorFontSize()}
            isLabelVisible={false}
            onChange={event => onTextEditorDropdownChange(event.target.value)}
            items={fontSizeOptions}
            selectedValue={selectedValue}
            name={'font-size'}
            size="s"
            color="white"
          />
        </div>
        <div className={moduleStyles.footer}>
          <Button
            text="Cancel"
            type="secondary"
            size="s"
            onClick={closeDropdown}
          />
          <Button text="Save" type="primary" size="s" onClick={onSave} />
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};

export default React.memo(SettingsDropdown);
