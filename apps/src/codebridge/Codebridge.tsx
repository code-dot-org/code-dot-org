import {
  CodebridgeContextProvider,
  projectReducer,
  PROJECT_REDUCER_ACTIONS,
  useProjectUtilities,
} from '@codebridge/codebridgeContext';
import {FileBrowser} from '@codebridge/FileBrowser';
import {useReducerWithCallback} from '@codebridge/hooks';
import {InfoPanel} from '@codebridge/InfoPanel';
import {PreviewContainer} from '@codebridge/PreviewContainer';
import {SideBar} from '@codebridge/SideBar';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
} from '@codebridge/types';
import React, {useEffect, useReducer, useRef} from 'react';

import './styles/cdoIDE.scss';
import {ProjectSources} from '@cdo/apps/lab2/types';

import Console from './Console';
import Workspace from './Workspace';
import WorkspaceAndConsole from './Workspace/WorkspaceAndConsole';

type CodebridgeProps = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
  startSource: ProjectSources;
  onRun?: OnRunFunction;
  onStop?: () => void;
  projectVersion: number;
};

export const Codebridge = React.memo(
  ({
    project,
    config,
    setProject,
    setConfig,
    startSource,
    onRun,
    onStop,
    projectVersion,
  }: CodebridgeProps) => {
    const reducerWithCallback = useReducerWithCallback(
      projectReducer,
      setProject,
      new Set(PROJECT_REDUCER_ACTIONS.REPLACE_PROJECT)
    );
    const [internalProject, dispatch] = useReducer(
      reducerWithCallback,
      project
    );

    const projectUtilities = useProjectUtilities(dispatch);

    const currentProjectVersion = useRef(projectVersion);
    useEffect(() => {
      if (projectVersion !== currentProjectVersion.current) {
        projectUtilities.replaceProject(project);
        currentProjectVersion.current = projectVersion;
      }
    }, [currentProjectVersion, project, projectUtilities, projectVersion]);

    const ComponentMap = {
      'file-browser': FileBrowser,
      'side-bar': SideBar,
      'preview-container': PreviewContainer,
      'info-panel': config.Instructions || InfoPanel,
      workspace: Workspace,
      console: Console,
      'workspace-and-console': WorkspaceAndConsole,
    };

    let gridLayout: string;
    let gridLayoutRows: string;
    let gridLayoutColumns: string;
    if (
      config.gridLayout &&
      config.gridLayoutRows &&
      config.gridLayoutColumns
    ) {
      gridLayout = config.gridLayout;
      gridLayoutRows = config.gridLayoutRows;
      gridLayoutColumns = config.gridLayoutColumns;
    } else if (config.labeledGridLayouts && config.activeGridLayout) {
      const labeledLayout = config.labeledGridLayouts[config.activeGridLayout];
      gridLayout = labeledLayout.gridLayout;
      gridLayoutRows = labeledLayout.gridLayoutRows;
      gridLayoutColumns = labeledLayout.gridLayoutColumns;
    } else {
      throw new Error('Cannot render codebridge - no layout provided');
    }
    // gridLayout is a css string that defines the components in the grid layout.
    // In order to find which components are in the grid layout, we remove all quotes
    // from the string and tokenize it.
    const gridLayoutKeys = gridLayout
      .trim()
      .replaceAll(`"`, '')
      .split(' ')
      .map(key => key.trim());

    return (
      <CodebridgeContextProvider
        value={{
          project: internalProject,
          config,
          setProject,
          setConfig,
          startSource,
          onRun,
          onStop,
          ...projectUtilities,
        }}
      >
        <div
          className="cdoide-container"
          style={{
            gridTemplateAreas: gridLayout,
            gridTemplateRows: gridLayoutRows,
            gridTemplateColumns: gridLayoutColumns,
          }}
        >
          {(Object.keys(ComponentMap) as Array<keyof typeof ComponentMap>)
            .filter(key => gridLayoutKeys.includes(key))
            .map(key => {
              const Component = ComponentMap[key];
              return <Component key={key} />;
            })}

          {/*<Search />*/}
        </div>
      </CodebridgeContextProvider>
    );
  }
);
