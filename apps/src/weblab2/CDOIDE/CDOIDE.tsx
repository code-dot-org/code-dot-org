import {CDOIDEContextProvider} from '@cdoide/cdoIDEContext';
import {CenterPane} from '@cdoide/CenterPane';
import {useSynchronizedProject} from '@cdoide/hooks';
import {LeftPane} from '@cdoide/LeftPane';
import {RightPane} from '@cdoide/RightPane';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from '@cdoide/types';
import React from 'react';
import './styles/cdoIDE.css';

type CDOIDEProps = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
};

type PaneKey = {
  key: keyof typeof configVisibilityDefaults;
};

const configVisibilityDefaults = {
  showPreview: true,
  showEditor: true,
  showLeftNav: true,
};

const getConfigVisibilityVal = (
  key: keyof typeof configVisibilityDefaults,
  config: ConfigType
) => {
  return config[key] ?? configVisibilityDefaults[key] ?? false;
};

const paneWidths: (PaneKey & {width: string})[] = [
  {key: 'showLeftNav', width: '1fr'},
  {key: 'showPreview', width: '2fr'},
  {key: 'showEditor', width: '2fr'},
];

const paneHeights: (PaneKey & {height: string})[] = [];

export const CDOIDE = React.memo(
  ({project, config, setProject, setConfig}: CDOIDEProps) => {
    // keep our internal reducer backed copy synced up with our external whatever backed copy
    // see useSynchronizedProject for more info.
    const [internalProject, projectUtilities] = useSynchronizedProject(
      project,
      setProject
    );

    const outerGridRows = ['auto'];
    paneHeights.forEach(pair => {
      if (getConfigVisibilityVal(pair.key, config)) {
        outerGridRows.push(pair.height);
      }
    });

    const innerGridCols: string[] = [];
    paneWidths.forEach(pair => {
      if (getConfigVisibilityVal(pair.key, config)) {
        innerGridCols.push(pair.width);
      }
    });
    return (
      <CDOIDEContextProvider
        value={{
          project: internalProject,
          config,
          setProject,
          setConfig,
          ...projectUtilities,
        }}
      >
        <div
          className="cdo-ide-outer"
          style={{gridTemplateRows: outerGridRows.join(' ')}}
        >
          <div
            className="cdo-ide-inner"
            style={{
              gridTemplateColumns: innerGridCols.join(' '),
            }}
          >
            {getConfigVisibilityVal('showLeftNav', config) && (
              <div className="cdo-ide-area">
                <LeftPane />
              </div>
            )}
            {getConfigVisibilityVal('showEditor', config) && (
              <div className="cdo-ide-area">
                <CenterPane />
              </div>
            )}
            {getConfigVisibilityVal('showPreview', config) && <RightPane />}
          </div>
        </div>
      </CDOIDEContextProvider>
    );
  }
);
