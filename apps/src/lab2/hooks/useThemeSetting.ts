import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {useMemo} from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';
import {AppName} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
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
    text: theme === 'Dark' ? lab2I18n.darkTheme() : lab2I18n.lightTheme(),
    value: theme,
  }));

  const handleThemeChange = (value: string) => {
    setTheme(value as Theme);
    if (signInState === SignInState.SignedIn) {
      new UserPreferences().setGlobalTheme(value);
    }
    sendLab2AnalyticsEvent(EVENTS.LAB2_THEME_CHANGE, appName, {
      theme: value,
    });
  };

  return {
    id: 'theme',
    label: lab2I18n.theme(),
    options: themeDropdownOptions,
    selectedValue: theme,
    onChange: handleThemeChange,
  };
};

export default useThemeSetting;
