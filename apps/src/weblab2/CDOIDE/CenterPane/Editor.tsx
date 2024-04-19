import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import {editableFileType} from '@cdoide/utils';
import {LanguageSupport} from '@codemirror/language';
import React, {useCallback, useMemo} from 'react';

import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';

const Editor = (
  langMapping: {[key: string]: LanguageSupport},
  editableFileTypes: string[]
) => {
  const {project, saveFile} = useCDOIDEContext();
  const file = Object.values(project.files).filter(f => f.active)?.[0];
  // this is a stupid hack. the low level code-mirror editor won't update itself
  // automatically if the doc is changed externally. So in lieu of doing it better,
  // for now we just key the component off of the file ID + an incrementing value that
  // hits every time the format button is pressed. That'll force a re-render and make it work.
  // let's swap this out with something better.

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

export default Editor;
