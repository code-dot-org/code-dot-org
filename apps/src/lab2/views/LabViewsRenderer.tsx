/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */

import React, {Suspense, useContext, useEffect} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';
import {PERMISSIONS} from '../constants';
import ProgressContainer from '../progress/ProgressContainer';
import {getAppOptionsViewingExemplar} from '../projects/utils';

import NoExemplarPage from './components/NoExemplarPage';
import ExtraLinks from './ExtraLinks';
import Loading from './Loading';
import {DEFAULT_THEME, ThemeContext} from './ThemeWrapper';

import moduleStyles from './lab-views-renderer.module.scss';

const hideExtraLinks = queryParams('hide-extra-links') === 'true';

const LabViewsRenderer: React.FunctionComponent = () => {
  const currentAppName = useAppSelector(
    state => state.lab.levelProperties?.appName
  );
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const exemplarSources = useAppSelector(
    state => state.lab.levelProperties?.exemplarSources
  );
  const isBlocked = useAppSelector(state => state.lab.isBlocked);
  const isProjectValidator = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.PROJECT_VALIDATOR)
  );

  const isViewingExemplar = getAppOptionsViewingExemplar();

  // Set the theme for the current app.
  const {setTheme} = useContext(ThemeContext);
  useEffect(() => {
    if (currentAppName) {
      const theme = lab2EntryPoints[currentAppName]?.theme || DEFAULT_THEME;
      setTheme(theme);
    }
  }, [currentAppName, setTheme]);

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

  const LabView = properties.view;
  return (
    <ProgressContainer key={currentAppName} appType={currentAppName}>
      <div id={`lab2-${currentAppName}`} className={moduleStyles.labContainer}>
        <Suspense fallback={<Loading isLoading={true} />}>
          <LabView />
        </Suspense>
        {!hideExtraLinks && levelId && <ExtraLinks levelId={levelId} />}
      </div>
    </ProgressContainer>
  );
};

export default LabViewsRenderer;
