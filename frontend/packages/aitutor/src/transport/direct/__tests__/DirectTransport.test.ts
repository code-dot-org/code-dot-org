// The browser half of the dev-key path.
//
// It talks to this page's own origin and knows nothing about any provider, so
// everything here is about the shape it sends and the shape it hands back — the
// two places a mistake would be invisible until a real key was in play.

import {describe, expect, it, vi} from 'vitest';

import {COMPLETE_ROUTE, STATUS_ROUTE} from '../../../dev/protocol';
import {
  Role,
  type CompletedMessage,
  type PendingMessage,
} from '../../../model/messages';
import {AiInteractionStatus} from '../../../model/status';
import type {TutorRequest} from '../../types';
import {DirectTransport, proxyStatus} from '../DirectTransport';

const answers = (reply: unknown, ok = true) =>
  vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(reply),
  });

const request = (over: Partial<TutorRequest> = {}): TutorRequest => ({
  message: {
    role: Role.USER,
    status: AiInteractionStatus.UNKNOWN,
    chatMessageText: 'why?',
    timestamp: 0,
    updateId: 'a',
  } satisfies PendingMessage,
  history: [],
  session: {},
  ...over,
});

const sent = (fetchImpl: ReturnType<typeof answers>) =>
  JSON.parse(fetchImpl.mock.calls[0][1].body);

describe('what it sends', () => {
  it('posts to this origin, never to a provider', async () => {
    // A key reachable from a page is a key in the bundle.
    const fetchImpl = answers({text: 'because'});
    await new DirectTransport({fetchImpl: fetchImpl as never}).complete(
      request(),
    );

    expect(fetchImpl.mock.calls[0][0]).toBe(COMPLETE_ROUTE);
  });

  it('puts the project context in the system prompt, not the turn', async () => {
    // In the turn it would be part of the conversation, repeated every time the
    // project changed, and shown to the model as though the student said it.
    const fetchImpl = answers({text: 'ok'});
    await new DirectTransport({fetchImpl: fetchImpl as never}).complete(
      request({systemPrompt: 'be brief', hiddenContext: 'the code'}),
    );

    const body = sent(fetchImpl);
    expect(body.system).toBe('be brief\n\nthe code');
    expect(body.messages).toEqual([{role: 'user', text: 'why?'}]);
  });

  it('sends no system prompt at all when there is nothing to say', async () => {
    const fetchImpl = answers({text: 'ok'});
    await new DirectTransport({fetchImpl: fetchImpl as never}).complete(
      request(),
    );

    expect(sent(fetchImpl).system).toBeUndefined();
  });

  it('sends the prior turns before the new one', async () => {
    const fetchImpl = answers({text: 'ok'});
    const history = [
      {
        role: Role.USER,
        status: AiInteractionStatus.OK,
        chatMessageText: 'first',
        timestamp: 0,
        requestId: 1,
      },
      {
        role: Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        chatMessageText: 'answer',
        timestamp: 0,
        requestId: 2,
      },
    ] satisfies CompletedMessage[];

    await new DirectTransport({fetchImpl: fetchImpl as never}).complete(
      request({history}),
    );

    expect(sent(fetchImpl).messages).toEqual([
      {role: 'user', text: 'first'},
      {role: 'assistant', text: 'answer'},
      {role: 'user', text: 'why?'},
    ]);
  });
});

describe('what it hands back', () => {
  it('echoes the question and adds the answer', async () => {
    const transport = new DirectTransport({
      fetchImpl: answers({text: 'because'}) as never,
    });

    const {messages} = await transport.complete(request());

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({role: Role.USER, updateId: 'a'});
    expect(messages[1]).toMatchObject({
      role: Role.ASSISTANT,
      chatMessageText: 'because',
      status: AiInteractionStatus.OK,
    });
  });

  it('carries a failure the proxy named, rather than throwing', async () => {
    const transport = new DirectTransport({
      fetchImpl: answers({text: '', failure: 'model_rate_limited'}) as never,
    });

    const {messages} = await transport.complete(request());

    expect(messages[1].status).toBe(AiInteractionStatus.MODEL_RATE_LIMITED);
  });

  it('throws when the ROUTE is wrong, which is a different thing', async () => {
    // The proxy answers 200 even for a failed turn, so a non-200 means the
    // route is not there — not running, or not this origin.
    const transport = new DirectTransport({
      fetchImpl: answers({}, false) as never,
    });

    await expect(transport.complete(request())).rejects.toThrow(/answered 500/);
  });

  it('hands the structured answer through already parsed', async () => {
    const transport = new DirectTransport({
      fetchImpl: answers({text: 'done', structured: {answer: {}}}) as never,
    });

    const reply = await transport.complete(request());

    expect(reply.structuredOutput).toEqual({answer: {}});
  });
});

describe('proxyStatus', () => {
  it('reports what the plugin said', async () => {
    const fetchImpl = answers({available: true, model: 'a-model'});

    await expect(proxyStatus(fetchImpl as never)).resolves.toEqual({
      available: true,
      model: 'a-model',
    });
    expect(fetchImpl.mock.calls[0][0]).toBe(STATUS_ROUTE);
  });

  it('reports unavailable rather than throwing when there is no proxy', async () => {
    // Asked before the student says anything, so a page can offer a recording
    // instead. A live transport that fails on first use looks like a broken
    // tutor; a missing key should look like a missing key.
    const fetchImpl = vi
      .fn()
      .mockRejectedValue(new Error('connection refused'));

    await expect(proxyStatus(fetchImpl as never)).resolves.toEqual({
      available: false,
      reason: 'connection refused',
    });
  });
});
