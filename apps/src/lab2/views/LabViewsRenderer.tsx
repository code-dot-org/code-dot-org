/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import React, {Suspense, useEffect, useMemo} from 'react';

import {getCurrentLesson} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {setIsLoadingTheme} from '@cdo/apps/lab2/lab2Redux';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {Level} from '@cdo/apps/types/progressTypes';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';
import {PERMISSIONS} from '../constants';
import ProgressContainer from '../progress/ProgressContainer';
import {getAppOptionsViewingExemplar} from '../projects/utils';

import NoExemplarPage from './components/NoExemplarPage';
import ExtraLinks from './ExtraLinks';
import Loading from './Loading';

import moduleStyles from './lab-views-renderer.module.scss';

const hideExtraLinks = queryParams('hide-extra-links') === 'true';

const LabViewsRenderer: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const initialSources = useAppSelector(state => state.lab.initialSources);

  const currentAppName = levelProperties?.appName;
  const exemplarSources = levelProperties?.exemplarSources;
  const levelId = levelProperties?.id;

  const isBlocked = useAppSelector(state => state.lab.isBlocked);
  const isProjectValidator = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.PROJECT_VALIDATOR)
  );

  const isViewingExemplar = getAppOptionsViewingExemplar();
  const lesson = useAppSelector(state => getCurrentLesson(state));
  const {signInState} = useAppSelector(state => state.currentUser);
  const dispatch = useAppDispatch();

  // We only use the global user preference for theme if the current lesson has
  // at least one python lab level or the current level is a python lab level.
  const useThemeUserPreference = useMemo(
    () =>
      levelProperties?.appName === 'pythonlab' ||
      lesson?.levels.some((level: Level) => level.app === 'pythonlab'),
    [lesson?.levels, levelProperties?.appName]
  );

  // Set the theme for the current app.
  const {setTheme} = useTheme();
  useEffect(() => {
    if (currentAppName) {
      const supportedThemes = lab2EntryPoints[currentAppName]?.themes;
      dispatch(setIsLoadingTheme(true));

      const setThemeHelper = () => {
        // If the body has a class use that to set the theme, if its supported by the lab.
        // Otherwise, use the first supported theme.
        // We will only run this if we are not using the user preference, so it's safe to pull
        // from the body class, as the user is not dynamically changing the theme.
        const bodyClassList = document.body.classList;
        const bodyTheme = bodyClassList.contains('background-light')
          ? 'Light'
          : 'Dark';
        if (supportedThemes.includes(bodyTheme)) {
          setTheme(bodyTheme);
        } else {
          setTheme(supportedThemes[0]);
        }
        dispatch(setIsLoadingTheme(false));
      };

      if (useThemeUserPreference && signInState === SignInState.SignedIn) {
        const fetchAndSetTheme = async () => {
          const userTheme = await new UserPreferences().getGlobalTheme();
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
  }, [currentAppName, setTheme, useThemeUserPreference, signInState, dispatch]);

  // Do not render lab view if project is blocked and user is not a project validator.
  if (!currentAppName || (isBlocked && !isProjectValidator)) {
    return null;
  }

  // Show a fallback no exemplar page if we are trying to view
  // exemplar but there is not exemplar for this level.
  if (isViewingExemplar && !exemplarSources) {
    return <NoExemplarPage />;
  }

  const properties = lab2EntryPoints[currentAppName];
  if (!properties) {
    console.warn("Don't know how to render app: " + currentAppName);
    return null;
  }

  const extraLinksButtonRightOfFooter =
    levelProperties?.isProjectLevel &&
    (currentAppName === 'pythonlab' || currentAppName === 'weblab2');

  const LabView = properties.view;
  return (
    <ProgressContainer key={currentAppName} appType={currentAppName}>
      <div id={`lab2-${currentAppName}`} className={moduleStyles.labContainer}>
        <Suspense fallback={<Loading isLoading={true} />}>
          <LabView
            levelProperties={levelProperties}
            initialSources={initialSources}
          />
        </Suspense>
        {!hideExtraLinks && levelId && (
          <ExtraLinks
            levelId={levelId}
            positionRightOfFooter={extraLinksButtonRightOfFooter}
          />
        )}
      </div>
    </ProgressContainer>
  );
};

export default LabViewsRenderer;
