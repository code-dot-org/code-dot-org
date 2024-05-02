/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */
import AichatView from '@cdo/apps/aichat/views/AichatView';
import DanceView from '@cdo/apps/dance/lab2/views/DanceView';
import {setUpBlocklyForMusicLab} from '@cdo/apps/music/blockly/setup';
import MusicView from '@cdo/apps/music/views/MusicView';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import classNames from 'classnames';
import React, {
  ComponentType,
  LazyExoticComponent,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useState,
} from 'react';
import ProgressContainer from '../progress/ProgressContainer';
import {AppName} from '../types';
import moduleStyles from './lab-views-renderer.module.scss';
import {DEFAULT_THEME, Theme, ThemeContext} from './ThemeWrapper';
import PanelsLabView from '@cdo/apps/panels/PanelsLabView';
import Weblab2View from '@cdo/apps/weblab2/Weblab2View';
import Loading from './Loading';
import ExtraLinks from './ExtraLinks';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
   * A lazy loaded view for the lab. If this is specified, it will be used
   * over the node property. This is useful for lab views that load extra
   * dependencies that we don't want loaded for every lab.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyNode?: LazyExoticComponent<ComponentType<any>>;
  /**
   * Display theme for this lab. This will likely be configured by user
   * preferences eventually, but for now this is fixed for each lab. Defaults
   * to the default theme if not specified.
   */
  theme?: Theme;
  /**
   * Optional function to run when the lab is first mounted. This is useful
   * for any one-time setup actions such as setting up Blockly.
   */
  setupFunction?: () => void;
}

const appsProperties: {[appName in AppName]?: AppProperties} = {
  music: {
    backgroundMode: true,
    node: <MusicView />,
    theme: Theme.DARK,
    setupFunction: setUpBlocklyForMusicLab,
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
  pythonlab: {
    backgroundMode: false,
    node: <div />,
    lazyNode: lazy(() =>
      import(
        /* webpackChunkName: "pythonlab" */ '../../pythonlab/index.js'
      ).then(({PythonlabView}) => ({
        default: PythonlabView,
      }))
    ),
    theme: Theme.LIGHT,
  },
  panels: {
    backgroundMode: false,
    node: <PanelsLabView />,
  },
  weblab2: {
    backgroundMode: false,
    node: <Weblab2View />,
    theme: Theme.LIGHT,
  },
};

const LabViewsRenderer: React.FunctionComponent = () => {
  const currentAppName = useAppSelector(
    state => state.lab.levelProperties?.appName
  );
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  console.log({levelId});

  const [appsToRender, setAppsToRender] = useState<AppName[]>([]);

  // When navigating to a new app type, add it to the list of apps to render.
  useEffect(() => {
    if (currentAppName && !appsToRender.includes(currentAppName)) {
      // Run the setup function for the Lab if it has one.
      appsProperties[currentAppName]?.setupFunction?.();
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

  const renderApp = (appProperties: AppProperties) => {
    return appProperties.lazyNode ? (
      <Suspense fallback={<Loading isLoading={true} />}>
        <appProperties.lazyNode />
      </Suspense>
    ) : (
      appProperties.node
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
                {renderApp(properties)}
                {levelId && <ExtraLinks levelId={levelId} />}
              </VisibilityContainer>
            )}

            {!properties.backgroundMode && currentAppName === appName && (
              <VisibilityContainer appName={appName} visible={true}>
                {renderApp(properties)}
                {levelId && <ExtraLinks levelId={levelId} />}
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
