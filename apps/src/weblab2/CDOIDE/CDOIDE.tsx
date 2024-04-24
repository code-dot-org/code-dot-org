import {CDOIDEContextProvider} from '@cdoide/cdoIDEContext';
import DisabledEditor from '@cdoide/Editor/DisabledEditor';
import {FileBrowser} from '@cdoide/FileBrowser';
import {FileTabs} from '@cdoide/FileTabs';
import {useSynchronizedProject} from '@cdoide/hooks';
import {Instructions} from '@cdoide/Instructions';
import {PreviewContainer} from '@cdoide/PreviewContainer';
import {SideBar} from '@cdoide/SideBar';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from '@cdoide/types';
import React from 'react';
import './styles/cdoIDE.css';

// import {Search} from '@cdoide/Search';
// const Editor = () => <div style={{gridArea: 'editor'}}>This is me editor</div>;

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

const layout = `
  "instructions instructions preview-container"
  "side-bar file-tabs preview-container"
  "file-browser editor preview-container"
`;

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

    const EditorComponent = config.EditorComponent || DisabledEditor;

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
        <div className="cdoide-container" style={{gridTemplateAreas: layout}}>
          <FileBrowser />
          <SideBar />
          <EditorComponent />
          <PreviewContainer />
          <Instructions />
          <FileTabs />
          {/*<Search />

          <FileTabs />*/}
        </div>
      </CDOIDEContextProvider>
    );
  }
);
