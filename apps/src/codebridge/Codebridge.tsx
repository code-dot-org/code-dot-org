import {
  CodebridgeContextProvider,
  sourceReducer,
  SOURCE_REDUCER_ACTIONS,
  useSourceUtilities,
} from '@codebridge/codebridgeContext';
import {FileBrowser} from '@codebridge/FileBrowser';
import {useReducerWithCallback} from '@codebridge/hooks';
import {InfoPanel} from '@codebridge/InfoPanel';
import {SideBar} from '@codebridge/SideBar';
import {
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
} from '@codebridge/types';
import React, {useEffect, useReducer, useRef} from 'react';

import {FilePreview} from '@cdo/apps/codebridge/FilePreview';
import './styles/small-footer-dark-overrides.scss';
import {LabConfig, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

import Workspace from './Workspace';
import Output from './Workspace/Output';
import WorkspaceAndOutput from './Workspace/WorkspaceAndOutput';

import moduleStyles from './styles/cdoIDE.module.scss';
import './styles/codebridge.scss';

type CodebridgeProps = {
  source: MultiFileSource;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
  startSources: ProjectSources;
  onRun?: OnRunFunction;
  onStop?: () => void;
  projectVersion: number;
  labConfig?: LabConfig;
};

export const Codebridge = React.memo(
  ({
    source,
    config,
    setProject,
    setConfig,
    startSources,
    onRun,
    onStop,
    projectVersion,
    labConfig,
  }: CodebridgeProps) => {
    const reducerWithCallback = useReducerWithCallback(
      sourceReducer,
      (source: MultiFileSource) => setProject({source, labConfig}),
      new Set(SOURCE_REDUCER_ACTIONS.REPLACE_SOURCE)
    );
    const [internalSource, dispatch] = useReducer(reducerWithCallback, source);

    const sourceUtilities = useSourceUtilities(dispatch);

    const currentProjectVersion = useRef(projectVersion);
    useEffect(() => {
      if (projectVersion !== currentProjectVersion.current) {
        sourceUtilities.replaceSource(source);
        currentProjectVersion.current = projectVersion;
      }
    }, [currentProjectVersion, sourceUtilities, projectVersion, source]);

    const ComponentMap = {
      'file-browser': FileBrowser,
      'side-bar': SideBar,
      'file-preview': FilePreview,
      'info-panel': config.Instructions || InfoPanel,
      workspace: Workspace,
      output: Output,
      'workspace-and-output': WorkspaceAndOutput,
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
          source: internalSource,
          config,
          setProject,
          setConfig,
          startSources,
          onRun,
          onStop,
          ...sourceUtilities,
          labConfig,
        }}
      >
        <div
          className={moduleStyles['cdoide-container']}
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
