import {autocompletion} from '@codemirror/autocomplete';
import {Compartment, EditorState} from '@codemirror/state';
import type {Extension} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {useEffect, useMemo, useRef} from 'react';

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {labActions} from '@code-dot-org/lab/redux';

import type {CodebridgeConfig} from '../config';
import {useCodebridgeConfig} from '../contexts';
import {useFileOperations} from '../hooks/useFileOperations';
import {useAppSelector} from '../redux/store';
import {getActiveFileForSource} from '../utils/multiFileSource';

import styles from './codeEditor.module.css';
import {editorConfig} from './editorConfig';
import {darkTheme, lightTheme} from './editorThemes';

const readOnlyExtensions = (isReadOnly: boolean): Extension => [
  EditorState.readOnly.of(isReadOnly),
  EditorView.editable.of(!isReadOnly),
];

interface InnerCodeEditorProps {
  initialContents: string;
  language: string;
  onChange: (contents: string) => void;
  languageExtensions: CodebridgeConfig['languageExtensions'];
  isReadOnly: boolean;
  isDark: boolean;
}

/**
 * A single-file CodeMirror instance. Created once on mount; the outer editor
 * keys it by file id so switching files gives a fresh editor with the new file's
 * contents and language. Read-only and theme changes reconfigure live via
 * compartments; external content changes (e.g. start over) are synced in.
 */
const InnerCodeEditor = ({
  initialContents,
  language,
  onChange,
  languageExtensions,
  isReadOnly,
  isDark,
}: InnerCodeEditorProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Keep the latest onChange without recreating the editor: the update listener
  // reads through this ref, so it always calls the current `saveFile`.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const readOnlyCompartment = useMemo(() => new Compartment(), []);
  const themeCompartment = useMemo(() => new Compartment(), []);

  // Create the editor once. Contents/language are captured at mount; the outer
  // component's `key` remounts this on file switch, so they stay correct.
  useEffect(() => {
    if (!parentRef.current) {
      return;
    }

    const langExtension = languageExtensions?.[language];
    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const view = new EditorView({
      state: EditorState.create({
        doc: initialContents,
        extensions: [
          ...editorConfig,
          autocompletion(),
          updateListener,
          ...(langExtension ? [langExtension] : []),
          readOnlyCompartment.of(readOnlyExtensions(isReadOnly)),
          themeCompartment.of(isDark ? darkTheme : lightTheme),
        ],
      }),
      parent: parentRef.current,
    });
    viewRef.current = view;

    // Accessibility: CodeMirror's content is contenteditable and would be a
    // keyboard trap. Make the scroller the tab stop; Enter moves into the code,
    // Escape moves back out. Also expose the (aria-hidden) line-number gutter.
    const {scrollDOM, contentDOM} = view;
    contentDOM.setAttribute('tabindex', '-1');
    scrollDOM.setAttribute('tabindex', '0');
    contentDOM.setAttribute('aria-label', 'Code editor, editing');
    scrollDOM.setAttribute('aria-label', 'Code editor');
    view.dom.querySelector('.cm-gutters')?.removeAttribute('aria-hidden');

    const onScrollerKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        contentDOM.focus();
      }
    };
    const onContentKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        scrollDOM.focus();
      }
    };
    scrollDOM.addEventListener('keydown', onScrollerKeyDown);
    contentDOM.addEventListener('keydown', onContentKeyDown);

    return () => {
      scrollDOM.removeEventListener('keydown', onScrollerKeyDown);
      contentDOM.removeEventListener('keydown', onContentKeyDown);
      view.destroy();
      viewRef.current = null;
    };
    // Mount-once: file identity (contents/language) is fixed for this instance
    // via the outer key; live-updating props are handled by the effects below.
  }, []);

  // Reconfigure read-only state live.
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment.reconfigure(readOnlyExtensions(isReadOnly)),
    });
  }, [isReadOnly, readOnlyCompartment]);

  // Reconfigure the theme live.
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.reconfigure(isDark ? darkTheme : lightTheme),
    });
  }, [isDark, themeCompartment]);

  // Sync in external content changes (e.g. start over) without fighting typing:
  // after a keystroke, `initialContents` already equals the doc, so this no-ops.
  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== initialContents) {
      view.dispatch({
        changes: {from: 0, to: view.state.doc.length, insert: initialContents},
      });
    }
  }, [initialContents]);

  return <div ref={parentRef} className={styles.codeEditor} />;
};

/**
 * The Codebridge code editor: a CodeMirror view over the active file, replacing
 * the placeholder textarea. Reads the active file from the SourcesContext, writes
 * edits back through `saveFile`, and takes per-language syntax support from the
 * lab-supplied `config.languageExtensions`.
 */
const CodeEditor = () => {
  const {source, saveFile} = useFileOperations();
  const activeFile = getActiveFileForSource(source);
  const {languageExtensions} = useCodebridgeConfig();
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);
  // Optional so the editor renders outside a ThemeProvider (e.g. unit tests);
  // theme is undefined there, which reads as light.
  const {theme} = useTheme(true);

  if (!activeFile) {
    return <div className={styles.empty}>No file open</div>;
  }

  return (
    <InnerCodeEditor
      key={activeFile.id}
      initialContents={activeFile.contents}
      language={activeFile.language}
      onChange={contents => saveFile(activeFile.id, contents)}
      languageExtensions={languageExtensions}
      isReadOnly={isReadOnly}
      isDark={theme === 'Dark'}
    />
  );
};

export default CodeEditor;
