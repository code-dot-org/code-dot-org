/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Update,
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from '@codemirror/collab';
import {ChangeSet, Text} from '@codemirror/state';
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';
//(document.querySelector('#addpeer') as HTMLButtonElement).onclick = addPeer;
let connectionIdCounter = 0;

function pause(time: number) {
  return new Promise<void>(resolve => setTimeout(resolve, time));
}

function currentLatency() {
  //const base = +(document.querySelector('#latency') as HTMLInputElement).value;
  return 100 * (1 + (Math.random() - 0.5));
}

export class Connection {
  private disconnected: null | {wait: Promise<void>; resolve: () => void} =
    null;
  public id: number;

  constructor(
    private worker: Worker,
    private getLatency: () => number = currentLatency
  ) {
    this.id = connectionIdCounter++;
  }

  private _request(value: any): Promise<any> {
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port2.onmessage = event => resolve(JSON.parse(event.data));
      this.worker.postMessage(JSON.stringify(value), [channel.port1]);
    });
  }

  async request(value: any) {
    const latency = this.getLatency();
    if (this.disconnected) await this.disconnected.wait;
    await pause(latency);
    const result = await this._request(value);
    if (this.disconnected) await this.disconnected.wait;
    await pause(latency);
    return result;
  }

  setConnected(value: boolean) {
    if (value && this.disconnected) {
      this.disconnected.resolve();
      this.disconnected = null;
    } else if (!value && !this.disconnected) {
      const resolve = () => {
        console.log('resolved!');
      };
      const wait = new Promise<void>(resolve);
      this.disconnected = {wait, resolve};
    }
  }
}

//!wrappers

function pushUpdates(
  connection: Connection,
  version: number,
  fullUpdates: readonly Update[]
): Promise<boolean> {
  // Strip off transaction data
  const updates = fullUpdates.map(u => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
  }));
  return connection.request({
    type: 'pushUpdates',
    version,
    updates,
    connectionId: connection.id,
  });
}

function pullUpdates(
  connection: Connection,
  version: number
): Promise<readonly Update[]> {
  return connection
    .request({type: 'pullUpdates', version, connectionId: connection.id})
    .then(updates =>
      updates.map((u: any) => ({
        changes: ChangeSet.fromJSON(u.changes),
        clientID: u.clientID,
      }))
    );
}

export function getDocument(
  connection: Connection
): Promise<{version: number; doc: Text}> {
  return connection
    .request({type: 'getDocument', connectionId: connection.id})
    .then(data => ({
      version: data.version,
      doc: Text.of(data.doc.split('\n')),
    }));
}

//!peerExtension

export function peerExtension(startVersion: number, connection: Connection) {
  const plugin = ViewPlugin.fromClass(
    class {
      private pushing = false;
      private done = false;

      constructor(private view: EditorView) {
        this.pull();
      }

      update(update: ViewUpdate) {
        if (update.docChanged) this.push();
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        await pushUpdates(connection, version, updates);
        this.pushing = false;
        // Regardless of whether the push failed or new updates came in
        // while it was running, try again if there's updates remaining
        if (sendableUpdates(this.view.state).length)
          setTimeout(() => this.push(), 100);
      }

      async pull() {
        while (!this.done) {
          const version = getSyncedVersion(this.view.state);
          const updates = await pullUpdates(connection, version);
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );
  return [collab({startVersion}), plugin];
}

//!rest

// const worker = new Worker('./worker');

// async function addPeer() {
//   const {version, doc} = await getDocument(new Connection(worker, () => 0));
//   const connection = new Connection(worker);
//   const state = EditorState.create({
//     doc,
//     extensions: [basicSetup, peerExtension(version, connection)],
//   });
//   const editors = document.querySelector('#editors');
//   const wrap = editors?.appendChild(document.createElement('div'));
//   if (!wrap) return;
//   wrap.className = 'editor';
//   const cut = wrap.appendChild(document.createElement('div'));
//   cut.innerHTML =
//     "<label><input type=checkbox aria-description='Cut'>✂️</label>";
//   cut.className = 'cut-control';
//   cut.querySelector('input')?.addEventListener('change', e => {
//     const isCut = (e.target as HTMLInputElement).checked;
//     wrap.classList.toggle('cut', isCut);
//     connection.setConnected(!isCut);
//   });
//   new EditorView({state, parent: wrap});
// }

// addPeer();
// addPeer();
