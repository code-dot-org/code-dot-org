import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import {useEffect, useMemo} from 'react';

import {getCurrentLesson} from '@cdo/apps/code-studio/progressReduxSelectors';
import {setIsLoadingTheme} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsTheme} from '@cdo/apps/lab2/projects/utils';
import {AppName} from '@cdo/apps/lab2/types';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {Level} from '@cdo/apps/types/progressTypes';
import {capitalizeFirstLetter} from '@cdo/apps/util/capitalizeFirstLetter';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';

interface UseInitialLabThemeProps {
  currentAppName?: AppName;
  levelProperties?: {
    appName?: string;
  };
}
const LABS_WITH_THEME_PREFERENCE: (string | undefined)[] = [
  'pythonlab',
  'weblab2',
];

// Determine and set the theme for the lab that is currently being loaded.
export const useInitialLabTheme = ({
  currentAppName,
  levelProperties,
}: UseInitialLabThemeProps) => {
  const {setTheme} = useTheme();
  const {signInState} = useAppSelector(state => state.currentUser);
  const dispatch = useAppDispatch();
  const initialTheme = getAppOptionsTheme();
  const lesson = useAppSelector(state => getCurrentLesson(state));

  // We only use the global user preference for theme if the current lesson has
  // at least one python lab level or the current level is a python lab level.
  const useThemeUserPreference = useMemo(
    () =>
      LABS_WITH_THEME_PREFERENCE.includes(levelProperties?.appName) ||
      lesson?.levels.some((level: Level) =>
        LABS_WITH_THEME_PREFERENCE.includes(level.app)
      ),
    [lesson?.levels, levelProperties?.appName]
  );

  useEffect(() => {
    if (currentAppName) {
      const supportedThemes = lab2EntryPoints[currentAppName]?.themes;
      dispatch(setIsLoadingTheme(true));

      const setThemeHelper = () => {
        // Use the theme from app options if it exists and is supported,
        // otherwise fall back to the first supported theme.
        // We will only use the app options theme if we are not using the user preference,
        // so it is safe to use that statically set theme.
        const upperCasedTheme = initialTheme
          ? (capitalizeFirstLetter(initialTheme) as Theme)
          : undefined;
        if (upperCasedTheme && supportedThemes.includes(upperCasedTheme)) {
          setTheme(upperCasedTheme);
        } else {
          setTheme(supportedThemes[0]);
        }
        dispatch(setIsLoadingTheme(false));
      };

      if (useThemeUserPreference && signInState === SignInState.SignedIn) {
        const fetchAndSetTheme = async () => {
          const userTheme = await new UserPreferences().getGlobalTheme(
            (error: NetworkError) =>
              Lab2Registry.getInstance()
                .getMetricsReporter()
                .logError('Error fetching theme', undefined, {
                  message: error.response,
                })
          );
          if (userTheme && supportedThemes.includes(userTheme)) {
            setTheme(userTheme);
            dispatch(setIsLoadingTheme(false));
          } else {
            setThemeHelper();
          }
        };

        fetchAndSetTheme();
      } else {
        setThemeHelper();
      }
    }
  }, [
    currentAppName,
    setTheme,
    useThemeUserPreference,
    signInState,
    dispatch,
    initialTheme,
  ]);
};
