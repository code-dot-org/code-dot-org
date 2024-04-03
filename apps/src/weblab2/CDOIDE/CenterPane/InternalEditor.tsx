// This whole thing is shut off, though still present, because I can't get @uiw/react-codemirror to
// install w/o throwing a TON of errors.

/*
import React, {useState, useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';

import {html} from '@codemirror/lang-html';
import {css} from '@codemirror-lang-css';
import {javascript as js} from '@codemirror/lang-javascript';
// @codemirror/lang-json won't install, for some reason. :-(
//import {json} from '@codemirror/lang-json';
import {LanguageSupport} from '@codemirror/language';

import {useCDOIDEContext} from '@cdoide/cdoIDEContext';
import {editableFileType, prettify} from '@cdoide/utils';
import {useEmptyEditor} from '@cdoide/hooks';
import {EditorTheme} from '@cdoide/types';

import './styles/internalEditor.css';

const codeMirrorLangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
  js: js(),
  // json: json(),
};

const Editor = () => {
  const {
    project,
    saveFile,
    config: {editableFileTypes, defaultTheme = 'light'},
  } = useCDOIDEContext();

  const [theme, setTheme] = useState<EditorTheme>(defaultTheme);
  const EmptyEditor = useEmptyEditor();

  const file = Object.values(project.files).filter(f => f.active)?.[0];

  const onChange = useCallback(
    (value: string) => {
      saveFile(file.id, value);
    },
    [saveFile, file]
  );

  const format = async () => {
    try {
      const prettified = await prettify(file.contents, file.language);
      saveFile(file.id, prettified);
    } catch (e) {
      console.log('FAILURE : ', e);
    }
  };

  if (!file) {
    return <EmptyEditor />;
  }

  if (!editableFileType(file.language, editableFileTypes)) {
    return (
      <div>
        Can only edit html, css, or javascript files. Cannot edit{' '}
        {file.language} files.
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="button-bar">
        <button onClick={() => format()}>Format</button>
        <select
          onChange={e => setTheme(e.target.value as EditorTheme)}
          value={theme}
        >
          <option value="light">light theme</option>
          <option value="dark">dark theme</option>
        </select>
      </div>
      {file && (
        <CodeMirror
          value={file.contents}
          width="100%"
          height="100%"
          extensions={[codeMirrorLangMapping[file.language]]}
          onChange={onChange}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Editor;

*/
