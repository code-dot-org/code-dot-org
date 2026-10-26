// The conversation, as state.
//
// The rule under test is that the list is append-only EXCEPT through
// `updateId`: a pending message is shown the moment it is sent, and the reply
// replaces it where it stands. Get that wrong and the student's own message
// jumps down the list when the answer lands, having already been read.

import {describe, expect, it} from 'vitest';

import {
  Role,
  type CompletedMessage,
  type PendingMessage,
} from '../../model/messages';
import {AiInteractionStatus} from '../../model/status';
import slice, {
  conversationCleared,
  messageSent,
  turnCompleted,
  turnFailed,
} from '../slice';

const reduce = slice.reducer;

const pending = (updateId: string, text = 'hello'): PendingMessage => ({
  role: Role.USER,
  status: AiInteractionStatus.UNKNOWN,
  chatMessageText: text,
  timestamp: 1,
  updateId,
});

const completed = (over: Partial<CompletedMessage> = {}): CompletedMessage => ({
  role: Role.ASSISTANT,
  status: AiInteractionStatus.OK,
  chatMessageText: 'answer',
  timestamp: 2,
  requestId: 1,
  ...over,
});

describe('messageSent', () => {
  it('shows the message immediately and marks the turn in flight', () => {
    const state = reduce(undefined, messageSent(pending('a')));

    expect(state.messages).toHaveLength(1);
    expect(state.awaiting).toBe('a');
  });
});

describe('turnCompleted', () => {
  it('replaces the pending message in place rather than appending after it', () => {
    // Otherwise the student's own message moves down the list at the moment the
    // answer arrives, having already been read where it was.
    let state = reduce(undefined, messageSent(pending('a')));
    state = reduce(
      state,
      turnCompleted([
        completed({role: Role.USER, updateId: 'a', chatMessageText: 'hello'}),
        completed(),
      ]),
    );

    expect(state.messages.map(m => m.role)).toEqual([
      Role.USER,
      Role.ASSISTANT,
    ]);
    expect(state.messages[0].status).toBe(AiInteractionStatus.OK);
    expect(state.awaiting).toBeUndefined();
  });

  it('appends nothing extra when the reply is the user turn alone', () => {
    // The shape a rejected question produces: the model was never called, so
    // there is no assistant message to place.
    let state = reduce(undefined, messageSent(pending('a')));
    state = reduce(
      state,
      turnCompleted([
        completed({
          role: Role.USER,
          updateId: 'a',
          status: AiInteractionStatus.PROFANITY_VIOLATION,
        }),
      ]),
    );

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].status).toBe(
      AiInteractionStatus.PROFANITY_VIOLATION,
    );
  });

  it('appends a message that matches nothing pending', () => {
    const state = reduce(undefined, turnCompleted([completed()]));

    expect(state.messages).toHaveLength(1);
  });
});

describe('turnFailed', () => {
  it('settles the question as an error and adds one to explain it', () => {
    // Both, as in the legacy `handleChatCompletionError`. The question settles
    // so it stops spinning and stays out of the next turn's history; the
    // explanation is APPENDED rather than written over the student's own words,
    // because they did nothing wrong.
    let state = reduce(undefined, messageSent(pending('a')));
    state = reduce(state, turnFailed({updateId: 'a'}));

    expect(state.messages).toHaveLength(2);
    expect(state.messages[0]).toMatchObject({
      role: Role.USER,
      chatMessageText: 'hello',
      status: AiInteractionStatus.ERROR,
    });
    expect(state.messages[1]).toMatchObject({
      role: Role.ASSISTANT,
      status: AiInteractionStatus.ERROR,
    });
    expect(state.awaiting).toBeUndefined();
  });

  it('does nothing to a message that is no longer there', () => {
    const state = reduce(undefined, turnFailed({updateId: 'gone'}));

    expect(state.messages).toEqual([]);
  });
});

describe('conversationCleared', () => {
  it('drops the transcript and any turn in flight', () => {
    let state = reduce(undefined, messageSent(pending('a')));
    state = reduce(state, conversationCleared());

    expect(state).toEqual({messages: [], awaiting: undefined});
  });
});
