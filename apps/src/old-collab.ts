import {
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from '@codemirror/collab';
import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';
import {ChangeSet, EditorState} from '@codemirror/state';
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';

function peerExtension() {
  const worker = new Worker('./worker.js');

  function request(worker: Worker, data: object): Promise<Array<Change>> {
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port2.onmessage = event =>
        resolve(
          JSON.parse(event.data).map(
            (update: {changes: object; clientID: string}) => ({
              changes: ChangeSet.fromJSON(update.changes),
              clientID: update.clientID,
            })
          )
        );
      worker.postMessage(JSON.stringify(data), [channel.port1]); // Corrected
    });
  }

  type Change = {changes: ChangeSet; clientID: string};

  const plugin = ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        this.pull();
      }

      async pull() {
        const version = getSyncedVersion(this.view.state);
        const updates = await request(worker, {
          type: 'pullUpdates',
          version,
        });
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
    extensions: [...editorConfig, peerExtension()],
  });
  new EditorView({state, parent: document.body});
}

addPeer();
