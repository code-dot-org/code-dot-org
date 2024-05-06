import React from 'react';

import {CDOIDEContextProvider} from '@cdo/apps/codebridge/codebridgeContext';
import DisabledEditor from '@cdo/apps/codebridge/Editor/DisabledEditor';
import {FileBrowser} from '@cdo/apps/codebridge/FileBrowser';
import {FileTabs} from '@cdo/apps/codebridge/FileTabs';
import {useSynchronizedProject} from '@cdo/apps/codebridge/hooks';
import {Instructions} from '@cdo/apps/codebridge/Instructions';
import {PreviewContainer} from '@cdo/apps/codebridge/PreviewContainer';
import {SideBar} from '@cdo/apps/codebridge/SideBar';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from '@cdo/apps/codebridge/types';
import './styles/cdoIDE.css';

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
