import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import PanelContainer from '../PanelContainer';
import {useDispatch} from 'react-redux';
import {editorConfig} from './editorConfig';
import {darkMode} from './editorThemes';

interface CodeEditorProps {
  onCodeChange: (code: string) => void;
  editorConfigExtensions: Extension[];
  startCode: string;
}

const CodeEditor: React.FunctionComponent<CodeEditorProps> = ({
  onCodeChange,
  editorConfigExtensions,
  startCode,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [didInit, setDidInit] = useState(false);

  useEffect(() => {
    if (editorRef.current === null || didInit) {
      return;
    }

    const onEditorUpdate = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        onCodeChange(update.state.doc.toString());
      }
    );

    const editorExtensions = [
      ...editorConfig,
      darkMode,
      onEditorUpdate,
      ...editorConfigExtensions,
    ];
    new EditorView({
      state: EditorState.create({
        doc: startCode,
        extensions: editorExtensions,
      }),
      parent: editorRef.current,
    });
    setDidInit(true);
  }, [
    dispatch,
    editorRef,
    editorConfigExtensions,
    onCodeChange,
    startCode,
    didInit,
  ]);

  return (
    <PanelContainer id="code-editor" headerText="Editor" hideHeaders={false}>
      <div ref={editorRef} className={classNames('codemirror-container')} />
    </PanelContainer>
  );
};

export default CodeEditor;
