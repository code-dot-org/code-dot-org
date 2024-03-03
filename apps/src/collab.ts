/* eslint-disable @typescript-eslint/no-explicit-any */
import {EditorState, ChangeSet} from '@codemirror/state';
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';
import {javascript} from '@codemirror/lang-javascript';
import {editorConfig} from '@cdo/apps/lab2/views/components/editor/editorConfig';
import {
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
  Update,
} from '@codemirror/collab';

import {createConsumer, Channel} from '@rails/actioncable';

class Updates {
  constructor(readonly version: number, readonly updates: readonly Update[]) {}

  toJSON(): any {
    return {
      version: this.version,
      updates: this.updates.map(update => ({
        clientID: update.clientID,
        changes: update.changes.toJSON(),
      })),
    };
  }

  static fromJSON(json: any): Updates {
    return new Updates(
      json.version,
      json.updates.map((update: any) => ({
        changes: ChangeSet.fromJSON(update.changes),
        clientID: update.clientID,
      }))
    );
  }
}

enum Action {
  PUSH_UPDATES = 'push_updates',
}
class CollabChannel {
  channel!: Channel;

  constructor(
    public clientID: string,
    public collabID: string,
    public onReceive: (action: Action, data: any) => void,
    public onConnect = () => {},
    public onDisconnect = () => {}
  ) {
    this.connect();
    console.log('CollabChannel created', this.channel);
  }

  connect() {
    const consumer = createConsumer();
    this.channel = consumer.subscriptions.create(
      {
        channel: 'CollabChannel',
        collab_id: this.collabID,
        client_id: this.clientID,
      },
      {
        received: (rawMsg: any) => {
          const {action, data, ...extra} = rawMsg;
          this.log('receive', action, data, extra);

          this.onReceive(action, data);
        },
        connected: () => {
          console.log('Connected to collab channel');
          this.onConnect();
        },
        disconnected: () => {
          // TODO: try to reconnect with exponential backoff
          // to handle stuff like: the server is restarting
          console.log('Disconnected from collab channel');
          this.onDisconnect();
        },
      }
    );
  }

  log(verb: 'send' | 'receive', action: Action, data: any, extra?: any) {
    if (data?.updates?.version) {
      console.log(`${verb}(${action}, ${data.updates.version})`, data, extra);
    } else {
      console.log(`${verb}(${action})`, data, extra);
    }
  }

  send(action: Action, data: any) {
    this.log('send', action, data);
    this.channel.perform(action, {data, clientID: this.clientID});
  }

  unsubscribe() {
    this.channel.unsubscribe();
  }
}

const INITIAL_DOC: string = `
function boo() {
  console.log('boo');
}
`;

function collabChannel(clientID: string, collabID: string) {
  class CollabChannelPlugin {
    private pushInProgress = false;
    private done = false;
    private connected = false;
    private channel: CollabChannel;

    constructor(private view: EditorView) {
      try {
        this.channel = new CollabChannel(
          clientID,
          collabID,
          this.onReceive.bind(this),
          this.onConnect.bind(this),
          this.onDisconnect.bind(this)
        );
        // TODO: pull current version from collab channel
      } catch (e) {
        // ViewPlugin.fromClass silently consumes errors, so we log them here
        console.error('Error creating CollabChannel', e);
        throw e;
      }
    }

    sendPushUpdates(updates: Updates): void {
      const updatesJSON = updates.toJSON();
      this.channel.send(Action.PUSH_UPDATES, updatesJSON);
    }

    onReceive(action: Action, data: any) {
      if (action === Action.PUSH_UPDATES) {
        const updates = Updates.fromJSON(data);
        console.log('dispatch', updates);
        this.view.dispatch(receiveUpdates(this.view.state, updates.updates));
      } else {
        console.error(`receive(${action}): unknown action`, data);
      }
    }

    onConnect() {
      this.connected = true;
    }

    onDisconnect() {
      this.connected = false;
    }

    update(update: ViewUpdate) {
      if (update.docChanged) this.push();
    }

    async push() {
      if (!this.connected || this.pushInProgress) return;
      const updates = sendableUpdates(this.view.state);
      if (!updates.length) return;
      this.pushInProgress = true;

      const version = getSyncedVersion(this.view.state);
      this.sendPushUpdates(new Updates(version, updates));
      this.pushInProgress = false;

      // Regardless of whether the push failed or new updates came in
      // while it was running, try again if there's updates remaining
      if (sendableUpdates(this.view.state).length)
        setTimeout(() => this.push(), 100);
    }

    destroy() {
      this.channel.unsubscribe();
      this.done = true;
    }
  }

  return [collab({clientID}), ViewPlugin.fromClass(CollabChannelPlugin)];
}

export function setupEditor(
  domSelector: string,
  clientID: string,
  collabID: string
): EditorView {
  console.log(`Initialzing collaborative editor with collabId: ${collabID}`);

  const startState: EditorState = EditorState.create({
    doc: INITIAL_DOC,
    extensions: [
      ...editorConfig,
      javascript(),
      collabChannel(clientID, collabID),
    ],
  });

  const view: EditorView = new EditorView({
    state: startState,
    parent: document.querySelector(domSelector) as HTMLElement,
  });

  console.log('Done with setupEditor(): success');

  return view;
}
