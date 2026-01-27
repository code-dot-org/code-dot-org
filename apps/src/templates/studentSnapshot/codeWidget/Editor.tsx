import {Compartment, EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';
import {
  darkMode as darkModeTheme,
  lightMode as lightModeTheme,
} from '@cdo/apps/lab2/views/components/editor/editorThemes';

import styles from './codeWidget.module.scss';

interface EditorProps {
  code: string;
  theme: 'Light' | 'Dark';
}

const Editor: React.FC<EditorProps> = ({code, theme}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  // Compartment to control the theme
  const themeCompartment = useMemo(() => {
    return new Compartment();
  }, []);

  useEffect(() => {
    if (editorRef.current === null || editorView !== null) {
      return;
    }

    const editorExtensions = [
      ...editorConfig,
      // Make the editor read-only
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      // Add theme
      themeCompartment.of(theme === 'Dark' ? darkModeTheme : lightModeTheme),
    ];

    setEditorView(
      new EditorView({
        state: EditorState.create({
          doc: code,
          extensions: editorExtensions,
        }),
        parent: editorRef.current,
      })
    );
  }, [editorRef, code, editorView, theme, themeCompartment]);

  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          themeCompartment.reconfigure(
            theme === 'Dark' ? darkModeTheme : lightModeTheme
          ),
        ],
      });
    }
  }, [theme, editorView, themeCompartment]);

  useEffect(() => {
    if (editorView && editorView.state.doc.toString() !== code) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: code,
        },
      });
    }
  }, [code, editorView]);

  return (
    <div
      ref={editorRef}
      className={classNames('codemirror-container', styles.codeEditorContainer)}
    />
  );
};

export default Editor;
