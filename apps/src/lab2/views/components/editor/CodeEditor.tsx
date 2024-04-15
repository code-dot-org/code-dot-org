import React, {useEffect, useRef, useState} from 'react';
import classNames from 'classnames';
import {EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import PanelContainer from '../PanelContainer';
import {useDispatch} from 'react-redux';
import {editorConfig} from './editorConfig';
import {darkMode as darkModeTheme} from './editorThemes';
import {autocompletion} from '@codemirror/autocomplete';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface CodeEditorProps {
  onCodeChange: (code: string) => void;
  editorConfigExtensions: Extension[];
  startCode: string;
  darkMode?: boolean;
}

const CodeEditor: React.FunctionComponent<CodeEditorProps> = ({
  onCodeChange,
  editorConfigExtensions,
  startCode,
  darkMode = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [didInit, setDidInit] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const channelId = useAppSelector(state => state.lab.channel?.id);

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

      onEditorUpdate,
      autocompletion(),
      ...editorConfigExtensions,
    ];
    if (darkMode) {
      editorExtensions.push(darkModeTheme);
    }
    setEditorView(
      new EditorView({
        state: EditorState.create({
          doc: startCode,
          extensions: editorExtensions,
        }),
        parent: editorRef.current,
      })
    );
    setDidInit(true);
  }, [
    dispatch,
    editorRef,
    editorConfigExtensions,
    onCodeChange,
    startCode,
    didInit,
    darkMode,
  ]);

  // When we have a new channelId and/or start code, reset the editor with the start code.
  // A new channelId means we are loading a new project, and we need to reset the editor.
  useEffect(() => {
    if (editorView && editorView.state.doc.toString() !== startCode) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: startCode,
        },
      });
    }
  }, [startCode, editorView, channelId]);

  return (
    <PanelContainer id="code-editor" headerContent="Editor" hideHeaders={false}>
      <div ref={editorRef} className={classNames('codemirror-container')} />
    </PanelContainer>
  );
};

export default CodeEditor;
