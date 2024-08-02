// A code editor that compares two versions of the same file.
import {autocompletion} from '@codemirror/autocomplete';
import {MergeView} from '@codemirror/merge';
import {EditorState, Extension} from '@codemirror/state';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {editorConfig} from './editorConfig';
import {darkMode as darkModeTheme} from './editorThemes';

import moduleStyles from './code-editor.module.scss';

interface CodeEditorProps {
  editorConfigExtensions: Extension[];
  codeVersion1: string;
  codeVersion2: string | undefined;
  darkMode?: boolean;
}

const CompareCodeEditor: React.FunctionComponent<CodeEditorProps> = ({
  editorConfigExtensions,
  codeVersion1,
  codeVersion2,
  darkMode = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [didInit, setDidInit] = useState(false);
  const [mergeView, setMergeView] = useState<MergeView | null>(null);
  const editorExtensions = useMemo(() => {
    const extensions = [
      ...editorConfig,
      autocompletion(),
      ...editorConfigExtensions,
      EditorState.readOnly.of(true),
    ];

    if (darkMode) {
      extensions.push(darkModeTheme);
    }
    return extensions;
  }, [darkMode, editorConfigExtensions]);

  useEffect(() => {
    if (editorRef.current === null || didInit) {
      return;
    }

    setMergeView(
      new MergeView({
        a: {
          doc: codeVersion1,
          extensions: editorExtensions,
        },
        b: {
          doc: codeVersion2,
          extensions: editorExtensions,
        },
        parent: editorRef.current,
      })
    );
    setDidInit(true);
  }, [
    dispatch,
    editorRef,
    didInit,
    darkMode,
    codeVersion1,
    codeVersion2,
    editorExtensions,
  ]);

  // When we have a new channelId and/or start code, reset the editor with the start code.
  // A new channelId means we are loading a new project, and we need to reset the editor.
  useEffect(() => {
    if (
      mergeView &&
      editorRef?.current &&
      (mergeView.a.state.doc.toString() !== codeVersion1 ||
        mergeView.b.state.doc.toString() !== codeVersion2)
    ) {
      setMergeView(
        new MergeView({
          a: {
            doc: codeVersion1,
            extensions: editorExtensions,
          },
          b: {
            doc: codeVersion2,
            extensions: editorExtensions,
          },
          parent: editorRef.current,
        })
      );
    }
  }, [mergeView, codeVersion1, codeVersion2, editorExtensions]);

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

export default CompareCodeEditor;
