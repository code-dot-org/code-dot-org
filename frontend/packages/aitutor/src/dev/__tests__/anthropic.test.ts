// The provider half of the dev proxy.
//
// Pure functions, so this is testable without a server and without a key —
// which matters, because the alternative to testing it is finding out from a
// developer whose own key just produced nothing.

import {describe, expect, it, vi} from 'vitest';

import {AiInteractionStatus} from '../../model/status';
import {
  anthropicBody,
  anthropicReply,
  askAnthropic,
  failureFor,
} from '../anthropic';

const ask = (over = {}) => ({
  messages: [{role: 'user' as const, text: 'why?'}],
  ...over,
});

describe('anthropicBody', () => {
  it('carries the conversation and the model', () => {
    expect(anthropicBody(ask(), 'a-model')).toMatchObject({
      model: 'a-model',
      messages: [{role: 'user', content: 'why?'}],
    });
  });

  it('leaves the system prompt out when there is none', () => {
    // Rather than sending an empty one, which is a sentence the model has to
    // account for.
    expect(anthropicBody(ask(), 'm')).not.toHaveProperty('system');
    expect(anthropicBody(ask({system: 'be brief'}), 'm')).toMatchObject({
      system: 'be brief',
    });
  });

  it('sends no tool when the answer is meant to be prose', () => {
    expect(anthropicBody(ask(), 'm')).not.toHaveProperty('tools');
  });

  it('requires the tool, rather than offering it, when a schema is set', () => {
    // Merely offered, the model may answer in prose and the caller gets
    // nothing where it expected a proposal.
    const schema = {type: 'object', properties: {}};
    const body = anthropicBody(ask({responseSchema: schema}), 'm') as {
      tools: Array<{input_schema: object}>;
      tool_choice: object;
    };

    expect(body.tools[0].input_schema).toBe(schema);
    expect(body.tool_choice).toEqual({type: 'tool', name: 'respond'});
  });
});

describe('anthropicReply', () => {
  it('joins the text blocks', () => {
    expect(
      anthropicReply({
        content: [
          {type: 'text', text: 'one'},
          {type: 'text', text: 'two'},
        ],
      }).text,
    ).toBe('one\ntwo');
  });

  it('takes the structured answer from the tool call', () => {
    const reply = anthropicReply({
      content: [
        {type: 'text', text: 'here you go'},
        {type: 'tool_use', name: 'respond', input: {answer: {}}},
      ],
    });

    expect(reply.text).toBe('here you go');
    expect(reply.structured).toEqual({answer: {}});
  });

  it('ignores a tool call that is not ours', () => {
    expect(
      anthropicReply({
        content: [{type: 'tool_use', name: 'something_else', input: {}}],
      }).structured,
    ).toBeUndefined();
  });

  it('is empty rather than undefined for a reply with no blocks', () => {
    expect(anthropicReply({}).text).toBe('');
  });
});

describe('failureFor', () => {
  it('names the failures the panel already has words for', () => {
    // Mapped here, where the status code is visible, so the browser is not
    // re-deriving "was that a rate limit" from a message string.
    expect(failureFor(429)).toBe(AiInteractionStatus.MODEL_RATE_LIMITED);
    expect(failureFor(408)).toBe(AiInteractionStatus.MODEL_TIMEOUT);
    expect(failureFor(504)).toBe(AiInteractionStatus.MODEL_TIMEOUT);
    expect(failureFor(413)).toBe(AiInteractionStatus.USER_INPUT_TOO_LARGE);
  });

  it('falls back to the copy of last resort', () => {
    expect(failureFor(500)).toBe(AiInteractionStatus.ERROR);
    expect(failureFor(401)).toBe(AiInteractionStatus.ERROR);
  });
});

describe('askAnthropic', () => {
  it('sends the key and the API version, and nothing else surprising', () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({content: [{type: 'text', text: 'hi'}]}),
    });

    void askAnthropic(ask(), 'sk-test', 'a-model', fetchImpl as never);

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers['x-api-key']).toBe('sk-test');
    expect(init.headers['anthropic-version']).toBe('2023-06-01');
  });

  it('turns a refused request into a failed turn, not an exception', async () => {
    // The panel renders a failed turn; it has nothing to do with an HTTP
    // status.
    // Deliberately a response with no `text` at all: a refused request must
    // resolve however odd the thing that refused it looks.
    const fetchImpl = vi.fn().mockResolvedValue({ok: false, status: 429});

    await expect(
      askAnthropic(ask(), 'k', 'm', fetchImpl as never),
    ).resolves.toMatchObject({
      text: '',
      failure: AiInteractionStatus.MODEL_RATE_LIMITED,
    });
  });
});

describe('what a failure says', () => {
  it('carries the provider’s own words back for the terminal', async () => {
    // Without this the developer who owns the key is told "there was an error
    // getting a response" and nothing else — less than curl would have said.
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('{"error":{"message":"invalid x-api-key"}}'),
    });

    const reply = await askAnthropic(
      ask(),
      'sk-wrong',
      'm',
      fetchImpl as never,
    );

    expect(reply.failure).toBe(AiInteractionStatus.ERROR);
    expect(reply.detail).toContain('401');
    expect(reply.detail).toContain('invalid x-api-key');
  });

  it('still names the status when the body cannot be read', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.reject(new Error('stream closed')),
    });

    const reply = await askAnthropic(ask(), 'k', 'm', fetchImpl as never);

    expect(reply.failure).toBe(AiInteractionStatus.MODEL_RATE_LIMITED);
    expect(reply.detail).toBe('429');
  });

  it('says nothing extra when the turn succeeded', () => {
    expect(
      anthropicReply({content: [{type: 'text', text: 'ok'}]}).detail,
    ).toBeUndefined();
  });
});

describe('running out of room', () => {
  // The failure that produced the worst symptom there is: the model is still
  // writing when it hits the ceiling, its tool call stops mid-object, and the
  // turn reads as EMPTY rather than as broken — so the panel showed the
  // waiting dots stopping and then nothing at all.

  it('names a truncated answer instead of returning an empty one', () => {
    const reply = anthropicReply({
      stop_reason: 'max_tokens',
      content: [{type: 'tool_use', name: 'respond', input: {answer: {}}}],
    });

    expect(reply.failure).toBe(AiInteractionStatus.USER_INPUT_TOO_LARGE);
    expect(reply.detail).toContain('max_tokens');
    expect(reply.structured).toBeUndefined();
  });

  it('says nothing about a turn that finished', () => {
    const reply = anthropicReply({
      stop_reason: 'tool_use',
      content: [{type: 'tool_use', name: 'respond', input: {answer: {a: 1}}}],
    });

    expect(reply.failure).toBeUndefined();
    expect(reply.structured).toEqual({answer: {a: 1}});
  });

  it('reads a real tool-call reply, which carries no text block at all', () => {
    // The shape a schema-constrained request actually comes back as. If this
    // is misread the answer is empty, which is how the silence happened.
    const reply = anthropicReply({
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          name: 'respond',
          input: {answer: {answerType: 'hint', explanation: 'try a loop'}},
        },
      ],
    });

    expect(reply.text).toBe('');
    expect(reply.structured).toEqual({
      answer: {answerType: 'hint', explanation: 'try a loop'},
    });
  });
});
