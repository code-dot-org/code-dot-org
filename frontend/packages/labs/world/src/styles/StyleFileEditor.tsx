// A `.style` file is a theme (specs/STYLES_PLAN.md). This is the editor
// Codebridge mounts for that language through the `editorComponents` seam —
// the same seam `.rule`/`.actor` use for Blockly, `.map` for the map editor
// and `.effect` for the node graph — so a theme persists through the same file
// `onChange` as any text file.
//
// Deliberately thin, as the effect editor's join is: everything about editing
// a theme lives under `./editor`, and what is here is the join between
// Codebridge's text-file world and the editor's document world.

import {useCallback, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';

import type {ThemeDocument} from '../engine/core/theme';

import {StyleEditor} from './editor/StyleEditor';
import styles from './editor/styleEditor.module.css';
import {readThemeDocument, writeThemeDocument} from './editor/themeDocument';

export const StyleFileEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  // Read once: Codebridge keys this component by file id, so it remounts —
  // and re-reads `initialContents` — when the active file changes.
  const [parsed] = useState(() => readThemeDocument(initialContents));
  const [document, setDocument] = useState<ThemeDocument | null>(
    parsed.document,
  );

  const handleChange = useCallback(
    (next: ThemeDocument) => {
      setDocument(next);
      onChange(writeThemeDocument(next));
    },
    [onChange],
  );

  // Only used when the file did not parse, and only to keep the hook count
  // stable across the two branches below.
  const contentsRef = useRef(initialContents);

  if (!document) {
    return (
      <div className={styles.error} role="alert">
        <p className={styles.errorMessage}>{parsed.error}</p>
        {/* The raw text, so the learner can see what is actually in the file.
            Not editable here: a form is the wrong tool for repairing JSON by
            hand, and a half-working one would be worse than saying so. */}
        <pre className={styles.errorSource}>{contentsRef.current}</pre>
      </div>
    );
  }

  return (
    <StyleEditor
      document={document}
      onChange={handleChange}
      readOnly={isReadOnly}
    />
  );
};

export default StyleFileEditor;
