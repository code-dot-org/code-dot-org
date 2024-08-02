import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {LanguageSupport} from '@codemirror/language';
import React, {useCallback, useMemo} from 'react';

import {getActiveFileForProject} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import './styles/editor.css';
import CompareCodeEditor from '@cdo/apps/lab2/views/components/editor/CompareCodeEditor';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {editableFileType} from '../utils';

interface EditorProps {
  langMapping: {[key: string]: LanguageSupport};
  editableFileTypes: string[];
}

export const Editor = ({langMapping, editableFileTypes}: EditorProps) => {
  const {project, saveFile} = useCodebridgeContext();
  const viewProject = useAppSelector(state => state.lab2Project.viewSource);

  const file = !!viewProject
    ? getActiveFileForProject(viewProject.source as MultiFileSource)
    : getActiveFileForProject(project);
  let compareToFile: ProjectFile | undefined;

  if (!!viewProject && file) {
    compareToFile = project.files[file.id];
  }

  const onChange = useCallback(
    (value: string) => {
      if (file?.id) {
        saveFile(file.id, value);
      }
    },
    [file?.id, saveFile]
  );

  const editorConfigExtensions = useMemo(() => {
    if (file?.language && langMapping[file.language]) {
      return [langMapping[file.language]];
    } else {
      return [];
    }
  }, [file?.language, langMapping]);

  if (file && !editableFileType(file.language, editableFileTypes)) {
    return <div>Cannot currently edit files of type {file.language}</div>;
  }

  return (
    <div className="editor-container">
      {viewProject
        ? file && (
            <CompareCodeEditor
              editorConfigExtensions={editorConfigExtensions}
              codeVersion1={file.contents}
              codeVersion2={compareToFile?.contents}
              darkMode={true}
            />
          )
        : file && (
            <CodeEditor
              key={`${file.id}/${1}`}
              darkMode={true}
              onCodeChange={onChange}
              startCode={file.contents}
              editorConfigExtensions={editorConfigExtensions}
            />
          )}
    </div>
  );
};
