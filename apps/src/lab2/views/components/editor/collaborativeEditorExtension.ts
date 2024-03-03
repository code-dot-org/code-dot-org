/* eslint-disable @typescript-eslint/no-explicit-any */
import {ChangeSet, Extension} from '@codemirror/state';
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';
import {
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
  Update,
} from '@codemirror/collab';

import {createConsumer, Subscription} from '@rails/actioncable';

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
      json.updates.map((update: any) => {
        // We accept JSON or stringified JSON here, because redis stores data
        // as strings, and parsing JSON on the server is quite expensive and
        // slow (~1s for 100MB). At other times, when we already have to
        // manipulate the updates on the server, its faster to return JSON.
        update = typeof update === 'string' ? JSON.parse(update) : update;

        return {
          changes: ChangeSet.fromJSON(update.changes),
          clientID: update.clientID,
        };
      })
    );
  }
}

enum Action {
  PUSH_UPDATES = 'push_updates',
  PULL_UPDATES = 'pull_updates',
  GET_DOC = 'get_doc',
}

// Handles the low-level details of maintaining the ActionCable connection
class CollaborativeEditorChannel {
  channel!: Subscription;

  constructor(
    public clientID: string,
    public documentID: string,
    public onReceive: (action: Action, data: any) => void,
    public onConnect = () => {},
    public onDisconnect = () => {}
  ) {
    this.connect();
    console.log('CollaborativeEditorChannel created', this.channel);
  }

  connect() {
    const consumer = createConsumer();
    this.channel = consumer.subscriptions.create(
      {
        channel: 'CollaborativeEditorChannel',
        document_id: this.documentID,
        client_id: this.clientID,
      },
      {
        received: (rawMsg: any): void => {
          const {action, data, ...extra} = rawMsg;
          this.log('receive', action, data, extra);

          this.onReceive(action, data);
        },
        connected: (): void => {
          console.log('Connected to collab channel');
          this.onConnect();
        },
        disconnected: (): void => {
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

  send(action: Action, data?: any) {
    this.log('send', action, data);
    this.channel.perform(action, {data, clientID: this.clientID});
  }

  unsubscribe() {
    this.channel.unsubscribe();
  }
}

// Creates a CodeMirror extension that can be used in the EditorState's list
// of extensions. Its backed by an ActionCable channel, which stores to redis.
export function collaborativeEditorExtension(
  clientID: string,
  documentID: string
): Extension[] {
  class CollaborativeEditorChannelPlugin {
    private pushInProgress = false;
    private done = false;
    private connected = false;
    private channel: CollaborativeEditorChannel;
    private currentVersion: number;

    constructor(private view: EditorView) {
      try {
        this.currentVersion = 0;
        this.channel = new CollaborativeEditorChannel(
          clientID,
          documentID,
          this.onReceive.bind(this),
          this.onConnect.bind(this),
          this.onDisconnect.bind(this)
        );
      } catch (e) {
        // ViewPlugin.fromClass silently consumes errors, so we log them here
        console.error('Error creating CollaborativeEditorChannel', e);
        throw e;
      }
    }

    sendPullUpdates() {
      this.channel.send(Action.PULL_UPDATES, {version: this.currentVersion});
    }

    sendPushUpdates(updates: Updates) {
      const updatesJSON = updates.toJSON();
      this.channel.send(Action.PUSH_UPDATES, updatesJSON);
    }

    receiveUpdates(updates: Updates) {
      console.log('dispatch updates for version', updates.version, updates);
      this.view.dispatch(receiveUpdates(this.view.state, updates.updates));
      this.currentVersion = updates.version;
    }

    onReceive(action: Action, data: any) {
      if (action === Action.PUSH_UPDATES) {
        this.receiveUpdates(Updates.fromJSON(data));
      } else if (action === Action.PULL_UPDATES) {
        this.receiveUpdates(Updates.fromJSON(data));
      } else {
        console.error(`receive(${action}): unknown action`, data);
      }
    }

    onConnect() {
      this.connected = true;
      this.sendPullUpdates();
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

  // Awkward: how do we block on waiting for the initial version from Action.GET_DOC?
  // any chance CodeMirror extension creation functions can be async?
  const startVersion = 0;

  return [
    collab({
      clientID,
      startVersion: startVersion,
    }),
    ViewPlugin.fromClass(CollaborativeEditorChannelPlugin),
  ];
}
