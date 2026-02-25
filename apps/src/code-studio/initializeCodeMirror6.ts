import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {EditorState, Extension} from '@codemirror/state';
import {EditorView, ViewUpdate} from '@codemirror/view';

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
}

type EditorMode = 'javascript' | 'json';

const languageExtensionMap: Record<EditorMode, Extension> = {
  javascript: javascript(),
  json: json(),
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

function initializeCodeMirror6(
  target: string | Element,
  mode: EditorMode,
  options: Options = {}
): CodeMirrorLegacyAdapter {
  const node = resolveTarget(target);
  const {callback} = options;
  const changeListeners: Array<() => void> = [];
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
    EditorView.updateListener.of(update => {
      if (!update.docChanged) {
        return;
      }
      node.value = update.state.doc.toString();
      changeListeners.forEach(listener => listener());
      if (callback) {
        callback(adapter, update);
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
