import {randomUUID} from 'node:crypto';

import type {
  ApplyChange,
  CurriculumChange,
  CurriculumChangeBody,
  ResolveLevel,
  WidgetDescriptor,
} from '../authoring/model.js';
import type {
  ChatMessage,
  ChatRole,
  ChatScope,
  CurriculumSnapshot,
  SessionStore,
} from '../store/SessionStore.js';

export type AgentStatus = 'started' | 'tool' | 'text' | 'done' | 'error';

export type ServerEvent =
  | {type: 'state'; version: number}
  | {type: 'widget'; widgetId: string; version: number}
  | {type: 'chat'; message: ChatMessage}
  | {
      type: 'agent-status';
      turnId: string;
      status: AgentStatus;
      detail?: string;
    };

export type ServerEventListener = (event: ServerEvent) => void;

export interface AuthoringStateOptions {
  store: SessionStore;
  applyChange: ApplyChange;
  snapshot: CurriculumSnapshot;
  changes: CurriculumChange[];
  resolveLevel?: ResolveLevel;
}

/**
 * In-memory authority for one session. Every mutation writes through the store
 * before it notifies listeners, so an SSE client never sees a version the disk
 * does not already hold.
 */
export class AuthoringState {
  private readonly store: SessionStore;
  private readonly applyChange: ApplyChange;
  private readonly resolveLevel?: ResolveLevel;
  private readonly listeners = new Set<ServerEventListener>();
  private snapshot: CurriculumSnapshot;
  private changes: CurriculumChange[];

  constructor(options: AuthoringStateOptions) {
    this.store = options.store;
    this.applyChange = options.applyChange;
    this.resolveLevel = options.resolveLevel;
    this.snapshot = options.snapshot;
    this.changes = options.changes;
  }

  get version(): number {
    return this.snapshot.version;
  }

  getSnapshot(): CurriculumSnapshot {
    return this.snapshot;
  }

  getChanges(): CurriculumChange[] {
    return this.changes;
  }

  getChatLog(): ChatMessage[] {
    return this.store.readChat();
  }

  subscribe(listener: ServerEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: ServerEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  applyCurriculumChange(
    body: CurriculumChangeBody,
    actor: 'agent' | 'author',
  ): CurriculumChange {
    const change: CurriculumChange = {
      ...body,
      seq: this.nextSeq(),
      at: new Date().toISOString(),
      actor,
    };

    const next = this.applyChange(
      {courses: this.snapshot.courses, widgets: this.snapshot.widgets},
      change,
      this.resolveLevel,
    );

    this.snapshot = {
      ...this.snapshot,
      courses: next.courses,
      widgets: next.widgets,
      version: this.snapshot.version + 1,
    };
    this.store.writeSnapshot(this.snapshot);
    this.store.appendChange(change);
    this.changes = [...this.changes, change];

    // Descriptors also live as files so the agent can read them as code.
    const descriptor = descriptorFor(change, this.snapshot.widgets);
    if (descriptor) {
      this.store.writeWidgetDescriptor(descriptor);
    }

    this.emit({type: 'state', version: this.snapshot.version});
    return change;
  }

  upsertWidgetSource(widgetId: string, html: string): void {
    this.store.writeWidgetSource(widgetId, html);
    this.notifyWidgetSourceChanged(widgetId);
  }

  /** The file changed on disk (agent Write/Edit); bump and broadcast. */
  notifyWidgetSourceChanged(widgetId: string): void {
    this.snapshot = {...this.snapshot, version: this.snapshot.version + 1};
    this.store.writeSnapshot(this.snapshot);
    this.emit({type: 'widget', widgetId, version: this.snapshot.version});
  }

  readWidgetSource(widgetId: string): string | undefined {
    return this.store.readWidgetSource(widgetId);
  }

  findWidget(widgetId: string): WidgetDescriptor | undefined {
    return this.snapshot.widgets.find(widget => widget.id === widgetId);
  }

  registerLevelProperties(map: Record<string, Record<string, unknown>>): void {
    this.snapshot = {
      ...this.snapshot,
      levelProperties: {...this.snapshot.levelProperties, ...map},
    };
    this.store.writeSnapshot(this.snapshot);
  }

  getLevelProperties(numericId: string): Record<string, unknown> | undefined {
    return this.snapshot.levelProperties[numericId];
  }

  /** Synthetic ids are assigned above the imported range; see the spec doc. */
  nextLevelNumericId(): number {
    const ids = Object.keys(this.snapshot.levelProperties)
      .map(Number)
      .filter(Number.isFinite);
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
  }

  seedCourse(
    course: CurriculumSnapshot['courses'][number],
    levelProperties: Record<string, Record<string, unknown>>,
  ): void {
    this.snapshot = {
      ...this.snapshot,
      courses: [...this.snapshot.courses, course],
      levelProperties: {...this.snapshot.levelProperties, ...levelProperties},
      version: this.snapshot.version + 1,
    };
    this.store.writeSnapshot(this.snapshot);
    this.emit({type: 'state', version: this.snapshot.version});
  }

  appendChatMessage(
    role: ChatRole,
    text: string,
    scope?: ChatScope,
  ): ChatMessage {
    const message: ChatMessage = {
      id: randomUUID(),
      at: new Date().toISOString(),
      role,
      text,
      ...(scope ? {scope} : {}),
    };
    this.store.appendChatMessage(message);
    this.emit({type: 'chat', message});
    return message;
  }

  private nextSeq(): number {
    return (
      this.changes.reduce((max, change) => Math.max(max, change.seq), 0) + 1
    );
  }
}

function descriptorFor(
  change: CurriculumChange,
  widgets: WidgetDescriptor[],
): WidgetDescriptor | undefined {
  if (change.op === 'createWidget') {
    return change.descriptor;
  }
  if (change.op === 'updateWidgetMetadata') {
    return widgets.find(widget => widget.id === change.widgetId);
  }
  return undefined;
}
