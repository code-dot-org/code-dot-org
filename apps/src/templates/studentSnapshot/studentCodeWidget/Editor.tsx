import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';
import {
  darkMode as darkModeTheme,
  lightMode as lightModeTheme,
} from '@cdo/apps/lab2/views/components/editor/editorThemes';

import styles from './studentCodeWidget.module.scss';

interface CodeDisplayProps {
  code: string;
  theme: 'Light' | 'Dark';
}

const Editor: React.FC<CodeDisplayProps> = ({code, theme}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [didInit, setDidInit] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  // Compartment to control the theme
  const themeCompartment = useMemo(() => {
    const {Compartment} = require('@codemirror/state');
    return new Compartment();
  }, []);

  useEffect(() => {
    if (editorRef.current === null || didInit) {
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
    setDidInit(true);
  }, [editorRef, code, didInit, theme, themeCompartment]);

  // When theme changes, reconfigure the editor
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

  if (code === '') {
    return (
      <div className={styles.codeDisplay}>
        <div className={styles.noCode}>No code to display</div>
      </div>
    );
  }

  return (
    <div className={styles.codeDisplay}>
      <div ref={editorRef} className={styles.codeEditorContainer} />
    </div>
  );
};

export default Editor;
