/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */
import AichatView from '@cdo/apps/aichat/views/AichatView';
import DanceView from '@cdo/apps/dance/lab2/views/DanceView';
import MusicView from '@cdo/apps/music/views/MusicView';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import classNames from 'classnames';
import React, {useContext, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {LabState} from '../lab2Redux';
import ProgressContainer from '../progress/ProgressContainer';
import {AppName} from '../types';
import moduleStyles from './lab-views-renderer.module.scss';
import {DEFAULT_THEME, Theme, ThemeContext} from './ThemeWrapper';

// Configuration for how a Lab should be rendered
interface AppProperties {
  /**
   * Whether this lab should remain rendered in the background once mounted.
   * If true, the lab will always be present in the tree, but will be hidden
   * via visibility: hidden when not active. If false, the lab will only
   * be rendered in the tree when active.
   */
  backgroundMode: boolean;
  /** React View for the Lab */
  node: React.ReactNode;
  /**
   * Display theme for this lab. This will likely be configured by user
   * preferences eventually, but for now this is fixed for each lab. Defaults
   * to the default theme if not specified.
   */
  theme?: Theme;
}

const appsProperties: {[appName in AppName]?: AppProperties} = {
  music: {
    backgroundMode: true,
    node: <MusicView />,
    theme: Theme.DARK,
  },
  standalone_video: {
    backgroundMode: false,
    node: <StandaloneVideo />,
  },
  aichat: {
    backgroundMode: false,
    node: <AichatView />,
    theme: Theme.LIGHT,
  },
  dance: {
    backgroundMode: false,
    node: <DanceView />,
    theme: Theme.LIGHT,
  },
};

const LabViewsRenderer: React.FunctionComponent = () => {
  const currentAppName = useSelector(
    (state: {lab: LabState}) => state.lab.levelProperties?.appName
  );

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
      const theme = appsProperties[currentAppName]?.theme || DEFAULT_THEME;
      setTheme(theme);
    }
  }, [currentAppName, setTheme]);

  // Iterate through appsToRender and render Lab views for each. If
  // backgroundMode is true, the Lab view will always be rendered, but
  // visibility will be toggled based on whether the app is active. If
  // backgroundMode is false, the Lab view will only be rendered when the
  // app is active.
  return (
    <>
      {appsToRender.map(appName => {
        const properties = appsProperties[appName];
        if (!properties) {
          console.warn("Don't know how to render app: " + appName);
          return null;
        }

        return (
          <ProgressContainer key={appName} appType={appName}>
            {properties.backgroundMode && (
              <VisibilityContainer
                appName={appName}
                visible={currentAppName === appName}
              >
                {properties.node}
              </VisibilityContainer>
            )}

            {!properties.backgroundMode && currentAppName === appName && (
              <VisibilityContainer appName={appName} visible={true}>
                {properties.node}
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
