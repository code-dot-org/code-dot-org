import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {LanguageSupport} from '@codemirror/language';
import React, {useCallback, useMemo} from 'react';

import {getActiveFileForProject} from '@cdo/apps/lab2/projects/utils';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';

import './styles/editor.css';
import {editableFileType} from '../utils';

interface EditorProps {
  langMapping: {[key: string]: LanguageSupport};
  editableFileTypes: string[];
}

export const Editor = ({langMapping, editableFileTypes}: EditorProps) => {
  const {project, saveFile} = useCodebridgeContext();

  const file = getActiveFileForProject(project);

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
      {file && (
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
