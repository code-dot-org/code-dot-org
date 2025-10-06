import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import codebridgeI18n from '@codebridge/locale';
import {sendCodebridgeAnalyticsEvent} from '@codebridge/utils';
import {useMemo} from 'react';

import {AppName} from '@cdo/apps/lab2/types';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';

const useThemeSetting = (appName: AppName) => {
  const {signInState} = useAppSelector(state => state.currentUser);

  // We need to set the theme here because the dropdown is rendered in a portal outside the
  // main lab container.
  const {theme, setTheme} = useTheme();

  const availableThemes: string[] = useMemo(() => {
    if (!appName || !lab2EntryPoints[appName]) {
      return [];
    }
    return lab2EntryPoints[appName].themes;
  }, [appName]);

  const themeDropdownOptions = availableThemes.map(theme => ({
    text:
      theme === 'Dark'
        ? codebridgeI18n.darkTheme()
        : codebridgeI18n.lightTheme(),
    value: theme,
  }));

  const handleThemeChange = (value: string) => {
    setTheme(value as Theme);
    if (signInState === SignInState.SignedIn) {
      new UserPreferences().setGlobalTheme(value);
    }
    sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_THEME_CHANGE, appName, {
      theme: value,
    });
  };

  // TO DO:
  // Strings out of codebridge i18n?
  // Analytics event name change to make broader?
  return {
    id: 'theme',
    label: codebridgeI18n.theme(),
    options: themeDropdownOptions,
    selectedValue: theme,
    onChange: handleThemeChange,
  };
};

export default useThemeSetting;
