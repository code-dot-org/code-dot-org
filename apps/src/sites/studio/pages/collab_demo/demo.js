import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {javascript} from '@codemirror/lang-javascript';
import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';

// The heavy lifting is done by this CodeMirror extension:
import {collaborativeEditorExtension} from '@cdo/apps/lab2/views/components/editor/collaborativeEditorExtension';

// The rest of this is just to demo `collaborativeEditorExtension` in action
const INITIAL_DOC = `

function boo() {
  console.log('boo');
}


`;

function collaborativeEditorDemo(domSelector) {
  const documentID = window.documentID; // we inject this in demo.html.haml for the demo

  console.log(`collaborativeEditor(documentID: ${documentID})`);

  const startState = EditorState.create({
    doc: INITIAL_DOC,
    extensions: [
      ...editorConfig,
      javascript(),

      // collaborativeEditorExtension DOES THE REAL WORK and is better than demo-ware
      // it can be added to any CodeMirror editor in the extensions list
      collaborativeEditorExtension(
        documentID // this could be the documentID, projectID or something like that
      ),
    ],
  });

  const view = new EditorView({
    state: startState,
    parent: document.querySelector(domSelector),
  });

  console.log('collaborativeEditor(): success');

  return view;
}

document.addEventListener('DOMContentLoaded', _ => {
  collaborativeEditorDemo('#editor1');

  // Button to create more editors
  document
    .querySelector('button#create-another-editor')
    .addEventListener('click', _ => {
      const newEditor = document.createElement('div');
      window.editorNum++;
      newEditor.textContent = `Editor ${window.editorNum}:`;
      newEditor.id = `editor${window.editorNum}`;
      document.querySelector('#editors').appendChild(newEditor);
      collaborativeEditorDemo(`#${newEditor.id}`);
    });
});
