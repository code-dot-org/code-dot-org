// Start, then ask until it is done.
//
// A completion is queued rather than answered, so the interesting behaviour is
// the loop: how long it waits, how it backs off, and what it does when the
// server never finishes. None of that is reachable through the api layer, which
// is why the loop lives here.

import {describe, expect, it, vi} from 'vitest';

import {AiRequestExecutionStatus} from '@code-dot-org/core/api';

import {Role, type PendingMessage} from '../../../model/messages';
import {AiInteractionStatus} from '../../../model/status';
import type {TutorRequest} from '../../types';
import {DashboardTransport} from '../DashboardTransport';

const request = (over: Partial<TutorRequest> = {}): TutorRequest => ({
  message: {
    role: Role.USER,
    status: AiInteractionStatus.UNKNOWN,
    chatMessageText: 'why?',
    timestamp: 0,
    updateId: 'a',
  } satisfies PendingMessage,
  history: [],
  session: {clientType: 'ai-tutor', levelId: 7, channelId: 'abc'},
  ...over,
});

/**
 * An api that reports `polls` in order, then repeats the last.
 *
 * A clock that advances by the interval each time it is read, so a test can
 * say "the server never finishes" without waiting for a real timeout.
 */
const fakeApi = (polls: Array<{executionStatus: number; response: string}>) => {
  let at = 0;
  return {
    startChatCompletion: vi.fn().mockResolvedValue({
      requestId: 42,
      pollingIntervalMs: 1000,
      backoffRate: 2,
    }),
    getChatRequest: vi.fn().mockImplementation(() => {
      const answer = polls[Math.min(at, polls.length - 1)];
      at++;
      return Promise.resolve(answer);
    }),
  };
};

const done = {
  executionStatus: AiRequestExecutionStatus.SUCCESS,
  response: 'because',
};
const running = {
  executionStatus: AiRequestExecutionStatus.RUNNING,
  response: '',
};

/** A clock that moves only when the transport sleeps. */
const clock = () => {
  let at = 0;
  return {
    now: () => at,
    sleep: (ms: number) => {
      at += ms;
      return Promise.resolve();
    },
  };
};

describe('starting', () => {
  it('sends the session facts the host supplied, not any it read itself', async () => {
    const api = fakeApi([done]);
    await new DashboardTransport({api, ...clock()}).complete(request());

    expect(api.startChatCompletion.mock.calls[0][0].aichatContext).toEqual({
      clientType: 'ai-tutor',
      currentLevelId: 7,
      scriptId: undefined,
      channelId: 'abc',
      lessonId: undefined,
    });
  });

  it('calls itself the tutor when the host did not say', async () => {
    const api = fakeApi([done]);
    await new DashboardTransport({api, ...clock()}).complete(
      request({session: {}}),
    );

    expect(
      api.startChatCompletion.mock.calls[0][0].aichatContext.clientType,
    ).toBe('ai-tutor');
  });
});

describe('polling', () => {
  it('waits before the first ask, because the work has only just been queued', async () => {
    const api = fakeApi([done]);
    const sleeps: number[] = [];
    const time = clock();
    await new DashboardTransport({
      api,
      now: time.now,
      sleep: ms => {
        sleeps.push(ms);
        return time.sleep(ms);
      },
    }).complete(request());

    expect(sleeps[0]).toBe(1000);
    expect(api.getChatRequest).toHaveBeenCalledTimes(1);
  });

  it('backs off by the rate the server asked for', async () => {
    const api = fakeApi([running, running, done]);
    const sleeps: number[] = [];
    const time = clock();
    await new DashboardTransport({
      api,
      now: time.now,
      sleep: ms => {
        sleeps.push(ms);
        return time.sleep(ms);
      },
    }).complete(request());

    expect(sleeps).toEqual([1000, 2000, 4000]);
  });

  it('never asks more than once a second, however eager the server is', async () => {
    const api = fakeApi([done]);
    api.startChatCompletion.mockResolvedValue({
      requestId: 1,
      pollingIntervalMs: 10,
      backoffRate: 1,
    });
    const sleeps: number[] = [];
    const time = clock();
    await new DashboardTransport({
      api,
      now: time.now,
      sleep: ms => {
        sleeps.push(ms);
        return time.sleep(ms);
      },
    }).complete(request());

    expect(sleeps[0]).toBe(1000);
  });

  it('gives up, and says so, when the server never finishes', async () => {
    // Distinct from the server SAYING it timed out, which arrives as a status
    // and renders as a failed turn. This one is the client giving up.
    const api = fakeApi([running]);

    await expect(
      new DashboardTransport({api, ...clock()}).complete(request()),
    ).rejects.toThrow(/timed out/);
  });

  it('stops when the turn is abandoned', async () => {
    const controller = new AbortController();
    const api = fakeApi([running, done]);
    const time = clock();
    const transport = new DashboardTransport({
      api,
      now: time.now,
      sleep: ms => {
        controller.abort();
        return time.sleep(ms);
      },
    });

    await expect(
      transport.complete(request(), controller.signal),
    ).rejects.toBeDefined();
    expect(api.getChatRequest).not.toHaveBeenCalled();
  });
});

describe('the answer', () => {
  it('puts the server request id on every message', async () => {
    const api = fakeApi([done]);
    const {messages} = await new DashboardTransport({
      api,
      ...clock(),
    }).complete(request());

    expect(messages.map(m => m.requestId)).toEqual([42, 42]);
  });

  it('parses a schema-constrained answer once, here', async () => {
    const api = fakeApi([
      {
        executionStatus: AiRequestExecutionStatus.SUCCESS,
        response: '{"answer":{"answerType":"hint"}}',
      },
    ]);

    const reply = await new DashboardTransport({api, ...clock()}).complete(
      request({responseSchema: {type: 'object'}}),
    );

    expect(reply.structuredOutput).toEqual({answer: {answerType: 'hint'}});
  });

  it('keeps a plain answer when the model ignored its schema', async () => {
    // Better an answer the student can read than a turn that vanishes.
    const api = fakeApi([
      {executionStatus: AiRequestExecutionStatus.SUCCESS, response: 'not json'},
    ]);

    const reply = await new DashboardTransport({api, ...clock()}).complete(
      request({responseSchema: {type: 'object'}}),
    );

    expect(reply.structuredOutput).toBeUndefined();
    expect(reply.messages[1].chatMessageText).toBe('not json');
  });

  it('does not try to parse an answer nobody asked a schema for', async () => {
    const api = fakeApi([
      {executionStatus: AiRequestExecutionStatus.SUCCESS, response: '{"a":1}'},
    ]);

    const reply = await new DashboardTransport({api, ...clock()}).complete(
      request(),
    );

    expect(reply.structuredOutput).toBeUndefined();
  });
});
