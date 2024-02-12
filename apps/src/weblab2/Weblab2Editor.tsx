import React from 'react';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import {html} from '@codemirror/lang-html';
import {htmlLinter} from './htmlLinter';
import {lintGutter} from '@codemirror/lint';
// import {css} from '@codemirror/lang-css';
// import {cssLinter} from './cssLinter';

const Weblab2Editor: React.FunctionComponent = () => {
  // To use css, replace html() with css() and htmlLinter with cssLinter
  const editorExtensions = [html(), htmlLinter, lintGutter()];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onCodeChange = () => {};

  return (
    <CodeEditor
      onCodeChange={onCodeChange}
      startCode={'<!DOCTYPE HTML>\n<h1>Hello, world!</h1>'}
      editorConfigExtensions={editorExtensions}
    />
  );
};

export default Weblab2Editor;
