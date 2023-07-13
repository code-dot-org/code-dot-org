import MusicView from '@cdo/apps/music/views/MusicView';
import StandaloneVideo from '@cdo/apps/standaloneVideo/StandaloneVideo';
import React from 'react';
import {useSelector} from 'react-redux';
import {LabState} from '../lab2Redux';
import ProgressContainer from '../progress/ProgressContainer';
import {AppName} from '../types';

interface AppProperties {
  usesChannel: boolean;
  backgroundMode: boolean;
  node: React.ReactNode;
}

const appsProperties: {[appName in AppName]?: AppProperties} = {
  music: {
    usesChannel: true,
    backgroundMode: true,
    node: <MusicView />,
  },
  standalone_video: {
    usesChannel: false,
    backgroundMode: false,
    node: <StandaloneVideo />,
  },
};

const LabRenderer: React.FunctionComponent = () => {
  const currentAppName = useSelector(
    (state: {lab: LabState}) => state.lab.appName
  );

  // TODO: Instead of rendering all known apps, render only visited apps.
  // This will require refactoring logic around the labReadyForReload flag.
  const appsToRender = Object.keys(appsProperties) as AppName[];
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
      style={{
        width: '100%',
        height: '100%',
        visibility: visible ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default LabRenderer;
