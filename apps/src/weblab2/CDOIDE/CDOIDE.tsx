import React from 'react';
import {CDOIDEContextProvider} from './CDOIDEContext';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from './types';

import {LeftPane} from './left-pane';
import {CenterPane} from './center-pane';
import {RightPane} from './right-pane';
import {RunBar} from './run-bar';

import './styles/cdo-ide.css';

type CDOIDEProps = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
};

export const CDOIDE = ({
  project,
  config,
  setProject,
  setConfig,
}: CDOIDEProps) => {
  return (
    <CDOIDEContextProvider value={{project, config, setProject, setConfig}}>
      <div
        className="cdo-ide-outer"
        style={{gridTemplateRows: config.showRunBar ? 'auto 40px' : 'auto'}}
      >
        <div
          className="cdo-ide-inner"
          style={{
            gridTemplateColumns: config.showPreview ? '1fr 2fr 2fr' : '1fr 2fr',
          }}
        >
          <div className="cdo-ide-area">
            <LeftPane />
          </div>
          <div className="cdo-ide-area">
            <CenterPane />
          </div>
          {config.showPreview && <RightPane />}
        </div>
        {config.showRunBar && <RunBar />}
      </div>
    </CDOIDEContextProvider>
  );
};
