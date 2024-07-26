import {CodebridgeContextProvider} from '@codebridge/codebridgeContext';
import {FileBrowser} from '@codebridge/FileBrowser';
import {useSynchronizedProject} from '@codebridge/hooks';
import {InfoPanel} from '@codebridge/InfoPanel';
import {PreviewContainer} from '@codebridge/PreviewContainer';
import {SideBar} from '@codebridge/SideBar';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
  OnRunFunction,
  ResetProjectFunction,
} from '@codebridge/types';
import React from 'react';

import './styles/cdoIDE.scss';
import Console from './Console';
import ControlButtons from './ControlButtons';
import Workspace from './Workspace';

type CodebridgeProps = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
  resetProject: ResetProjectFunction;
  onRun?: OnRunFunction;
};

export const Codebridge = React.memo(
  ({
    project,
    config,
    setProject,
    setConfig,
    resetProject,
    onRun,
  }: CodebridgeProps) => {
    // keep our internal reducer backed copy synced up with our external whatever backed copy
    // see useSynchronizedProject for more info.
    const [internalProject, projectUtilities] = useSynchronizedProject(
      project,
      setProject
    );

    const ComponentMap = {
      'file-browser': FileBrowser,
      'side-bar': SideBar,
      'preview-container': PreviewContainer,
      'info-panel': config.Instructions || InfoPanel,
      workspace: Workspace,
      console: Console,
      'control-buttons': ControlButtons,
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

    return (
      <CodebridgeContextProvider
        value={{
          project: internalProject,
          config,
          setProject,
          setConfig,
          resetProject,
          onRun,
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
            .filter(key => gridLayout.match(key))
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
