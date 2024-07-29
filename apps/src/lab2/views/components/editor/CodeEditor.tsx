import {autocompletion} from '@codemirror/autocomplete';
import {Compartment, EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {editorConfig} from './editorConfig';
import {darkMode as darkModeTheme} from './editorThemes';

import moduleStyles from './code-editor.module.scss';

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
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

  // These two compartments control read-only settings.
  // Controls if you can type in the editor or not.
  const editorReadOnlyCompartment = useMemo(() => new Compartment(), []);
  // Controls if the dom is focusable or not (and therefore if a cursor is visible in the editor or not).
  const editorEditableCompartment = useMemo(() => new Compartment(), []);

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

    editorExtensions.push(
      editorReadOnlyCompartment.of(EditorState.readOnly.of(isReadOnly)),
      editorEditableCompartment.of(EditorView.editable.of(!isReadOnly))
    );
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
    editorReadOnlyCompartment,
    isReadOnly,
    editorEditableCompartment,
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

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          editorReadOnlyCompartment.reconfigure(
            EditorState.readOnly.of(isReadOnly)
          ),
          editorEditableCompartment.reconfigure(
            EditorView.editable.of(!isReadOnly)
          ),
        ],
      });
    }
  }, [
    isReadOnly,
    editorView,
    editorReadOnlyCompartment,
    editorEditableCompartment,
  ]);

  return (
    <div
      ref={editorRef}
      className={classNames(
        'codemirror-container',
        moduleStyles.codeEditorContainer
      )}
    />
  );
};

export default CodeEditor;
