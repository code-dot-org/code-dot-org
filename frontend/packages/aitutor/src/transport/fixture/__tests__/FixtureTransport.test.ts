// The transport that answers from a recording.
//
// Two things are being pinned. The first is sequence: a transcript with no
// matchers is a conversation, and reads as one. The second is that every way a
// turn can fail is reachable — which is the whole reason this exists, because
// none of those branches can be reached against a real server without
// misbehaving on purpose.

import {describe, expect, it, vi} from 'vitest';

import conversation from '../../../fixtures/conversation.json';
import failures from '../../../fixtures/failures.json';
import {Role, type PendingMessage} from '../../../model/messages';
import {AiInteractionStatus} from '../../../model/status';
import type {TutorRequest} from '../../types';
import {FixtureExhausted, FixtureTransport} from '../FixtureTransport';
import {parseTranscript, type Transcript} from '../transcript';

const ask = (text: string): TutorRequest => ({
  message: {
    role: Role.USER,
    status: AiInteractionStatus.UNKNOWN,
    chatMessageText: text,
    timestamp: 0,
    updateId: `u-${text}`,
  } satisfies PendingMessage,
  history: [],
  session: {},
});

/** No clock and no waiting: every test here is synchronous in spirit. */
const still = {now: () => 1000, sleep: () => Promise.resolve()};

const transcript = (
  turns: Transcript['turns'],
  fallback?: Transcript['fallback'],
) => parseTranscript({name: 'test', turns, fallback});

describe('sequence', () => {
  it('answers turns in order when nothing says otherwise', async () => {
    const transport = new FixtureTransport(
      transcript([{reply: {text: 'first'}}, {reply: {text: 'second'}}]),
      still,
    );

    const one = await transport.complete(ask('anything'));
    const two = await transport.complete(ask('anything at all'));

    expect(one.messages[1].chatMessageText).toBe('first');
    expect(two.messages[1].chatMessageText).toBe('second');
  });

  it('spends each turn once, so a repeated question moves on', async () => {
    const transport = new FixtureTransport(
      transcript([{reply: {text: 'first'}}, {reply: {text: 'second'}}]),
      still,
    );

    await transport.complete(ask('same'));
    const two = await transport.complete(ask('same'));

    expect(two.messages[1].chatMessageText).toBe('second');
  });

  it('starts over after a reset', async () => {
    const transport = new FixtureTransport(
      transcript([{reply: {text: 'first'}}]),
      still,
    );

    await transport.complete(ask('hello'));
    transport.reset();

    expect(
      (await transport.complete(ask('hello'))).messages[1].chatMessageText,
    ).toBe('first');
  });
});

describe('matching', () => {
  it('prefers the first unspent turn that applies, not the first that exists', async () => {
    const transport = new FixtureTransport(
      transcript([
        {when: {contains: 'loop'}, reply: {text: 'about loops'}},
        {reply: {text: 'about anything'}},
      ]),
      still,
    );

    const reply = await transport.complete(ask('how do I write a LOOP?'));

    expect(reply.messages[1].chatMessageText).toBe('about loops');
  });

  it('matches a substring without case, because a student typed it', async () => {
    const transport = new FixtureTransport(
      transcript([{when: {contains: 'Bounce'}, reply: {text: 'ok'}}]),
      still,
    );

    await expect(
      transport.complete(ask('make it bounce')),
    ).resolves.toBeDefined();
  });

  it('counts requests, not turns, for a turn matcher', async () => {
    // `turn: 1` is the second REQUEST of the session, whichever turn answered
    // the first one.
    const transport = new FixtureTransport(
      transcript([
        {when: {turn: 1}, reply: {text: 'second request'}},
        {reply: {text: 'anything else'}},
      ]),
      still,
    );

    const one = await transport.complete(ask('a'));
    const two = await transport.complete(ask('b'));

    expect(one.messages[1].chatMessageText).toBe('anything else');
    expect(two.messages[1].chatMessageText).toBe('second request');
  });

  it('falls back when nothing applies, and keeps falling back', async () => {
    const transport = new FixtureTransport(
      transcript([{when: {contains: 'never'}, reply: {text: 'no'}}], {
        text: 'I did not follow',
      }),
      still,
    );

    expect(
      (await transport.complete(ask('a'))).messages[1].chatMessageText,
    ).toBe('I did not follow');
    expect(
      (await transport.complete(ask('b'))).messages[1].chatMessageText,
    ).toBe('I did not follow');
  });

  it('complains by name when nothing applies and there is no fallback', async () => {
    // A test wants this loud: the alternative is a panel answering `undefined`
    // three turns after the typo that caused it.
    const transport = new FixtureTransport(transcript([]), still);

    await expect(transport.complete(ask('hello?'))).rejects.toThrow(
      FixtureExhausted,
    );
    await expect(transport.complete(ask('hello?'))).rejects.toThrow(
      /"hello\?"/,
    );
  });
});

describe('the shape of a reply', () => {
  it('echoes the student message with an id and a settled status', async () => {
    const transport = new FixtureTransport(
      transcript([{reply: {text: 'sure'}}]),
      still,
    );

    const {messages} = await transport.complete(ask('hi'));

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({
      role: Role.USER,
      chatMessageText: 'hi',
      status: AiInteractionStatus.OK,
      updateId: 'u-hi',
    });
    expect(messages[0].requestId).toBeDefined();
    expect(messages[1].role).toBe(Role.ASSISTANT);
  });

  it('hands back the structured answer already parsed', async () => {
    // Parsed once, here, so nothing downstream has to decide whether a given
    // string is JSON.
    const transport = new FixtureTransport(
      transcript([
        {
          reply: {
            text: 'done',
            structured: {answer: {answerType: 'buildJSON'}},
          },
        },
      ]),
      still,
    );

    const reply = await transport.complete(ask('do it'));

    expect(reply.structuredOutput).toEqual({answer: {answerType: 'buildJSON'}});
    expect(reply.messages[1].structuredOutput).toEqual(reply.structuredOutput);
  });

  it('stamps every message with one timestamp from the injected clock', async () => {
    const transport = new FixtureTransport(
      transcript([{reply: {text: 'a'}}]),
      still,
    );

    const {messages} = await transport.complete(ask('hi'));

    expect(messages.map(m => m.timestamp)).toEqual([1000, 1000]);
  });
});

describe('failure', () => {
  it('omits the assistant turn when the student message itself failed', async () => {
    // The model was never called, so there is nothing for it to have said.
    // This is the shape the real profanity path produces.
    const transport = new FixtureTransport(
      transcript([
        {reply: {userStatus: AiInteractionStatus.PROFANITY_VIOLATION}},
      ]),
      still,
    );

    const {messages} = await transport.complete(ask('something rude'));

    expect(messages).toHaveLength(1);
    expect(messages[0].status).toBe(AiInteractionStatus.PROFANITY_VIOLATION);
  });

  it('resolves rather than throwing when the ANSWER failed', async () => {
    // A described failure is something the panel renders, not something it
    // catches. Only an abort or a dead network rejects.
    const transport = new FixtureTransport(
      transcript([{reply: {status: AiInteractionStatus.MODEL_TIMEOUT}}]),
      still,
    );

    const {messages} = await transport.complete(ask('slow one'));

    expect(messages[0].status).toBe(AiInteractionStatus.OK);
    expect(messages[1].status).toBe(AiInteractionStatus.MODEL_TIMEOUT);
  });
});

describe('waiting and abort', () => {
  it('waits the scripted delay, which is what makes the pending state visible', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const transport = new FixtureTransport(
      transcript([{delayMs: 750, reply: {text: 'eventually'}}]),
      {...still, sleep},
    );

    await transport.complete(ask('hi'));

    expect(sleep).toHaveBeenCalledWith(750, undefined);
  });

  it('rejects a request aborted while it waits', async () => {
    const controller = new AbortController();
    const transport = new FixtureTransport(
      transcript([{delayMs: 5, reply: {text: 'too late'}}]),
      {now: () => 0},
    );

    const pending = transport.complete(ask('hi'), controller.signal);
    controller.abort();

    await expect(pending).rejects.toBeDefined();
  });

  it('never answers a hanging turn, which is the only way to reach the abort path', async () => {
    const controller = new AbortController();
    const transport = new FixtureTransport(
      transcript([{hang: true, reply: {text: 'never said'}}]),
      still,
    );

    const pending = transport.complete(ask('hang'), controller.signal);
    const settled = vi.fn();
    pending.then(settled, settled);

    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    controller.abort();
    await expect(pending).rejects.toBeDefined();
  });
});

describe('the shipped fixtures', () => {
  it('parses', () => {
    expect(() => parseTranscript(conversation)).not.toThrow();
    expect(() => parseTranscript(failures)).not.toThrow();
  });

  it('plays the conversation through to its proposal', async () => {
    const transport = new FixtureTransport(
      parseTranscript(conversation),
      still,
    );

    await transport.complete(ask('what is a loop?'));
    await transport.complete(ask('I keep drawing circles'));
    const third = await transport.complete(ask('yes please'));

    expect(third.structuredOutput).toMatchObject({
      answer: {answerType: 'buildJavaScript'},
    });
  });

  it('reaches each named failure', async () => {
    const transport = new FixtureTransport(parseTranscript(failures), still);

    const profanity = await transport.complete(ask('profanity'));
    const timeout = await transport.complete(ask('timeout'));

    expect(profanity.messages).toHaveLength(1);
    expect(timeout.messages[1].status).toBe(AiInteractionStatus.MODEL_TIMEOUT);
  });
});
