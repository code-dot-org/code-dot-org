import {esLint, javascript} from '@codemirror/lang-javascript';
import {json, jsonParseLinter} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';
import {
  Diagnostic,
  forEachDiagnostic,
  lintGutter,
  linter,
} from '@codemirror/lint';
import {EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import js from '@eslint/js';
import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';

import {editorConfig} from '@cdo/apps/codemirror/editorConfig';

const levelbuilderEditorTheme = EditorView.theme({
  '&': {
    border: '1px solid #eee',
  },
});

// CodeMirror5-compatible adapter used to migrate existing usages of initializeCodeMirror (which uses CM5).
interface CodeMirrorLegacyAdapter {
  getValue: () => string;
  setValue: (value: string) => void;
  on: (event: string, listener: () => void) => void;
}

interface Options {
  callback?: (editor: CodeMirrorLegacyAdapter, update: ViewUpdate) => void;
  // Kept for CodeMirror 5 callback compatibility; current callers only use errors.
  onUpdateLinting?: (
    _editor: CodeMirrorLegacyAdapter,
    errors: Array<{message: string}>
  ) => void;
}

type EditorMode = 'javascript' | 'json' | 'markdown';

const languageExtensionMap: Record<EditorMode, Extension> = {
  javascript: javascript(),
  json: json(),
  markdown: markdown(),
};

function getLanguageExtension(mode: EditorMode): Extension {
  return languageExtensionMap[mode];
}

const lintExtensionMap: Partial<Record<EditorMode, Extension>> = {
  javascript: linter(
    esLint(new eslint.Linter(), {
      ...js.configs.recommended,
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
    })
  ),
  json: linter(jsonParseLinter()),
};

const resolveTarget = (target: string | Element): HTMLTextAreaElement => {
  const node =
    typeof target === 'string' ? document.getElementById(target) : target;
  if (!(node instanceof HTMLTextAreaElement)) {
    throw new Error('initializeCodeMirror6 target must resolve to a textarea');
  }
  return node;
};

function getLintDiagnostics(state: EditorState): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  forEachDiagnostic(state, diagnostic => {
    diagnostics.push(diagnostic);
  });
  return diagnostics;
}

function getErrorMessages(diagnostics: Diagnostic[]): Array<{message: string}> {
  return diagnostics
    .filter(
      diagnostic => !diagnostic.severity || diagnostic.severity === 'error'
    )
    .map(diagnostic => ({message: diagnostic.message}));
}

function initializeCodeMirror6(
  target: string | Element,
  mode: EditorMode,
  options: Options = {}
): CodeMirrorLegacyAdapter {
  const node = resolveTarget(target);
  const {callback, onUpdateLinting} = options;
  const changeListeners: Array<() => void> = [];
  const lintExtension = lintExtensionMap[mode];
  const editorContainer = document.createElement('div');
  node.style.display = 'none';
  node.insertAdjacentElement('afterend', editorContainer);

  const adapter: CodeMirrorLegacyAdapter = {
    getValue() {
      return editor.state.doc.toString();
    },
    setValue(value) {
      editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: value},
      });
    },
    on(event, listener) {
      if (event === 'change') {
        changeListeners.push(listener);
      }
    },
  };

  const extensions: Extension[] = [
    ...editorConfig,
    getLanguageExtension(mode),
    levelbuilderEditorTheme,
    EditorView.lineWrapping,
    ...(onUpdateLinting && lintExtension ? [lintExtension, lintGutter()] : []),
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        node.value = update.state.doc.toString();
        changeListeners.forEach(listener => listener());
        if (callback) {
          callback(adapter, update);
        }
      }
      if (onUpdateLinting) {
        const diagnostics = getLintDiagnostics(update.state);
        onUpdateLinting(adapter, getErrorMessages(diagnostics));
      }
    }),
  ];

  const editor = new EditorView({
    state: EditorState.create({
      doc: node.value || '',
      extensions,
    }),
    parent: editorContainer,
  });

  return adapter;
}

export default initializeCodeMirror6;
