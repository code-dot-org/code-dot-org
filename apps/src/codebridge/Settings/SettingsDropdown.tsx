import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import SimpleDropdown, {
  SimpleDropdownProps,
} from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Heading6} from '@code-dot-org/component-library/typography';
import {codebridgeLabsWithConsole} from '@codebridge/constants';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import FocusTrap from 'focus-trap-react';
import React, {useState} from 'react';
import {createPortal} from 'react-dom';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {FontSize} from '@cdo/apps/lab2/constants';
import useDropdownPosition from '@cdo/apps/lab2/hooks/useDropdownPosition';
import {
  setConsoleFontSize,
  setEditorFontSize,
} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import useOutsideClick from '@cdo/apps/util/hooks/useOutsideClick';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

import {useCodebridgeContext} from '../codebridgeContext';

import moduleStyles from './settings-dropdown.module.scss';

// fontSizeOptions contains a list of value/localized text from the FontSize enum,
// e.g., [{value: 'Tiny', text: 'Tiny'}, {value: 'Small', text: 'Small'}, ...]
const fontSizeOptions: SimpleDropdownProps['items'] = [
  {
    value: 'Tiny',
    text: codebridgeI18n.fontSizeTiny(),
  },
  {
    value: 'Small',
    text: codebridgeI18n.fontSizeSmall(),
  },
  {
    value: 'Medium',
    text: codebridgeI18n.fontSizeMedium(),
  },
  {
    value: 'Large',
    text: codebridgeI18n.fontSizeLarge(),
  },
  {
    value: 'Huge',
    text: codebridgeI18n.fontSizeHuge(),
  },
];
interface SettingsDropdownProps {
  closeDropdown: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
}

const SettingsDropdown: React.FunctionComponent<SettingsDropdownProps> = ({
  closeDropdown,
  buttonRef,
}) => {
  const dropdownRef = useOutsideClick<HTMLDivElement>(closeDropdown);
  const currentEditorFontSizeKey = useAppSelector(
    state => state.lab2View.editorFontSizeKey
  );
  const currentConsoleFontSizeKey = useAppSelector(
    state => state.lab2View.consoleFontSizeKey
  );
  const {signInState} = useAppSelector(state => state.currentUser);
  const {levelProperties} = useCodebridgeContext();
  const appName = levelProperties.appName;

  const dispatch = useAppDispatch();
  const [selectedEditorFontSizeValue, setSelectedEditorFontSizeValue] =
    useState(currentEditorFontSizeKey);
  const [selectedConsoleFontSizeValue, setSelectedConsoleFontSizeValue] =
    useState(currentConsoleFontSizeKey);

  const getSelectedKey = (value: string) => value as keyof typeof FontSize;

  const dropdownStyles = useDropdownPosition(buttonRef, dropdownRef);

  const onTextEditorDropdownChange = (value: string) => {
    setSelectedEditorFontSizeValue(getSelectedKey(value));
  };
  const onConsoleDropdownChange = (value: string) => {
    setSelectedConsoleFontSizeValue(getSelectedKey(value));
  };

  const handleFontSizeChange = (
    type: 'CodeEditor' | 'Console',
    selectedKey: keyof typeof FontSize,
    currentKey: keyof typeof FontSize,
    event: string
  ) => {
    if (selectedKey !== currentKey && FontSize[selectedKey]) {
      if (signInState === SignInState.SignedIn) {
        const field = type === 'Console' ? 'consoleFontSize' : 'editorFontSize';
        new UserPreferences().setFontSize(selectedKey, appName, field);
      }
      const reduxAction =
        type === 'Console' ? setConsoleFontSize : setEditorFontSize;
      dispatch(reduxAction(selectedKey));
      sendCodebridgeAnalyticsEvent(event, appName, {
        levelPath: window.location.pathname,
        fontSize: selectedKey,
      });
    }
  };

  const onSave = () => {
    const selectedEditorKey = getSelectedKey(selectedEditorFontSizeValue);
    const selectedConsoleKey = getSelectedKey(selectedConsoleFontSizeValue);

    // We want the user preference for selected font size to persist for signed-in users
    // per app type so we save on backend.
    handleFontSizeChange(
      'CodeEditor',
      selectedEditorKey,
      currentEditorFontSizeKey,
      EVENTS.CODEBRIDGE_EDITOR_FONT_SIZE_CHANGE
    );
    handleFontSizeChange(
      'Console',
      selectedConsoleKey,
      currentConsoleFontSizeKey,
      EVENTS.CODEBRIDGE_CONSOLE_FONT_SIZE_CHANGE
    );

    closeDropdown();
  };

  const hasConsole = codebridgeLabsWithConsole.includes(appName);

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
            aria-label={codebridgeI18n.closeSettings()}
            id="close-settings-dropdown"
          />
        </div>
        <div className={moduleStyles.dropdownRow}>
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
            selectedValue={selectedEditorFontSizeValue}
            name={'font-size'}
            size="s"
            color="white"
          />
        </div>
        {hasConsole && (
          <div className={moduleStyles.dropdownRow}>
            <label
              htmlFor={codebridgeI18n.consoleFontSize()}
              className={moduleStyles.dropdownLabel}
            >
              {codebridgeI18n.consoleFontSize()}
            </label>
            <SimpleDropdown
              labelText={codebridgeI18n.consoleFontSize()}
              isLabelVisible={false}
              onChange={event => onConsoleDropdownChange(event.target.value)}
              items={fontSizeOptions}
              selectedValue={selectedConsoleFontSizeValue}
              name={'font-size'}
              size="s"
              color="white"
            />
          </div>
        )}
        <div className={moduleStyles.footer}>
          <Button
            text={commonI18n.cancel()}
            type="secondary"
            size="s"
            onClick={closeDropdown}
            color="black"
          />
          <Button
            text={commonI18n.save()}
            type="primary"
            size="s"
            onClick={onSave}
          />
        </div>
      </div>
    </FocusTrap>,
    document.body
  );
};

export default React.memo(SettingsDropdown);
