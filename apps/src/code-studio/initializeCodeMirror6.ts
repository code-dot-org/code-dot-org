import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';
import {EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';
import React from 'react';

import {editorConfig} from '@cdo/apps/codemirror/editorConfig';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import MainInstructionsPreview from '../lab2/views/components/Instructions/MainInstructionsPreview';
import SafeMarkdown from '../templates/SafeMarkdown';

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
  preview?: string | Element;
  game?: string;
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

function resolveTarget(target: string | Element): HTMLTextAreaElement {
  const node =
    typeof target === 'string' ? document.getElementById(target) : target;
  if (!(node instanceof HTMLTextAreaElement)) {
    throw new Error('initializeCodeMirror6 target must resolve to a textarea');
  }
  return node;
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
 * initializeCodeMirror6 replaces a textarea on the page with a full-featured
 * CodeMirror6 editor.
 * @param {!string|!Element} target - element or id of element to replace.
 * @param {!string} mode - editor syntax mode
 * @param {Object} options - misc optional arguments
 * @param {function} [options.callback] - onChange callback for editor
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
  const {callback, preview, game} = options;
  const changeListeners: Array<() => void> = [];
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
    on(event, listener) {
      if (event === 'change') {
        changeListeners.push(listener);
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
    ...editorConfig,
    getLanguageExtension(mode),
    levelbuilderEditorTheme,
    EditorView.lineWrapping,
    EditorView.updateListener.of(update => {
      if (!update.docChanged) {
        return;
      }
      node.value = update.state.doc.toString();
      changeListeners.forEach(listener => listener());
      if (callback) {
        callback(adapter, update);
      }
      updatePreview();
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

  return adapter;
}

export default initializeCodeMirror6;
