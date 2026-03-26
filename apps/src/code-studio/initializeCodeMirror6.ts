import {html} from '@codemirror/lang-html';
import {esLint, javascript} from '@codemirror/lang-javascript';
import {json, jsonParseLinter} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';
import {xml} from '@codemirror/lang-xml';
import {
  Diagnostic,
  forEachDiagnostic,
  lintGutter,
  linter,
} from '@codemirror/lint';
import {
  EditorState,
  Extension,
  StateEffect,
  StateField,
} from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewUpdate,
  lineNumbers,
} from '@codemirror/view';
import js from '@eslint/js';
import * as eslint from 'eslint-linter-browserify';
import globals from 'globals';
import React from 'react';

import {editorConfigWithoutLineNumbers} from '@cdo/apps/codemirror/editorConfig';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import MainInstructionsPreview from '../lab2/views/components/Instructions/MainInstructionsPreview';
import SafeMarkdown from '../templates/SafeMarkdown';
import './vendor/codemirror.inline-attach';

declare global {
  interface Window {
    inlineAttach?: {
      attachToCodeMirror: (
        editor: CodeMirrorLegacyAdapter,
        options: Record<string, unknown>
      ) => void;
    };
  }
}

// CodeMirror5-compatible adapter used to migrate existing usages of initializeCodeMirror (which uses CM5).
interface CodeMirrorLegacyAdapter {
  getValue: () => string;
  setValue: (value: string) => void;
  getWrapperElement: () => HTMLElement;
  getCursor: () => number;
  setCursor: (position: number) => void;
  setErrorLineIndexes: (lineIndexes: number[]) => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
}

interface Options {
  callback?: (editor: CodeMirrorLegacyAdapter, update: ViewUpdate) => void;
  attachments?: boolean;
  onUpdateLinting?: (errors: Array<{message: string}>) => void;
  additionalAnnotations?: (text: string) => Diagnostic[];
  lintConfig?: {
    es5?: boolean;
    disableRecommendedJsConfig?: boolean;
  };
  lineNumberFormatter?: (line: number) => string;
  lineHighlightClassName?: string;
  themeStyles?: Record<string, Record<string, string | number>>;
  preview?: string | Element;
  game?: string;
}

type EditorMode = 'text' | 'javascript' | 'json' | 'markdown' | 'xml' | 'html';

const levelbuilderEditorTheme = EditorView.theme({
  '&': {
    border: '1px solid #eee',
    backgroundColor: 'white',
  },
});

const setErrorLineIndexesEffect = StateEffect.define<number[]>();

function createErrorLineDecorations(
  state: EditorState,
  lineIndexes: number[],
  className: string
): DecorationSet {
  const decorations = lineIndexes
    .filter(index => index >= 0 && index < state.doc.lines)
    .map(index => {
      const line = state.doc.line(index + 1);
      return Decoration.line({class: className}).range(line.from);
    });
  return Decoration.set(decorations, true);
}

const createErrorLineHighlightField = (className: string) =>
  StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },
    update(decorations, transaction) {
      const lineIndexesEffect = transaction.effects.find(e =>
        e.is(setErrorLineIndexesEffect)
      );
      if (lineIndexesEffect) {
        return createErrorLineDecorations(
          transaction.state,
          lineIndexesEffect.value,
          className
        );
      }
      if (transaction.docChanged) {
        return decorations.map(transaction.changes);
      }
      return decorations;
    },
    provide: field => EditorView.decorations.from(field),
  });

const languageExtensionMap: Partial<Record<EditorMode, Extension>> = {
  javascript: javascript(),
  json: json(),
  markdown: markdown(),
  xml: xml(),
  html: html(),
};

function getLanguageExtension(mode: EditorMode): Extension | null {
  return languageExtensionMap[mode] || null;
}

const getLintExtension = (
  mode: EditorMode,
  lintConfig?: Options['lintConfig']
): Extension | null => {
  if (mode === 'json') {
    return linter(jsonParseLinter());
  }

  if (mode === 'javascript') {
    // Our core existing use case is for block editing, which needs to enforce ES5.
    // It also doesn't want to enforce normal linting rules since the code being edited is often just a snippet that won't run on its own.
    // So, we allow those existing use cases to override "normal" linting, but still offer the normal config for future use cases that want it.
    const eslintConfig = {
      ...(lintConfig?.disableRecommendedJsConfig ? {} : js.configs.recommended),
      languageOptions: {
        globals: {
          ...(lintConfig?.disableRecommendedJsConfig ? {} : globals.browser),
        },
        ...(lintConfig?.es5 ? {ecmaVersion: 5, sourceType: 'script'} : {}),
      },
    };

    return linter(esLint(new eslint.Linter(), eslintConfig));
  }

  return null;
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

function resolvePreviewElement(
  preview: string | Element | undefined,
  node: HTMLTextAreaElement
): Element | null {
  if (preview instanceof Element) {
    return preview;
  }

  const selector = preview || (node.id ? `#${node.id}_preview` : undefined);
  return selector ? document.querySelector(selector) : null;
}

/**
 * initializeCodeMirror6 syncs a textarea on the page with a full-featured
 * CodeMirror6 editor.
 * @param {!string|!Element} target - element or id of element to replace.
 * @param {!string} mode - editor syntax mode (`text` disables language/lint extensions)
 * @param {Object} options - misc optional arguments
 * @param {function} [options.callback] - onChange callback for editor
 * @param {onUpdateLinting} [options.onUpdateLinting] - callback that receives linting errors on each update.
 * @param {function} [options.additionalAnnotations] - optional lint annotation callback; receives editor text and returns additional diagnostics to display.
 * @param {Object} [options.lintConfig] - configuration options for linting (only applicable for javascript mode).
 * @param {boolean} [options.attachments] - whether to enable attachment
 *        uploading in this editor.
 * @param {(string|Element)} [options.preview] - element or id of element to
 *        populate with a preview. If none specified, will look for an element
 *        by appending "_preview" to the id of the target element. Only supported for markdown mode.
 * @param {string} [options.game] optional game name, used to determine which preview to use.
 */
function initializeCodeMirror6(
  target: string | Element,
  mode: EditorMode,
  options: Options = {}
): CodeMirrorLegacyAdapter {
  const node = resolveTarget(target);

  const {
    callback,
    attachments,
    onUpdateLinting,
    additionalAnnotations,
    lineNumberFormatter,
    lineHighlightClassName,
    themeStyles,
    preview,
    game,
  } = options;
  const changeListeners: Array<() => void> = [];
  const dropListeners: Array<(event: DragEvent) => void> = [];
  const languageExtension = getLanguageExtension(mode);
  const lintExtensions: Extension[] = [];
  const lintExtension = getLintExtension(mode, options.lintConfig);
  if (lintExtension) {
    lintExtensions.push(lintExtension);
  }
  if (additionalAnnotations) {
    lintExtensions.push(
      linter(view => additionalAnnotations(view.state.doc.toString()))
    );
  }
  const errorLineHighlightField = lineHighlightClassName
    ? createErrorLineHighlightField(lineHighlightClassName)
    : null;

  const editorContainer = document.createElement('div');
  node.style.display = 'none';
  node.insertAdjacentElement('afterend', editorContainer);
  const previewElement =
    mode === 'markdown' ? resolvePreviewElement(preview, node) : null;

  const adapter: CodeMirrorLegacyAdapter = {
    getValue() {
      return editor.state.doc.toString();
    },
    setValue(value) {
      editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: value},
      });
    },
    getWrapperElement() {
      return editor.dom;
    },
    // inline-attach only uses getCursor/setCursor as a round-trip pair around setValue,
    // so we simply get/set the cursor position as an absolute offset within the document.
    getCursor() {
      return editor.state.selection.main.head;
    },
    setCursor(position) {
      editor.dispatch({
        selection: {anchor: position},
      });
    },
    setErrorLineIndexes(lineIndexes) {
      if (!lineHighlightClassName) {
        console.warn(
          'Please provide a lineHighlightClassName to enable error line highlighting.'
        );
        return;
      }
      editor.dispatch({
        effects: setErrorLineIndexesEffect.of(lineIndexes),
      });
    },
    on(event, listener) {
      if (event === 'change') {
        changeListeners.push(() => listener());
      } else if (event === 'drop') {
        // This is here to support inline-attach, and inline-attach doesn't use the first argument to its drop event listener, so we ignore it here as well.
        dropListeners.push((dropEvent: DragEvent) =>
          listener(undefined, dropEvent)
        );
      }
    },
  };

  const updatePreview = () => {
    if (!previewElement) {
      return;
    }

    if (game === 'Pythonlab' || game === 'Weblab2') {
      createReactRoot(
        React.createElement(MainInstructionsPreview, {
          instructionsText: adapter.getValue(),
          theme: 'Dark',
        }),
        previewElement
      );
    } else if (game === 'Aichat' || game === 'Music') {
      createReactRoot(
        React.createElement(MainInstructionsPreview, {
          instructionsText: adapter.getValue(),
          theme: 'Light',
        }),
        previewElement
      );
    } else {
      createReactRoot(
        React.createElement(SafeMarkdown, {
          markdown: adapter.getValue(),
        }),
        previewElement
      );
    }
  };

  const extensions: Extension[] = [
    ...editorConfigWithoutLineNumbers,
    lineNumbers(
      lineNumberFormatter ? {formatNumber: lineNumberFormatter} : undefined
    ),
    ...(languageExtension ? [languageExtension] : []),
    levelbuilderEditorTheme,
    ...(themeStyles ? [EditorView.theme(themeStyles)] : []),
    EditorView.lineWrapping,
    ...(errorLineHighlightField ? [errorLineHighlightField] : []),
    ...(lintExtensions.length ? [...lintExtensions, lintGutter()] : []),
    EditorView.domEventHandlers({
      drop(event) {
        dropListeners.forEach(listener => listener(event));
      },
    }),
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        node.value = update.state.doc.toString();
        changeListeners.forEach(listener => listener());
        if (callback) {
          callback(adapter, update);
        }

        updatePreview();
      }

      if (onUpdateLinting) {
        const diagnostics = getLintDiagnostics(update.state);
        onUpdateLinting(getErrorMessages(diagnostics));
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

  updatePreview();

  if (attachments && window.inlineAttach?.attachToCodeMirror) {
    const csrfToken =
      document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.content || '';

    // Default options assume markdown mode.
    const attachOptions = {
      uploadUrl: '/level_assets/upload',
      uploadFieldName: 'file',
      downloadFieldName: 'newAssetUrl',
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
      progressText: '![Uploading file...]()',
      urlText: '![]({filename})',
      errorText: 'Error uploading file; images must be no larger than 2MB',
      extraHeaders: {
        'X-CSRF-Token': csrfToken,
      },
    };

    // Adjust options for javascript mode, which doesn't use markdown syntax for attachments.
    if (mode === 'javascript') {
      attachOptions.progressText = '"Uploading file..."';
      attachOptions.urlText = '"{filename}"';
    }

    window.inlineAttach.attachToCodeMirror(adapter, attachOptions);
  }

  return adapter;
}

export default initializeCodeMirror6;
