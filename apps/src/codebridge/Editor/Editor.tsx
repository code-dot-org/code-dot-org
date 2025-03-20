import {BodyOneText} from '@code-dot-org/component-library/typography';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {LanguageSupport} from '@codemirror/language';
import {Extension} from '@codemirror/state';
import React, {useCallback, useEffect} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getActiveFileForSource} from '@cdo/apps/lab2/projects/utils';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {getPythonLinter} from '@cdo/apps/lab2/views/components/editor/pythonLinter';

import {editableFileType, viewableImageFileType} from '../utils';

import moduleStyles from './styles/editor.module.scss';

interface EditorProps {
  langMapping: {[key: string]: LanguageSupport};
  editableFileTypes: string[];
}

export const Editor = ({langMapping, editableFileTypes}: EditorProps) => {
  const {source, saveFile} = useCodebridgeContext();
  const [loading, setLoading] = React.useState(true);
  const [extensions, setExtensions] = React.useState<Extension[]>([]);

  const file = getActiveFileForSource(source);

  const onChange = useCallback(
    (value: string) => {
      if (file?.id) {
        saveFile(file.id, value);
      }
    },
    [file?.id, saveFile]
  );

  useEffect(() => {
    setLoading(true);
    const extensions: Extension[] = [];
    if (file?.language && langMapping[file.language]) {
      extensions.push([langMapping[file.language]]);
    }
    if (file?.language === 'py') {
      getPythonLinter().then(linter => {
        extensions.push(linter);
        setExtensions(extensions);
        setLoading(false);
      });
    } else {
      setExtensions(extensions);
      setLoading(false);
    }
  }, [file?.language, langMapping]);

  // const editorConfigExtensions = useMemo(() => {
  //   const extensions: Extension[] = [];
  //   if (file?.language && langMapping[file.language]) {
  //     extensions.push([langMapping[file.language]]);
  //   }
  //   if (file?.language === 'py') {
  //     extensions.push(getPythonLinter());
  //   }
  //   return extensions;
  // }, [file?.language, langMapping]);

  if (file && viewableImageFileType(file.language)) {
    const base64 = window.btoa(file.contents);
    return (
      <div>
        <img src={`data:image/png;base64,${base64}`} alt={file.name} />
      </div>
    );
  }

  if (file && !editableFileType(file.language, editableFileTypes)) {
    return (
      <div>{codebridgeI18n.cannotEditFile({language: file.language})}</div>
    );
  }

  return (
    <div className={moduleStyles.editorContainer}>
      {!loading ? (
        file ? (
          <CodeEditor
            key={`${file.id}/${1}`}
            darkMode={true}
            onCodeChange={onChange}
            startCode={file.contents}
            editorConfigExtensions={extensions}
          />
        ) : (
          <BodyOneText className={moduleStyles.noOpenFilesMessage}>
            {codebridgeI18n.noOpenFiles()}
          </BodyOneText>
        )
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
