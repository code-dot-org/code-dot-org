import {
  Update,
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from '@codemirror/collab';
import {basicSetup} from 'codemirror';
import {ChangeSet, EditorState} from '@codemirror/state'; 
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';

function peerExtension() {
  const worker = new Worker('./worker.js');

  function request(worker: Worker, data: object): Promise<Array<Change>> {
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port2.onmessage = event => resolve(JSON.parse(event.data));
      worker.postMessage(JSON.stringify(data), [channel.port1]); // Corrected
    });
  }

  // const rawData = await request(worker, {type: 'getDocument'});
  // const {startVersion, doc} = {
  //   version: rawData.version,
  //   doc: Text.of(rawData.doc.split('\n')),
  // };

  type Change = {changes: ChangeSet; clientID: string};

  const plugin = ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        this.pull();
      }

      async pull() {
        const version = getSyncedVersion(this.view.state);
        const rawUpdates = await request(worker, {
          type: 'pullUpdates',
          version,
        });

        const updates = rawUpdates.map(update => ({
          changes: ChangeSet.fromJSON(update.changes),
          clientID: update.clientID,
        }));
        this.view.dispatch(receiveUpdates(this.view.state, updates));
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        const version = getSyncedVersion(this.view.state);

        await request(worker, {
          type: 'pushUpdates',
          version,
          updates: updates.map(u => ({
            clientID: u.clientID,
            changes: u.changes.toJSON(),
          })),
        });
      }

      update(update: ViewUpdate) {
        if (update.docChanged) this.push();
      }
    }
  );
  return [collab(), plugin];
}

async function addPeer() {
  const state = EditorState.create({
    doc: '',
    extensions: [basicSetup, peerExtension()],
  });
  new EditorView({state, parent: document.body});
}

addPeer();
