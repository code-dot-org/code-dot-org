import React, {useCallback} from 'react';

import {useCDOIDEContext} from '../CDOIDEContext';

import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {html} from '@codemirror/lang-html';
import {css} from '@codemirror/lang-css';
//import prettier from 'prettier/standalone';
//import htmlParser from 'prettier/plugins/html';
//import cssParser from 'prettier/plugins/postcss';

import {SaveFileFunction} from './types';

const codeMirrorLangMapping = {
  html: html(),
  css: css(),
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

type EditorProps = {
  saveFile: SaveFileFunction;
};

export const Editor = ({saveFile = () => undefined}: EditorProps) => {
  const {project} = useCDOIDEContext();

  const file = Object.values(project.files).filter(f => f.active)?.[0];

  const onChange = useCallback(
    (value: string) => {
      saveFile(file.name, value);
    },
    [file, saveFile]
  );

  const format = async () => {
    const prettified = await prettify(file.contents /*, file.language*/);
    saveFile(file.name, prettified);
  };

  if (file.language !== 'html' && file.language !== 'css') {
    return <div>Cannot currently edit non html/non css files</div>;
  }

  return (
    <div className="editor-container">
      <button type="button" onClick={() => format()}>
        Format
      </button>
      {file && (
        <CodeEditor
          darkMode={false}
          onCodeChange={onChange}
          startCode={file.contents}
          editorConfigExtensions={[codeMirrorLangMapping[file.language]]}
        />
      )}
    </div>
  );
};
