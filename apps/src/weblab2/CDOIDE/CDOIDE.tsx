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

export const CDOIDE = React.memo(
  ({project, config, setProject, setConfig}: CDOIDEProps) => {
    // keep our internal reducer backed copy synced up with our external whatever backed copy
    // see useSynchronizedProject for more info.
    const [internalProject, projectUtilities] = useSynchronizedProject(
      project,
      setProject
    );

    const EditorComponent = config.EditorComponent || DisabledEditor;

    const ComponentMap = {
      'file-browser': FileBrowser,
      'side-bar': SideBar,
      editor: EditorComponent,
      'preview-container': PreviewContainer,
      instructions: config.Instructions || Instructions,
      'file-tabs': FileTabs,
    };

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
          className="cdoide-container"
          style={{
            gridTemplateAreas: config.gridLayout,
            gridTemplateRows: config.gridLayoutRows,
            gridTemplateColumns: config.gridLayoutColumns,
          }}
        >
          {(Object.keys(ComponentMap) as Array<keyof typeof ComponentMap>)
            .filter(key => config.gridLayout.match(key))
            .map(key => {
              const Component = ComponentMap[key];
              return <Component key={key} />;
            })}

          {/*<Search />*/}
        </div>
      </CDOIDEContextProvider>
    );
  }
);
