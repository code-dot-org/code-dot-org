/* eslint-disable @typescript-eslint/no-explicit-any */
import {ChangeSet, Extension, Compartment} from '@codemirror/state';
import {EditorView, ViewPlugin, ViewUpdate} from '@codemirror/view';
import {
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
  Update,
} from '@codemirror/collab';

import {createConsumer, Subscription} from '@rails/actioncable';
import throttle from 'throttleit';

/**
 * Default maximuum frames per second for shared editors. Setting this greater
 * than 0 will throttle how frequently we transmit edits to the server. Lowering
 * this value will reduce server load, but make for choppy pair programming.
 * @const
 * @type {number}
 * To disable throttling, set MAX_FPS to 0.
 */
const DEFAULT_MAX_FPS = 0;

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

// TODO: how long should we wait for replies to timeout?
const WAITING_FOR_REPLY_TIMEOUT_MS = 5000;

class TimeoutError extends Error {
  constructor(public messageID: string) {
    super(
      `Timed out waiting for a reply to ${messageID}: exceeded ${WAITING_FOR_REPLY_TIMEOUT_MS} ms`
    );
    this.name = 'TimeoutError';
  }
}

interface WaitingForReply {
  onReplyReceived: (data?: any) => void;
  onReplyFailed: (e: Error) => void;
  when: number;
}

// Handles the low-level details of maintaining the ActionCable connection
class CollaborativeEditorChannel {
  channel!: Subscription;
  waitingForReplies: Record<string, WaitingForReply> = {};
  nextMessageID = 0;

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
          const {action, data, messageID, clientID} = rawMsg;
          this.log('receive', action, data, rawMsg);
          this.onReceive(action, data);
          this.checkIfWaitingForReply(messageID, clientID, data);
        },
        connected: (): void => {
          console.log('Connected to collab channel');
          this.onConnect();
        },
        disconnected: (): void => {
          // TODO: should we fail all waitingForReplies with a DisconnectError?
          console.log('Disconnected from collab channel');
          this.onDisconnect();
        },
      }
    );
  }

  log(verb: 'send' | 'receive', action: Action, data: any, rawMsg?: any) {
    if (data?.updates?.version) {
      console.log(`${verb}(${action}, ${data.updates.version})`, data, rawMsg);
    } else {
      console.log(`${verb}(${action})`, data, rawMsg);
    }
  }

  checkIfWaitingForReply(messageID: string, clientID: string, data: any) {
    const waitingForReply = this.waitingForReplies[messageID];
    if (waitingForReply && clientID === this.clientID) {
      waitingForReply.onReplyReceived(data);
      delete this.waitingForReplies[messageID];
    }
    this.failTimedOutReplies();
  }

  failTimedOutReplies() {
    const now = Date.now();
    for (const messageID in this.waitingForReplies) {
      const waitingForReply = this.waitingForReplies[messageID];
      if (now - waitingForReply.when > WAITING_FOR_REPLY_TIMEOUT_MS) {
        waitingForReply.onReplyFailed(new TimeoutError(messageID));
        delete this.waitingForReplies[messageID];
      }
    }
  }

  waitForReply(messageID: string): Promise<any> {
    let onReplyReceived = (data: any) => {};
    let onReplyFailed = (e: Error) => {};
    const reply = new Promise((resolve, reject) => {
      onReplyReceived = resolve;
      onReplyFailed = reject;
    });
    this.waitingForReplies[messageID] = {
      onReplyReceived,
      onReplyFailed,
      when: Date.now(),
    };
    return reply;
  }

  async send(action: Action, data?: any, waitForReply = true) {
    this.log('send', action, data);
    const messageID = String(this.nextMessageID++);
    this.channel.perform(action, {data, clientID: this.clientID, messageID});
    if (waitForReply) return this.waitForReply(messageID);
  }

  unsubscribe() {
    this.channel.unsubscribe();
  }
}

/**
 * Creates a CodeMirror extension for collaborative editing, leveraging the CollaborativeEditorChannel
 * via ActionCable for real-time updates and data persistence in Redis. This extension enables
 * collaborative interactions within any CodeMirror editor setup.
 *
 * @param {string} documentID - collaborative editors with the same documentID will be working on the same document, sharing updates with each other
 * @param {Object} options -
 * @param {number} [options.maxFPS] - optional, max frames per second for shared editor updates (reduces server load), or set to 0 to disable throttling (default, smoothest sharing).
 * @param {string} [options.prefixClientID] - optional username or other string you associate with the user, useful for debugging, will be suffixed with a random ID to ensure uniqueness between all instances

*
 * @example
 * const state = EditorState.create({
 *   extensions: [
 *     collaborativeEditorExtension(documentID, { clientID, maxFPS }),
 *   ],
 * });
 */
export function collaborativeEditorExtension(
  documentID: string,
  {
    prefixClientID = undefined,
    maxFPS = DEFAULT_MAX_FPS,
  }: {prefixClientID?: string; maxFPS?: number} = {}
): Extension[] {
  const suffix = Math.random().toString(36).substring(6);
  const clientID = prefixClientID ? `${prefixClientID}-${suffix}` : suffix;
  class CollaborativeEditorChannelPlugin {
    private pushInProgress = false;
    private done = false;
    private connected = false;
    private channel: CollaborativeEditorChannel;
    private currentVersion: number;

    // Throttle how many updates/s we send to the server
    private throttledPush: () => void;

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

        // If maxFPS > 0, throttle the push() method to reduce server load
        this.throttledPush = maxFPS
          ? throttle(this.push.bind(this), 1000.0 / maxFPS)
          : this.push;
      } catch (e) {
        // ViewPlugin.fromClass silently consumes errors, so we log them here
        console.error('Error creating CollaborativeEditorChannel', e);
        throw e;
      }
    }

    sendPullUpdates() {
      return this.channel.send(Action.PULL_UPDATES, {
        version: this.currentVersion,
      });
    }

    sendPushUpdates(updates: Updates) {
      const updatesJSON = updates.toJSON();
      return this.channel.send(Action.PUSH_UPDATES, updatesJSON);
    }

    sendGetDoc() {
      return this.channel.send(Action.GET_DOC);
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
        // nothing to do: results received directly by sendPullUpdates() caller
      } else if (action === Action.GET_DOC) {
        // nothing to do: results received directly by sendGetDoc() caller
      } else {
        console.error(`receive(${action}): unknown action`, data);
      }
    }

    createCollabExtension(startVersion: number) {
      console.log(
        'Creating the @codemirror/collab extension at version: ',
        startVersion
      );
      return collab({clientID, startVersion});
    }

    setDoc(doc: string | null, docVersion: number = 0) {
      if (doc === null && docVersion !== 0) {
        throw new Error(
          `setDoc(): what do we do? doc is null but docVersion is ${docVersion}`
        );
      }

      this.view.dispatch({
        // Replace the editor contents if we loaded a new doc:
        changes:
          doc === null
            ? undefined
            : {from: 0, to: this.view.state.doc.length, insert: doc},
        // Replace the @codemirror/collab extension with a new instance that
        // starts at the version of the doc we just loaded:
        effects: collabCompartment.reconfigure([
          this.createCollabExtension(docVersion),
        ]),
      });
    }

    async onConnect() {
      this.connected = true;

      const {doc, version} = await this.sendGetDoc();
      console.log('getDoc =>', version, String(doc));
      this.setDoc(doc, version);

      const data: any = await this.sendPullUpdates();
      console.log('done waiting for sendPullUpdates', data);
      this.receiveUpdates(Updates.fromJSON(data));
    }

    onDisconnect() {
      this.connected = false;
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        // Call this.push() to transmit doc changes, but throttle the updates/s
        // to reduce server load and thereby cost.
        this.throttledPush();
      }
    }

    async push() {
      if (!this.connected || this.pushInProgress) return;
      const updates = sendableUpdates(this.view.state);
      if (!updates.length) return;

      this.pushInProgress = true;
      const version = getSyncedVersion(this.view.state);

      try {
        await this.sendPushUpdates(new Updates(version, updates));
      } catch (e) {
        console.error("Couldn't sendPushUpdates(): ", e, version, updates);
      }

      console.log('done waiting for sendPushUpdates', version);
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

  // Before we can initialize the collab() extension, we need to have run the
  // async sendGetDoc() and gotten its as initialDoc and initialVersion. Since
  // this function runs sync, we can't do that inline here. The solution is to
  // setup a CodeMirror Compartment:
  // https://codemirror.net/examples/config/#private-compartments
  const collabCompartment = new Compartment();

  return [
    ViewPlugin.fromClass(CollaborativeEditorChannelPlugin),
    collabCompartment.of([]),
  ];
}
