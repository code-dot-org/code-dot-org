// A `.effect` file is a serialized node graph (specs/EFFECT_EDITOR.md). This is
// the editor Codebridge mounts for that language via the `editorComponents`
// seam — the same seam `.rule`/`.actor` use for Blockly and `.map` uses for the
// map editor — so a `.effect` persists through the same file `onChange` as a
// CodeMirror file.
//
// It is deliberately thin: everything about editing an effect lives under
// `./editor`, and everything about the file format under `./model`. What is
// here is the join between Codebridge's text-file world and the editor's
// document world.

import {useCallback, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';

import {EffectEditor} from './editor';
import styles from './effectFileEditor.module.css';
import {parseEffectDocument, serializeEffectDocument} from './model';
import {createEffectDocument} from './model/document';
import type {EffectDocument} from './model/types';

/**
 * Read a file's contents into a document.
 *
 * An empty file is a *new* file — Codebridge creates one with no contents — and
 * gets a fresh passthrough effect rather than an error. Anything else that will
 * not parse is reported, because silently replacing a learner's broken file
 * with a blank one would destroy the very thing they need to see.
 */
function readDocument(
  contents: string,
): {document: EffectDocument; error: null} | {document: null; error: string} {
  if (!contents.trim()) {
    return {document: createEffectDocument(), error: null};
  }
  try {
    return {document: parseEffectDocument(contents), error: null};
  } catch (error) {
    return {
      document: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const EffectFileEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  // Read once: Codebridge keys this component by file id, so it remounts (and
  // re-reads `initialContents`) when the active file changes. Re-parsing on
  // every render would also fight the editor's own undo history.
  const [parsed] = useState(() => readDocument(initialContents));

  // The editor hands back a document; the file wants text. Serializing here
  // rather than in the editor keeps the editor unaware there is a file at all.
  const handleChange = useCallback(
    (document: EffectDocument) => onChange(serializeEffectDocument(document)),
    [onChange],
  );

  // Only used when the file did not parse, and only to keep the hook count
  // stable across the two branches below.
  const contentsRef = useRef(initialContents);

  if (!parsed.document) {
    return (
      <div className={styles.error} role="alert">
        <p className={styles.errorMessage}>{parsed.error}</p>
        {/* The raw text, so the learner (or whoever is helping) can see what
            is actually in the file. Not editable here: a graph editor is the
            wrong tool for repairing JSON by hand, and offering a half-working
            one would be worse than saying so. */}
        <pre className={styles.errorSource}>{contentsRef.current}</pre>
      </div>
    );
  }

  return (
    <EffectEditor
      className={styles.editor}
      initialDocument={parsed.document}
      onChange={handleChange}
      readOnly={isReadOnly}
    />
  );
};

export default EffectFileEditor;
