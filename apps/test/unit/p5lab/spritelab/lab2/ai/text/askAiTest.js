import {isTextSafe} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {
  askAiText,
  AskAiError,
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
    expect(isTextSafe).toHaveBeenNthCalledWith(
      1,
      'why did the cat nap?',
      'input_filter'
    );
    expect(isTextSafe).toHaveBeenNthCalledWith(
      2,
      'Because it was tired.',
      'output_filter'
    );
  });

  it('sends its own client type, not the lab ambient one', async () => {
    await askAiText('hello');
    const [, extra] = generateText.mock.calls[0];
    expect(extra.aichatContext.clientType).toBe(
      AiChatClientTypes.SPRITELAB_ASK_AI
    );
    expect(extra.aichatContext.currentLevelId).toBe(7);
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
