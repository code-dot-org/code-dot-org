import {LayoutKey, codebridgeLabsWithConsole} from '@codebridge/constants';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils/analyticsReporterHelper';
import {useState} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {FontSize} from '@cdo/apps/lab2/constants';
import {
  setConsoleFontSize,
  setEditorFontSize,
} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {Setting} from '@cdo/apps/lab2/views/components/Settings/SettingsDropdown';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import useThemeSetting from '../../lab2/hooks/useThemeSetting';
import {useCodebridgeContext} from '../codebridgeContext';

// fontSizeOptions contains a list of value/localized text from the FontSize enum,
// e.g., [{value: 'Tiny', text: 'Tiny'}, {value: 'Small', text: 'Small'}, ...]
const fontSizeOptions = [
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
export function useCodebridgeSettings(): Setting[] {
  const currentEditorFontSizeKey = useAppSelector(
    state => state.lab2View.editorFontSizeKey
  );
  const currentConsoleFontSizeKey = useAppSelector(
    state => state.lab2View.consoleFontSizeKey
  );

  const {signInState} = useAppSelector(state => state.currentUser);
  const {config, setConfig, levelProperties} = useCodebridgeContext();
  const {appName, widgetView} = levelProperties;

  const dispatch = useAppDispatch();
  const [selectedEditorFontSizeValue, setSelectedEditorFontSizeValue] =
    useState(currentEditorFontSizeKey);
  const [selectedConsoleFontSizeValue, setSelectedConsoleFontSizeValue] =
    useState(currentConsoleFontSizeKey);
  const [selectedLayout, setSelectedLayout] = useState(config.activeLayout);

  const getSelectedKey = (value: string) => value as keyof typeof FontSize;

  const onTextEditorDropdownChange = (value: string) => {
    const selectedEditorKey = getSelectedKey(value);
    setSelectedEditorFontSizeValue(selectedEditorKey);
    handleFontSizeChange(
      'CodeEditor',
      selectedEditorKey,
      currentEditorFontSizeKey,
      EVENTS.CODEBRIDGE_EDITOR_FONT_SIZE_CHANGE
    );
  };

  const onConsoleDropdownChange = (value: string) => {
    const selectedConsoleKey = getSelectedKey(value);
    setSelectedConsoleFontSizeValue(selectedConsoleKey);
    handleFontSizeChange(
      'Console',
      selectedConsoleKey,
      currentConsoleFontSizeKey,
      EVENTS.CODEBRIDGE_CONSOLE_FONT_SIZE_CHANGE
    );
  };

  const handleFontSizeChange = (
    type: 'CodeEditor' | 'Console',
    selectedKey: keyof typeof FontSize,
    currentKey: keyof typeof FontSize,
    event: string
  ) => {
    if (selectedKey !== currentKey && FontSize[selectedKey]) {
      // We want the user preference for selected font size to persist for signed-in users
      // per app type so we save on backend.
      if (signInState === SignInState.SignedIn) {
        const field = type === 'Console' ? 'consoleFontSize' : 'editorFontSize';
        new UserPreferences().setFontSize(selectedKey, appName, field);
      }
      const reduxAction =
        type === 'Console' ? setConsoleFontSize : setEditorFontSize;
      dispatch(reduxAction(selectedKey));
      sendCodebridgeAnalyticsEvent(event, appName, {
        fontSize: selectedKey,
      });
    }
  };

  const handleLayoutChange = (value: string) => {
    const newLayout = value as LayoutKey;
    setSelectedLayout(newLayout);
    setConfig({
      ...config,
      activeLayout: newLayout,
    });
  };

  const layoutDropdownOptions = [
    {
      value: 'horizontal',
      text: codebridgeI18n.horizontal(),
    },
    {
      value: 'vertical',
      text: codebridgeI18n.vertical(),
    },
  ];

  const hasConsole = codebridgeLabsWithConsole.includes(appName);
  const hasBothLayouts =
    config.layoutComponents.horizontal && config.layoutComponents.vertical;

  return [
    {
      id: 'editorFontSize',
      label: codebridgeI18n.textEditorFontSize(),
      options: fontSizeOptions,
      selectedValue: selectedEditorFontSizeValue,
      onChange: onTextEditorDropdownChange,
    },
    ...(hasConsole
      ? [
          {
            id: 'consoleFontSize',
            label: codebridgeI18n.consoleFontSize(),
            options: fontSizeOptions,
            selectedValue: selectedConsoleFontSizeValue,
            onChange: onConsoleDropdownChange,
          },
        ]
      : []),
    useThemeSetting(appName),
    ...(!widgetView && hasBothLayouts
      ? [
          {
            id: 'layout',
            label: codebridgeI18n.layout(),
            options: layoutDropdownOptions,
            selectedValue: selectedLayout,
            onChange: handleLayoutChange,
          },
        ]
      : []),
  ];
}
