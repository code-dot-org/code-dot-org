import {CodebridgeContextProvider} from '@codebridge/codebridgeContext';
import DisabledEditor from '@codebridge/Editor/DisabledEditor';
import {FileBrowser} from '@codebridge/FileBrowser';
import {FileTabs} from '@codebridge/FileTabs';
import {useSynchronizedProject} from '@codebridge/hooks';
import {Instructions} from '@codebridge/Instructions';
import {PreviewContainer} from '@codebridge/PreviewContainer';
import {SideBar} from '@codebridge/SideBar';
import {
  ProjectType,
  ConfigType,
  SetProjectFunction,
  SetConfigFunction,
} from '@codebridge/types';
import React from 'react';
import './styles/cdoIDE.css';

type CodebridgeProps = {
  project: ProjectType;
  config: ConfigType;
  setProject: SetProjectFunction;
  setConfig: SetConfigFunction;
};

export const Codebridge = React.memo(
  ({project, config, setProject, setConfig}: CodebridgeProps) => {
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
      <CodebridgeContextProvider
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
      </CodebridgeContextProvider>
    );
  }
);
