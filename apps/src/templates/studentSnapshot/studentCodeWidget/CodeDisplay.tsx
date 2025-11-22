import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {ProjectFile} from '@codebridge/types';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';
import {
  darkMode as darkModeTheme,
  lightMode as lightModeTheme,
} from '@cdo/apps/lab2/views/components/editor/editorThemes';

import FileTabs from './FileTabs';

import styles from './studentCodeWidget.module.scss';

interface CodeDisplayProps {
  files: ProjectFile[];
  selectedFileId: string;
  onFileSelect: (fileId: string) => void;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  files,
  selectedFileId,
  onFileSelect,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [didInit, setDidInit] = useState(false);
  const [editorView, setEditorView] = useState<EditorView | null>(null);

  // Use optional theme - defaults to undefined if not in a ThemeProvider
  const {theme} = useTheme(true);
  // Default to 'Light' if theme is not provided
  const currentTheme = theme || 'Light';

  // Get current file code
  const currentFile = files.find(f => f.id === selectedFileId);
  const code = currentFile?.contents || '';

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
      themeCompartment.of(
        currentTheme === 'Dark' ? darkModeTheme : lightModeTheme
      ),
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
  }, [editorRef, code, didInit, currentTheme, themeCompartment]);

  // When theme changes, reconfigure the editor
  useEffect(() => {
    if (editorView) {
      editorView.dispatch({
        effects: [
          themeCompartment.reconfigure(
            currentTheme === 'Dark' ? darkModeTheme : lightModeTheme
          ),
        ],
      });
    }
  }, [currentTheme, editorView, themeCompartment]);

  // When code or selectedFileId changes, update the editor content
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
  }, [code, editorView, selectedFileId]);

  if (files.length === 0) {
    return (
      <div className={styles.codeDisplay}>
        <div className={styles.noCode}>No code to display</div>
      </div>
    );
  }

  return (
    <div className={styles.codeDisplayWrapper}>
      {/* File tabs */}
      <FileTabs
        files={files}
        selectedFileId={selectedFileId}
        onFileSelect={onFileSelect}
      />

      {/* Code editor */}
      <div className={styles.codeDisplay}>
        <div ref={editorRef} className={styles.codeEditorContainer} />
      </div>
    </div>
  );
};

export default CodeDisplay;
