import React, {useCallback} from 'react';

import {editableFileType} from '@cdoide/utils';
import {useCDOIDEContext} from '@cdoide/cdoIDEContext';

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

const Editor = () => {
  const {project, saveFile} = useCDOIDEContext();
  const file = Object.values(project.files).filter(f => f.active)?.[0];
  // this is a stupid hack. the low level code-mirror editor won't update itself
  // automatically if the doc is changed externally. So in lieu of doing it better,
  // for now we just key the component off of the file ID + an incrementing value that
  // hits every time the format button is pressed. That'll force a re-render and make it work.
  // let's swap this out with something better.

  const onChange = useCallback(
    (value: string) => {
      saveFile(file.id, value);
    },
    [file, saveFile]
  );

  /* const format = async () => {
    const prettified = await prettify(file.contents, file.language);
    saveFile(file.id, prettified);
  };*/

  if (!editableFileType(file.language)) {
    return <div>Cannot currently edit files of type {file.language}</div>;
  }

  return (
    <div className="editor-container">
      {/*<button type="button" onClick={() => format()}>
        Format
      </button> */}
      {file && (
        <CodeEditor
          key={`${file.id}/${1}`}
          darkMode={true}
          onCodeChange={onChange}
          startCode={file.contents}
          editorConfigExtensions={[codeMirrorLangMapping[file.language]]}
        />
      )}
    </div>
  );
};

export default Editor;
