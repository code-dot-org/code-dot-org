import React, {useCallback} from 'react';

import {useCDOIDEContext, editableFileType} from 'cdo-ide-poc';

import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {html} from '@codemirror/lang-html';
import {css} from '@codemirror/lang-css';
import {javascript as js} from '@codemirror/lang-javascript';
import {LanguageSupport} from '@codemirror/language';
//import prettier from 'prettier/standalone';
//import htmlParser from 'prettier/parser-html';
//import cssParser from 'prettier/parser-postcss';

const codeMirrorLangMapping: {[key: string]: LanguageSupport} = {
  html: html(),
  css: css(),
  js: js(),
};

const prettify = async (val: string /* language: string */) => {
  alert(
    `Unfortunately, prettier/standalone doesn't seem to work as of yet in the cdo environment.

    So this button is off for now.

    Maybe we need to use a different library?`
  );

  return val;

  /*const formatted = await prettier.format(val, {
    parser: language,
    plugins: [cssParser, htmlParser],
    tabWidth: 2,
    htmlWhitespaceSensitivity: 'ignore',
  });

  return formatted;
  */
};

const Editor = () => {
  const {project, saveFile} = useCDOIDEContext();
  const file = Object.values(project.files).filter(f => f.active)?.[0];

  const onChange = useCallback(
    (value: string) => {
      saveFile(file.id, value);
    },
    [file, saveFile]
  );

  const format = async () => {
    const prettified = await prettify(file.contents /*, file.language*/);
    saveFile(file.id, prettified);
  };

  if (!editableFileType(file.language)) {
    return <div>Cannot currently edit files of type {file.language}</div>;
  }

  return (
    <div className="editor-container">
      <button type="button" onClick={() => format()}>
        Format
      </button>
      {file && (
        <CodeEditor
          key={file.id}
          darkMode={false}
          onCodeChange={onChange}
          startCode={file.contents}
          editorConfigExtensions={[codeMirrorLangMapping[file.language]]}
        />
      )}
    </div>
  );
};

export default Editor;
