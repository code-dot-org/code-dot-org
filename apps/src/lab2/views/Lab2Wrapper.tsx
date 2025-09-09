// Lab2Wrapper
//
// Lab2 uses this component to wrap the apps that it switches between.  This
// component remains agnostic to the children that are passed into it, which
// are the apps.  But this component provides a few useful things: an error
// boundary; a fade-in between levels; a loading spinner when a level takes a
// while to load; and a sad bee when things go wrong.

import {Theme, useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import {
  getAppOptionsLevelId,
  getAppOptionsTheme,
  getIsShareView,
} from '@cdo/apps/lab2/projects/utils';
import {
  isLabLoading,
  hasPageError,
} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import fetchPermissions from '@cdo/apps/lab2/utils/fetchPermissions';
import {useBrowserTextToSpeech} from '@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper';
import {capitalizeFirstLetter} from '@cdo/apps/util/capitalizeFirstLetter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {PERMISSIONS} from '../constants';
import ErrorBoundary from '../ErrorBoundary';
import useLifecycleNotifier from '../hooks/useLifecycleNotifier';
import {LabState, setIsShareView, setPermissions} from '../lab2Redux';
import Lab2Registry from '../Lab2Registry';
import {LifecycleEvent} from '../utils';

import {ErrorFallbackPage, ErrorUI} from './ErrorFallbackPage';
import Loading from './Loading';
import {ProjectBlockedUI} from './ProjectBlockedUI';

import moduleStyles from './Lab2Wrapper.module.scss';

export interface Lab2WrapperProps {
  children: React.ReactNode;
}

const Lab2Wrapper: React.FunctionComponent<Lab2WrapperProps> = ({children}) => {
  const isLoading: boolean = useSelector(isLabLoading);
  const isPageError: boolean = useSelector(hasPageError);
  const isBlockedAbuse = useAppSelector(state => state.lab.isBlockedAbuse);
  const projectSharingDisabled = useAppSelector(
    state => state.lab.projectSharingDisabled
  );
  const dispatch = useAppDispatch();
  const isProjectValidator = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.PROJECT_VALIDATOR)
  );

  const isFullScreenView = useAppSelector(state => state.lab.isFullScreenView);

  useEffect(() => {
    fetchPermissions().then(data => {
      dispatch(setPermissions(data));
    });
  }, [dispatch]);
  const errorMessage: string | undefined = useSelector(
    (state: {lab: LabState}) =>
      state.lab.pageError?.errorMessage || state.lab.pageError?.error?.message
  );
  const {cancel} = useBrowserTextToSpeech();

  // Store some server-provided data in redux.
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const {theme, setTheme} = useTheme();

  useEffect(() => {
    // Initialize the theme based on app options, which is set on the server.
    // This allows us to take advantage of the server-side logic to show the correct loading theme
    // based on the lesson and user preference.
    // We default to dark theme if the body class is not set.
    const appOptionsTheme = getAppOptionsTheme();
    const upperCasedTheme = appOptionsTheme
      ? (capitalizeFirstLetter(appOptionsTheme) as Theme)
      : undefined;
    const theme = upperCasedTheme || 'Dark';

    setTheme(theme);
  }, [setTheme]);

  // We duplicate the theme to Lab2Registry, because modals opened via the header (such as the share modal)
  // do not have access to the theme context.
  // We also update the body class to match the theme, so elements such as the footer update correctly.
  useEffect(() => {
    Lab2Registry.getInstance().setTheme(theme);
    const themeDowncase = theme.toLowerCase();
    const oldTheme = themeDowncase === 'light' ? 'dark' : 'light';
    if (document.body.classList.contains(`background-${oldTheme}`)) {
      document.body.classList.remove(`background-${oldTheme}`);
    }
    document.body.classList.add(`background-${themeDowncase}`);
  }, [theme]);

  // Store the level ID provided by App Options in redux if necessary.
  // This is needed on pages without a header, such as the share view.
  const appOptionsLevelId = getAppOptionsLevelId();
  useEffect(() => {
    if (!currentLevelId && appOptionsLevelId) {
      dispatch(setCurrentLevelId(appOptionsLevelId.toString()));
    }
  }, [currentLevelId, appOptionsLevelId, dispatch]);

  // Store whether we are in share view in redux, from App Options.
  const isShareView = getIsShareView();
  useEffect(() => {
    if (isShareView !== undefined) {
      dispatch(setIsShareView(isShareView));
    }
  }, [isShareView, dispatch]);

  // Add listeners to cancel in any-progress text to speech on level change or reload.
  useLifecycleNotifier(LifecycleEvent.LevelChangeRequested, cancel);
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, cancel);

  const blockedType = isBlockedAbuse
    ? 'projectAbuse'
    : projectSharingDisabled
    ? 'projectSharingDisabled'
    : undefined;

  return (
    <ErrorBoundary
      fallback={<ErrorFallbackPage />}
      onError={(error, componentStack) =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Uncaught React Error', error, {
            componentStack,
          })
      }
    >
      <div
        id="lab-container"
        className={classNames(
          moduleStyles.labContainer,
          isLoading && moduleStyles.labContainerLoading,
          isShareView && moduleStyles.labContainerShareView,
          isFullScreenView && moduleStyles.labContainerFullScreenView
        )}
      >
        {children}
        <Loading isLoading={isLoading} />

        {isPageError && <ErrorUI message={errorMessage} />}
        {blockedType && (
          <ProjectBlockedUI
            blockedType={blockedType}
            isProjectValidator={isProjectValidator}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Lab2Wrapper;
