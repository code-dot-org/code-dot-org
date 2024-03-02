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

// We don't use named imports because we're using the old actioncable npm, which
// fails with named imports. We'd rather using the newer @rails/actioncable npm
// but the old NPM has 3rd party TS types available (the @types/actioncable package)
import ActionCable from 'actioncable';

// TODO: remove this debug cruft
(window as any).ActionCable = ActionCable;

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
  channel: ActionCable.Channel;

  constructor(
    public clientID: string,
    public collabID: string,
    onReceive: (action: Action, data: any) => void
  ) {
    const consumer = ActionCable.createConsumer();
    this.channel = consumer.subscriptions.create(
      {
        channel: 'CollabChannel',
        collab_id: this.collabID,
        client_id: this.clientID,
      },
      {
        received: (rawMsg: any) => {
          const {action, data, ...extra} = rawMsg;
          this.log('receive', action, data);
          if (!action || Object.keys(extra).length > 0) {
            console.warn(`receive(${action}): message malformed`, rawMsg);
          }

          onReceive(action, data);
        },
        connected: () => console.log('Connected to collab channel'),
        disconnected: () => console.log('Disconnected from collab channel'),
      }
    );
    console.log('CollabChannel created', consumer, this.channel);
  }

  log(verb: 'send' | 'receive', action: Action, data: any) {
    if (data?.updates?.version) {
      console.log(`${verb}(${action}, ${data.updates.version})`, data);
    } else {
      console.log(`${verb}(${action})`, data);
    }
  }

  send(action: Action, data: any) {
    this.log('send', action, data);
    this.channel.perform(action, {data});
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
    private pushing = false;
    private done = false;
    private channel: CollabChannel;

    constructor(private view: EditorView) {
      try {
        this.channel = new CollabChannel(
          clientID,
          collabID,
          this.receive.bind(this)
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

    receive(action: Action, data: any) {
      if (action === Action.PUSH_UPDATES) {
        const updates = Updates.fromJSON(data);
        console.log('dispatch', updates);
        this.view.dispatch(receiveUpdates(this.view.state, updates.updates));
      } else {
        console.error(`received(${action}): unknown action`, data);
      }
    }

    update(update: ViewUpdate) {
      if (update.docChanged) this.push();
    }

    async push() {
      const updates = sendableUpdates(this.view.state);
      if (this.pushing || !updates.length) return;
      this.pushing = true;

      const version = getSyncedVersion(this.view.state);
      this.sendPushUpdates(new Updates(version, updates));
      this.pushing = false;

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
