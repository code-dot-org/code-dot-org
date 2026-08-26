import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import type {
  CurriculumChange,
  CurriculumState,
  WidgetDescriptor,
} from '../../authoring/model.js';
import {AuthoringState} from '../../state/AuthoringState.js';
import {EMPTY_SNAPSHOT, SessionStore} from '../SessionStore.js';

const widget: WidgetDescriptor = {
  id: 'balance-the-data',
  toolName: 'present_balance_the_data',
  title: 'Balance the data',
  description: 'Sort samples into two buckets.',
  inputSchema: {type: 'object'},
  resourceUri: 'ui://widgets/balance-the-data.html',
  visibility: ['model', 'app'],
  network: 'none',
};

/** Stand-in reducer: the real one lives in @code-dot-org/authoring. */
function applyChange(
  state: CurriculumState,
  change: CurriculumChange,
): CurriculumState {
  if (change.op === 'createWidget') {
    return {...state, widgets: [...state.widgets, change.descriptor]};
  }
  return state;
}

let root: string;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'authoring-session-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

function freshState(): AuthoringState {
  const store = new SessionStore(root);
  return new AuthoringState({
    store,
    applyChange,
    snapshot: store.readSnapshot() ?? {...EMPTY_SNAPSHOT},
    changes: store.readChanges(),
  });
}

describe('SessionStore', () => {
  it('creates the widgets directory it will write into', () => {
    const store = new SessionStore(root);
    expect(fs.existsSync(store.widgetsDir)).toBe(true);
  });

  it('round-trips curriculum, changes, chat and widget source', () => {
    const seeded = freshState();
    seeded.applyCurriculumChange(
      {op: 'createWidget', descriptor: widget},
      'agent',
    );
    seeded.upsertWidgetSource(widget.id, '<p>hello</p>');
    seeded.appendChatMessage('author', 'add a sorting activity', {
      lessonId: 'lb:k5-ai-data-2024:what-is-data',
    });
    seeded.registerLevelProperties({'9001': {name: 'Oceans_FishVTrash_2024'}});

    const reloaded = freshState();

    expect(reloaded.getSnapshot()).toEqual(seeded.getSnapshot());
    expect(reloaded.version).toBe(2);
    expect(reloaded.findWidget(widget.id)).toEqual(widget);
    expect(reloaded.readWidgetSource(widget.id)).toBe('<p>hello</p>');
    expect(reloaded.getLevelProperties('9001')).toEqual({
      name: 'Oceans_FishVTrash_2024',
    });

    const changes = reloaded.getChanges();
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      seq: 1,
      actor: 'agent',
      op: 'createWidget',
    });

    const chat = reloaded.getChatLog();
    expect(chat).toHaveLength(1);
    expect(chat[0]).toMatchObject({
      role: 'author',
      text: 'add a sorting activity',
    });
  });

  it('continues the change sequence across a restart', () => {
    freshState().applyCurriculumChange(
      {op: 'createWidget', descriptor: widget},
      'author',
    );
    const next = freshState().applyCurriculumChange(
      {op: 'createWidget', descriptor: {...widget, id: 'second'}},
      'author',
    );
    expect(next.seq).toBe(2);
  });

  it('writes a widget descriptor as a file beside its source', () => {
    const state = freshState();
    state.applyCurriculumChange(
      {op: 'createWidget', descriptor: widget},
      'agent',
    );
    const meta = path.join(root, 'widgets', widget.id, 'meta.json');
    expect(JSON.parse(fs.readFileSync(meta, 'utf8'))).toEqual(widget);
  });

  it('assigns synthetic level ids above the imported range', () => {
    const state = freshState();
    state.registerLevelProperties({'40': {}, '7': {}});
    expect(state.nextLevelNumericId()).toBe(41);
  });
});
