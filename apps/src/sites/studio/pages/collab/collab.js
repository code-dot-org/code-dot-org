import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {javascript} from '@codemirror/lang-javascript';
import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';

import {collab, receiveUpdates, sendableUpdates} from '@codemirror/collab';
import {createConsumer} from '@rails/actioncable';

class ActionCableConnection {
  constructor(documentId, onReceived) {
    this.documentId = documentId;
    this.onReceived = onReceived;
    this.setupChannel();
  }

  setupChannel() {
    const consumer = createConsumer(); // Ensure you've correctly configured your Action Cable consumer

    this.channel = consumer.subscriptions.create(
      {channel: 'DocumentsChannel', document_id: this.documentId},
      {
        received: this.onReceived,
      }
    );
  }

  send(data) {
    this.channel.send(data);
  }
}

const INITIAL_DOC = `
function boo() {
  console.log('boo');
}
`;

function setupEditor(domSelector, documentId) {
  console.log(`Initializing collaborative editor with collabId: ${documentId}`);

  const connection = new ActionCableConnection(documentId, data => {
    if (data.updates) {
      const updates = data.updates.map(u => Update.fromJSON(u));
      view.dispatch(receiveUpdates(view.state, updates, data.clientID));
    }
  });

  const startState = EditorState.create({
    doc: INITIAL_DOC,
    extensions: [
      ...editorConfig,
      javascript(),
      //collab({clientID: Math.random().toString(36).substring(2)}),
    ],
  });

  const view = new EditorView({
    state: startState,
    parent: document.querySelector(domSelector),
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction);
      view.updateState(newState);

      let updates = sendableUpdates(newState);
      if (updates.length) {
        connection.send({
          document_id: documentId,
          updates: updates.map(u => u.toJSON()),
          clientID: newState.facet(collab).clientID,
        });
      }
    },
  });

  console.log('Done with setupEditor(): success');

  return view;
}

document.addEventListener('DOMContentLoaded', event => {
  setupEditor("#editor1", window.collabId);
});
