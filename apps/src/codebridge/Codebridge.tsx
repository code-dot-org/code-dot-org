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
  SendConsoleInputFunction,
} from '@codebridge/types';
import classNames from 'classnames';
import React, {useEffect, useMemo, useReducer, useRef} from 'react';

import {FilePreview} from '@cdo/apps/codebridge/FilePreview';
import {LabConfig, MultiFileSource, ProjectSources} from '@cdo/apps/lab2/types';

import Workspace from './Workspace';
import Output from './Workspace/Output';

import moduleStyles from './styles/codebridgeContainer.module.scss';
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
  sendConsoleInput?: SendConsoleInputFunction;
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
    sendConsoleInput,
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

    const innerLayout = useMemo(() => {
      let currentLayout = config.activeLayout;
      if (!currentLayout) {
        currentLayout = 'horizontal';
      }
      if (config.layoutComponents) {
        // If we were provided layout components, use them directly.
        return {
          children: config.layoutComponents[currentLayout],
          style: undefined,
          className: undefined,
        };
      } else {
        // Otherwise, get the components from the grid layout.
        const ComponentMap = {
          'file-browser': FileBrowser,
          'side-bar': SideBar,
          'file-preview': FilePreview,
          'info-panel': config.Instructions || InfoPanel,
          workspace: Workspace,
          output: Output,
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
        } else if (config.labeledGridLayouts && config.activeLayout) {
          const labeledLayout = config.labeledGridLayouts[config.activeLayout];
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
        const children = (
          Object.keys(ComponentMap) as Array<keyof typeof ComponentMap>
        )
          .filter(key => gridLayoutKeys.includes(key))
          .map(key => {
            const Component = ComponentMap[key];
            return <Component key={key} />;
          });
        return {
          children,
          style: {
            gridTemplateAreas: gridLayout,
            gridTemplateRows: gridLayoutRows,
            gridTemplateColumns: gridLayoutColumns,
          },
          className: moduleStyles.codebridgeGridContainer,
        };
      }
    }, [
      config.Instructions,
      config.activeLayout,
      config.gridLayout,
      config.gridLayoutColumns,
      config.gridLayoutRows,
      config.labeledGridLayouts,
      config.layoutComponents,
    ]);

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
          sendConsoleInput,
        }}
      >
        <div
          className={classNames(
            moduleStyles.codebridgeContainer,
            innerLayout.className
          )}
          style={innerLayout.style}
        >
          {innerLayout.children}
        </div>
      </CodebridgeContextProvider>
    );
  }
);
