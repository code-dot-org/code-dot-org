import * as Observability from '@code-dot-org/core/plugins/observability';

import {isTextSafe} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {
  ASK_AI_TIMEOUT_MS,
  askAiChoice,
  askAiText,
  AskAiError,
  askAiErrorMessage,
  buildSystemPrompt,
  CHOICE_SYSTEM_PROMPT,
  cleanAnswer,
  isAskAiEnabled,
  SYSTEM_PROMPT,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/text/askAi';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aichat/api/client/helpers/safetyHelpers', () => ({
  isTextSafe: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(() => 'a-model'),
}));
jest.mock('@cdo/apps/aiGateway', () => ({generateText: jest.fn()}));
jest.mock('@cdo/apps/dcdo', () => ({get: jest.fn()}));
jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn()},
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({
    getState: () => ({progress: {currentLevelId: '7', scriptId: 3}}),
  }),
}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({getProjectManager: () => ({getChannelId: () => 'abc'})}),
}));

describe('askAiText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DCDO.get.mockReturnValue(true);
    isTextSafe.mockResolvedValue(true);
    generateText.mockResolvedValue({text: 'Because it was tired.'});
  });

  it('returns the answer when both judges pass', async () => {
    await expect(askAiText('why did the cat nap?')).resolves.toBe(
      'Because it was tired.'
    );
  });

  it('judges the question, then the answer', async () => {
    await askAiText('why did the cat nap?');
    const [first, second] = isTextSafe.mock.calls;
    expect(first.slice(0, 2)).toEqual(['why did the cat nap?', 'input_filter']);
    expect(second.slice(0, 2)).toEqual([
      'Because it was tired.',
      'output_filter',
    ]);
  });

  it('sends its own client type, not the lab ambient one', async () => {
    await askAiText('hello');
    const [, extra] = generateText.mock.calls[0];
    expect(extra.aichatContext.clientType).toBe(
      AiChatClientTypes.SPRITELAB_ASK_AI
    );
    expect(extra.aichatContext.currentLevelId).toBe(7);
  });

  // Left out, each judge falls back to the lab's ambient FLOW_LAB context,
  // which the server trusts — bypassing the levelbuilder gate.
  it('gives both safety judges the same client type', async () => {
    await askAiText('hello');
    expect(isTextSafe).toHaveBeenCalledTimes(2);
    isTextSafe.mock.calls.forEach(([, , , context]) => {
      expect(context?.clientType).toBe(AiChatClientTypes.SPRITELAB_ASK_AI);
    });
  });

  // Left unbounded, the block waits forever and the engine never gets to
  // decrement numActivePrompts or warn.
  it('times out when the output judge never settles', async () => {
    jest.useFakeTimers();
    isTextSafe
      .mockResolvedValueOnce(true)
      .mockReturnValueOnce(new Promise(() => {}));
    const pending = askAiText('hello');
    const settled = expect(pending).rejects.toThrow('too long');
    await jest.advanceTimersByTimeAsync(ASK_AI_TIMEOUT_MS + 1);
    await settled;
    jest.useRealTimers();
    // Uncounted, a gateway slowdown would read as nobody using the block.
    expect(Observability.metrics.count).toHaveBeenCalledWith(
      expect.any(String),
      1,
      {result: 'timeout'}
    );
  });

  it('counts an output judge that throws', async () => {
    isTextSafe
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('judge exploded'));
    await expect(askAiText('hello')).rejects.toThrow('judge exploded');
    expect(Observability.metrics.count).toHaveBeenCalledWith(
      expect.any(String),
      1,
      {result: 'error'}
    );
  });

  it('throws with the prompt phase when the question is flagged', async () => {
    isTextSafe.mockResolvedValueOnce(false);
    await expect(askAiText('something awful')).rejects.toMatchObject({
      name: 'AskAiError',
      phase: 'prompt',
    });
  });

  it('throws with the answer phase when the reply is flagged', async () => {
    isTextSafe.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const error = await askAiText('hello').catch(e => e);
    expect(error).toBeInstanceOf(AskAiError);
    expect(error.phase).toBe('answer');
  });

  it('fails closed when a judge itself throws', async () => {
    isTextSafe.mockRejectedValueOnce(new Error('judge exploded'));
    await expect(askAiText('hello')).rejects.toThrow('judge exploded');
  });

  it('propagates a failed generation', async () => {
    generateText.mockRejectedValue(new Error('gateway down'));
    await expect(askAiText('hello')).rejects.toThrow('gateway down');
  });

  it('rejects an empty answer rather than storing one', async () => {
    generateText.mockResolvedValue({text: '   '});
    await expect(askAiText('hello')).rejects.toThrow('empty');
  });

  it('does not call the gateway when the kill switch is off', async () => {
    DCDO.get.mockReturnValue(false);
    await expect(askAiText('hello')).rejects.toThrow('turned off');
    expect(generateText).not.toHaveBeenCalled();
  });

  it('truncates a very long question', async () => {
    await askAiText('x'.repeat(5000));
    expect(generateText.mock.calls[0][0].prompt).toHaveLength(1000);
  });

  it("uses the lab's system prompt alone when the student set none", async () => {
    await askAiText('hello');
    expect(generateText.mock.calls[0][0].system).toBe(SYSTEM_PROMPT);
  });

  it("adds the student's system prompt after the lab's rules", async () => {
    await askAiText('hello', 'Talk like a pirate.');
    const {system} = generateText.mock.calls[0][0];
    expect(system.startsWith(SYSTEM_PROMPT)).toBe(true);
    expect(system.endsWith('Talk like a pirate.')).toBe(true);
  });

  // Judged together, a long system prompt could bury a bad question.
  it("judges the student's system prompt apart from the question", async () => {
    await askAiText('hello', 'Talk like a parrot.');
    const inputs = isTextSafe.mock.calls
      .filter(([, filter]) => filter === 'input_filter')
      .map(([text]) => text);
    expect(inputs).toEqual(['hello', 'Talk like a parrot.']);
  });

  it('judges a system prompt once across questions', async () => {
    await askAiText('hello', 'Talk like a robot.');
    await askAiText('goodbye', 'Talk like a robot.');
    const judged = isTextSafe.mock.calls.filter(
      ([text]) => text === 'Talk like a robot.'
    );
    expect(judged).toHaveLength(1);
  });

  it('throws with the system prompt phase when it is flagged', async () => {
    isTextSafe.mockImplementation(async text => text !== 'something awful');
    await expect(askAiText('hello', 'something awful')).rejects.toMatchObject({
      name: 'AskAiError',
      phase: 'system_prompt',
    });
    expect(Observability.metrics.count).toHaveBeenCalledWith(
      expect.any(String),
      1,
      {result: 'system_prompt_flagged'}
    );
  });

  it('truncates a very long system prompt', async () => {
    await askAiText('hello', 'x'.repeat(5000));
    expect(generateText.mock.calls[0][0].system).toBe(
      buildSystemPrompt('x'.repeat(1000))
    );
  });
});

describe('askAiErrorMessage', () => {
  it('names the system prompt when it is the flagged text', () => {
    expect(askAiErrorMessage(new AskAiError('system_prompt'))).toBe(
      "That system prompt isn't allowed."
    );
  });
});

describe('askAiChoice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DCDO.get.mockReturnValue(true);
    isTextSafe.mockResolvedValue(true);
    generateText.mockResolvedValue({output: {answer: '2'}});
  });

  it('shows the model the question and every choice', async () => {
    await expect(
      askAiChoice('is a whale a fish?', ['yes', 'no'])
    ).resolves.toBe('no');
    const [{system, prompt}] = generateText.mock.calls[0];
    expect(system).toBe(CHOICE_SYSTEM_PROMPT);
    expect(prompt).toBe(
      'Question: is a whale a fish?\nAnswer choices:\n1. yes\n2. no'
    );
  });

  it("adds the student's system prompt after the choice rules", async () => {
    await askAiChoice('pick one', ['yes', 'no'], 'Pick the silliest one.');
    expect(generateText.mock.calls[0][0].system).toBe(
      buildSystemPrompt('Pick the silliest one.', CHOICE_SYSTEM_PROMPT)
    );
  });

  it('judges the question with the choices, and not the answer', async () => {
    await askAiChoice('is a whale a fish?', ['yes', 'no']);
    expect(isTextSafe).toHaveBeenCalledTimes(1);
    const [text, phase, , context] = isTextSafe.mock.calls[0];
    expect(text).toBe(generateText.mock.calls[0][0].prompt);
    expect(phase).toBe('input_filter');
    expect(context.clientType).toBe(AiChatClientTypes.SPRITELAB_ASK_AI);
  });

  it('lists a repeated choice once', async () => {
    await askAiChoice('pick one', ['no', 'no', 'yes']);
    expect(generateText.mock.calls[0][0].prompt).toBe(
      'Question: pick one\nAnswer choices:\n1. no\n2. yes'
    );
  });

  it('rejects an answer that is not one of the choices', async () => {
    generateText.mockResolvedValue({output: {answer: '3'}});
    await expect(askAiChoice('hello', ['yes', 'no'])).rejects.toThrow(
      'other than a choice'
    );
    expect(Observability.metrics.count).toHaveBeenCalledWith(
      'spritelab-lab2.ask_ai_choice',
      1,
      {result: 'error'}
    );
  });

  it('caps what the model sees, but answers with the full choice', async () => {
    const long = 'y'.repeat(500);
    generateText.mockResolvedValue({output: {answer: '1'}});
    await expect(askAiChoice('x'.repeat(5000), [long, 'no'])).resolves.toBe(
      long
    );
    expect(generateText.mock.calls[0][0].prompt).toBe(
      `Question: ${'x'.repeat(1000)}\n` +
        `Answer choices:\n1. ${'y'.repeat(150)}\n2. no`
    );
  });

  it('tells apart long choices that start the same', async () => {
    const first = `${'y'.repeat(150)} first`;
    const second = `${'y'.repeat(150)} second`;
    await expect(askAiChoice('pick one', [first, second])).resolves.toBe(
      second
    );
  });

  it('answers with a lone choice without asking the model', async () => {
    await expect(askAiChoice('pick one', ['yes', 'yes'])).resolves.toBe('yes');
    expect(generateText).not.toHaveBeenCalled();
    expect(isTextSafe).not.toHaveBeenCalled();
  });
});

describe('isAskAiEnabled', () => {
  it('is on unless DCDO says false', () => {
    DCDO.get.mockReturnValue(undefined);
    expect(isAskAiEnabled()).toBe(true);
    DCDO.get.mockReturnValue(false);
    expect(isAskAiEnabled()).toBe(false);
  });
});

describe('cleanAnswer', () => {
  it('strips markup a speech bubble would read aloud', () => {
    expect(cleanAnswer('**Hi** there\n- one `two`')).toBe('Hi there one two');
  });
});
