import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import SimpleDropdown, {
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Heading6} from '@code-dot-org/component-library/typography';
import FocusTrap from 'focus-trap-react';
import React, {useLayoutEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import {DEFAULT_FONT_SIZE_KEY, FontSize} from '@cdo/apps/lab2/constants';
import {setEditorFontSize} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {trySetSessionStorage} from '@cdo/apps/utils';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './settings-dropdown.module.scss';

const TOP_PADDING = 5;
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
  const menuRef = useOutsideClick<HTMLDivElement>(closeDropdown);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const editorFontSizeKey = useAppSelector(
    state => state.lab2View.editorFontSizeKey
  );
  const selectedFontSizeKey = editorFontSizeKey || DEFAULT_FONT_SIZE_KEY;
  const {signInState} = useAppSelector(state => state.currentUser);
  const {levelProperties} = useCodebridgeContext();
  const dispatch = useAppDispatch();
  const [selectedValue, setSelectedValue] = useState(selectedFontSizeKey);

  useLayoutEffect(() => {
    const updateDropdownPosition = () => {
      if (buttonRef.current && menuRef.current) {
        const dropdownRect = menuRef.current.getBoundingClientRect();
        const parentRect = buttonRef.current.getBoundingClientRect();
        const top =
          parentRect.top + parentRect.height + TOP_PADDING + window.scrollY;
        const left = parentRect.right - dropdownRect.width + window.scrollX;
        setDropdownStyles({top, left});
      }
    };

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [buttonRef, menuRef]);

  const onTextEditorDropdownChange = async (value: string) => {
    const selectedKey = value as keyof typeof FontSize;
    setSelectedValue(selectedKey);
  };

  const onSave = () => {
    const selectedKey = selectedValue as keyof typeof FontSize;
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
        ref={menuRef}
        role="dialog"
        style={dropdownStyles}
        aria-modal="true"
        aria-label="Settings"
      >
        <div className={moduleStyles.header}>
          <Heading6 className={moduleStyles.settingsTitle}>Settings</Heading6>
          <CloseButton
            onClick={closeDropdown}
            aria-label="Close settings"
            id="close-settings-dropdown"
          />
        </div>
        <div className={moduleStyles.dropdownRow}>
          <label
            htmlFor="editor-font-size"
            className={moduleStyles.dropdownLabel}
          >
            Text editor font size
          </label>
          <SimpleDropdown
            labelText="Text editor font size"
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
            text="Save"
            type="primary"
            size="s"
            onClick={onSave}
            color={'white'}
          />
          <Button
            text="Cancel"
            type="secondary"
            size="s"
            onClick={closeDropdown}
            color={'white'}
          />
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};

export default React.memo(SettingsDropdown);
