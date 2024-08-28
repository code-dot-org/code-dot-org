/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */

import classNames from 'classnames';
import React, {Suspense, useContext, useEffect, useState} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';
import ProgressContainer from '../progress/ProgressContainer';
import {getAppOptionsViewingExemplar} from '../projects/utils';
import {AppName, Lab2EntryPoint, OptionsToAvoid} from '../types';

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
  const isViewingExemplar = getAppOptionsViewingExemplar();

  const [appsToRender, setAppsToRender] = useState<AppName[]>([]);

  // When navigating to a new app type, add it to the list of apps to render.
  useEffect(() => {
    if (currentAppName && !appsToRender.includes(currentAppName)) {
      setAppsToRender([...appsToRender, currentAppName]);
    }
  }, [currentAppName, appsToRender]);

  // Set the theme for the current app.
  const {setTheme} = useContext(ThemeContext);
  useEffect(() => {
    if (currentAppName) {
      const theme = lab2EntryPoints[currentAppName]?.theme || DEFAULT_THEME;
      setTheme(theme);
    }
  }, [currentAppName, setTheme]);

  const renderApp = (lab2EntryPoint: Lab2EntryPoint): React.ReactNode => {
    return lab2EntryPoint.view ===
      OptionsToAvoid.UseHardcodedView_WARNING_Bloats_Lab2_Bundle ? (
      React.createElement(lab2EntryPoint.hardcodedView!)
    ) : (
      <Suspense fallback={<Loading isLoading={true} />}>
        <lab2EntryPoint.view />
      </Suspense>
    );
  };

  // Iterate through appsToRender and render Lab views for each. If
  // backgroundMode is true, the Lab view will always be rendered, but
  // visibility will be toggled based on whether the app is active. If
  // backgroundMode is false, the Lab view will only be rendered when the
  // app is active.
  return (
    <>
      {appsToRender.map(appName => {
        const properties = lab2EntryPoints[appName];
        if (!properties) {
          console.warn("Don't know how to render app: " + appName);
          return null;
        }
        // Show a fallback no exemplar page if we are  trying to view
        // exemplar but there is not exemplar for this level.
        if (isViewingExemplar && !exemplarSources) {
          return <NoExemplarPage />;
        }

        return (
          <ProgressContainer key={appName} appType={appName}>
            {properties.backgroundMode && (
              <VisibilityContainer
                appName={appName}
                visible={currentAppName === appName}
              >
                {renderApp(properties)}
                {!hideExtraLinks && levelId && <ExtraLinks levelId={levelId} />}
              </VisibilityContainer>
            )}

            {!properties.backgroundMode && currentAppName === appName && (
              <VisibilityContainer appName={appName} visible={true}>
                {renderApp(properties)}
                {!hideExtraLinks && levelId && <ExtraLinks levelId={levelId} />}
              </VisibilityContainer>
            )}
          </ProgressContainer>
        );
      })}
    </>
  );
};

interface VisibilityContainerProps {
  appName: AppName;
  visible: boolean;
  children: React.ReactNode;
}

const VisibilityContainer: React.FunctionComponent<
  VisibilityContainerProps
> = ({appName, visible, children}) => {
  return (
    <div
      id={`lab2-${appName}`}
      className={classNames(
        moduleStyles.visibilityContainer,
        visible && moduleStyles.visible
      )}
    >
      {children}
    </div>
  );
};

export default LabViewsRenderer;
