import {javascript} from '@codemirror/lang-javascript';
import {json} from '@codemirror/lang-json';
import {markdown} from '@codemirror/lang-markdown';
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
}

interface Options {
  callback?: (editor: CodeMirrorLegacyAdapter, update: ViewUpdate) => void;
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

function initializeCodeMirror6(
  target: string | Element,
  mode: EditorMode,
  options: Options = {}
): CodeMirrorLegacyAdapter {
  const node = resolveTarget(target);
  const {callback} = options;
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
