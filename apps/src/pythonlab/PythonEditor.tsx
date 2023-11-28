import React, {useEffect, useRef} from 'react';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {EditorView} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import classNames from 'classnames';
import {editorSetup} from '../javalab/editorSetup';
import {python} from '@codemirror/lang-python';

// const CodeMirrorView = require('@codemirror/view');
// const CodeMirrorState = require('@codemirror/state');
// const CodeMirrorLangPython = require('@codemirror/lang-python');

const PythonEditor: React.FunctionComponent = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current === null) {
      return;
    }

    const editorExtensions = [...editorSetup, python()];
    new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: editorExtensions,
      }),
      parent: editorRef.current,
    });
  }, [editorRef]);

  return (
    <PanelContainer id="python-editor" headerText="Editor" hideHeaders={false}>
      <div ref={editorRef} className={classNames('codemirror-container')} />
    </PanelContainer>
  );
};

export default PythonEditor;
