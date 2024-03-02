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

class Version {
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

  static fromJSON(json: any): Version {
    return new Version(
      json.version,
      json.updates.map((update: any) => ({
        changes: ChangeSet.fromJSON(update.changes),
        clientID: update.clientID,
      }))
    );
  }
}

class CollabChannel {
  channel: ActionCable.Channel;

  constructor(public collabID: string, onReceive: (version: Version) => void) {
    const consumer = ActionCable.createConsumer();
    this.channel = consumer.subscriptions.create(
      {channel: 'CollabChannel', collab_id: this.collabID},
      {
        received: (json: any) => {
          console.log('Received change message: ', json);
          onReceive(Version.fromJSON(json));
        },
        connected: () => console.log('Connected to collab channel'),
        disconnected: () => console.log('Disconnected from collab channel'),
      }
    );
    console.log('CollabChannel created', consumer, this.channel);
  }

  send(version: Version): void {
    // Not clear on what the differences are, but we may want to do:
    // this.channel.perform('say_hello', {message: 'Hello, World!'});
    // or:
    // this.channel.send(version.toJSON());
    this.channel.perform('receive_version', {version: version.toJSON()});
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
      // TODO: pull current version from collab channel
      try {
        this.channel = new CollabChannel(collabID, newVersion =>
          view.dispatch(receiveUpdates(view.state, newVersion.updates))
        );
      } catch (e) {
        // ViewPlugin.fromClass silently consumes errors, so we log them here
        console.error('Error creating CollabChannel', e);
        throw e;
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
      this.channel.send(new Version(version, updates));

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
