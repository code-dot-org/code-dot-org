import * as Observability from '@code-dot-org/core/plugins/observability';
import {z} from 'zod';

import {
  generate,
  moderateInput,
  moderateOutput,
} from '@cdo/apps/adaptive/ai/generate';
import {startTrace} from '@cdo/apps/adaptive/ai/langfuse/trace';
import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {
  AiChatClientTypes,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({generateText: jest.fn()}));
jest.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {count: jest.fn(), distribution: jest.fn()},
  recordError: jest.fn(),
}));
const mockEnd = jest.fn();
jest.mock('@cdo/apps/adaptive/ai/langfuse/trace', () => ({
  startTrace: jest.fn(() => ({traceId: 'trace-1', end: mockEnd})),
}));
jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  ...jest.requireActual('@cdo/apps/aichat/api/client/helpers/modelHelpers'),
  getModel: jest.fn(() => 'model'),
}));
const mockLogError = jest.fn();
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({getMetricsReporter: () => ({logError: mockLogError})}),
  },
}));

const mockGenerateText = generateText as jest.Mock;
const mockCount = Observability.metrics.count as jest.Mock;
const mockDistribution = Observability.metrics.distribution as jest.Mock;
const mockRecordError = Observability.recordError as jest.Mock;
const mockStartTrace = startTrace as jest.Mock;
const mockDcdoGet = DCDO.get as jest.Mock;

const schema = z.object({instructions: z.string()});
const context: AichatContext = {
  clientType: AiChatClientTypes.ADAPTIVE,
  currentLevelId: 7,
  scriptId: null,
  channelId: undefined,
};
const trace = {
  name: 'adaptive-instructions' as const,
  metadata: {stepId: 'build'},
};
const options = {
  schema,
  model: AiChatModelIds.GEMINI_3_1_FLASH_LITE,
  prompt: 'p',
  context,
  trace,
};
const gatewayResult = {
  output: {instructions: 'Do this.'},
  usage: {inputTokens: 10, outputTokens: 2, totalTokens: 12},
  response: {id: 'resp-1'},
};

describe('generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDcdoGet.mockReturnValue(true);
  });

  it('returns the parsed output and sends the shell context', async () => {
    mockGenerateText.mockResolvedValue(gatewayResult);

    const result = await generate(options);

    expect(result).toEqual({
      output: {instructions: 'Do this.'},
      traceId: 'trace-1',
    });
    expect(mockGenerateText.mock.calls[0][1]).toMatchObject({
      phase: 'generation',
      aichatContext: context,
    });
  });

  it("asks the caller's model", async () => {
    mockGenerateText.mockResolvedValue(gatewayResult);

    await generate(options);
    expect(getModel).toHaveBeenCalledWith('gemini-3.1-flash-lite');
    expect(mockGenerateText.mock.calls[0][0]).toMatchObject({model: 'model'});
  });

  it('starts the trace with the prompt and context, and ends it with usage and response id', async () => {
    mockGenerateText.mockResolvedValue(gatewayResult);

    await generate(options);

    expect(mockStartTrace).toHaveBeenCalledWith({
      name: 'adaptive-instructions',
      levelId: 7,
      model: 'gemini-3.1-flash-lite',
      prompt: 'p',
      metadata: {stepId: 'build', scriptId: undefined},
    });
    expect(mockEnd).toHaveBeenCalledTimes(1);
    expect(mockEnd).toHaveBeenCalledWith({
      outcome: 'success',
      output: {instructions: 'Do this.'},
      usage: {input: 10, output: 2, total: 12},
      responseId: 'resp-1',
    });
  });

  it('returns nothing and traces nothing until the flag opts in', async () => {
    mockDcdoGet.mockReturnValue(false);

    expect(await generate(options)).toEqual({});
    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(mockStartTrace).not.toHaveBeenCalled();
    expect(mockDcdoGet).toHaveBeenCalledWith('adaptive-ai-enabled', false);
  });

  it('returns only the trace id and ends it as a mismatch when output does not fit the schema', async () => {
    mockGenerateText.mockResolvedValue({...gatewayResult, output: {wrong: 1}});

    expect(await generate(options)).toEqual({traceId: 'trace-1'});
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(mockEnd).toHaveBeenCalledWith({
      outcome: 'schema_mismatch',
      output: {wrong: 1},
      usage: {input: 10, output: 2, total: 12},
      errorMessage: expect.stringContaining('instructions'),
      responseId: 'resp-1',
    });
  });

  it('returns only the trace id and ends it with the error when the gateway throws', async () => {
    mockGenerateText.mockRejectedValue(new Error('boom'));

    expect(await generate(options)).toEqual({traceId: 'trace-1'});
    expect(mockLogError).toHaveBeenCalledWith(
      'Adaptive AI generation failed',
      expect.any(Error),
      expect.anything()
    );
    expect(mockEnd).toHaveBeenCalledWith({
      outcome: 'error',
      errorMessage: 'boom',
    });
  });

  it('counts and times each generation by trace, model and outcome', async () => {
    mockGenerateText.mockResolvedValue(gatewayResult);

    await generate(options);

    const tags = {
      lab: 'adaptive',
      trace: 'adaptive-instructions',
      model: 'gemini-3.1-flash-lite',
      outcome: 'success',
    };
    expect(mockCount).toHaveBeenCalledWith('adaptive.ai.generation', 1, tags);
    expect(mockDistribution).toHaveBeenCalledWith(
      'adaptive.ai.latency_ms',
      expect.any(Number),
      tags
    );
    expect(mockRecordError).not.toHaveBeenCalled();
  });

  it('raises a failure as its own Sentry issue, with what was thrown as the cause', async () => {
    const thrown = new Error('boom');
    mockGenerateText.mockRejectedValue(thrown);

    await generate(options);

    expect(mockCount).toHaveBeenCalledWith(
      'adaptive.ai.generation',
      1,
      expect.objectContaining({outcome: 'error'})
    );
    const [error, context, tags] = mockRecordError.mock.calls[0];
    expect(error.message).toBe('Adaptive AI generation failed');
    expect(error.cause).toBe(thrown);
    expect(context).toEqual({traceId: 'trace-1', stepId: 'build'});
    expect(tags).toEqual({
      lab: 'adaptive',
      trace: 'adaptive-instructions',
      model: 'gemini-3.1-flash-lite',
    });
  });

  it('counts a call that outlives its timeout as a timeout, not an error', async () => {
    jest.useFakeTimers();
    try {
      mockGenerateText.mockReturnValue(new Promise(() => {}));
      const result = generate(options);
      await jest.advanceTimersByTimeAsync(30_000);

      expect(await result).toEqual({traceId: 'trace-1'});
      expect(mockCount).toHaveBeenCalledWith(
        'adaptive.ai.generation',
        1,
        expect.objectContaining({outcome: 'timeout'})
      );
      expect(mockRecordError.mock.calls[0][0].message).toBe(
        'Adaptive AI generation timed out'
      );
      expect(mockEnd).toHaveBeenCalledWith({
        outcome: 'error',
        errorMessage: 'timed out after 30000ms',
      });
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('moderateInput', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is ok when the judge clears the text, asked with the shell context', async () => {
    mockGenerateText.mockResolvedValue({output: {classification: 'OK'}});

    await expect(moderateInput('a site about dogs', context)).resolves.toBe(
      'ok'
    );
    expect(mockGenerateText.mock.calls[0][0].prompt).toContain(
      'a site about dogs'
    );
    expect(mockGenerateText.mock.calls[0][1]).toEqual({
      phase: 'input_filter',
      aichatContext: context,
    });
  });

  it("asks the judge on the shell's model, at the judge's own thinking", async () => {
    mockGenerateText.mockResolvedValue({output: {classification: 'OK'}});

    await moderateInput('a site about dogs', context);

    expect(getModel).toHaveBeenCalledWith('gemini-3.1-flash-lite');
    expect(mockGenerateText.mock.calls[0][0]).not.toHaveProperty(
      'providerOptions'
    );
  });

  it('is flagged when the judge does not clear the text', async () => {
    mockGenerateText.mockResolvedValue({
      output: {classification: 'INAPPROPRIATE'},
    });

    await expect(moderateInput('bad text', context)).resolves.toBe('flagged');
    expect(mockCount).toHaveBeenCalledWith('adaptive.text_moderation', 1, {
      phase: 'input_filter',
      result: 'flagged',
    });
  });

  it('is an error, and reported, when the judge fails or answers nonsense', async () => {
    mockGenerateText.mockRejectedValue(new Error('gateway down'));
    await expect(moderateInput('text', context)).resolves.toBe('error');

    mockGenerateText.mockResolvedValue({output: {classification: 'MAYBE'}});
    await expect(moderateInput('text', context)).resolves.toBe('error');

    expect(mockLogError).toHaveBeenCalledTimes(2);
  });
});

describe('moderateOutput', () => {
  beforeEach(() => jest.clearAllMocks());

  it('asks the judge in the output phase and counts the result', async () => {
    mockGenerateText.mockResolvedValue({output: {classification: 'OK'}});

    await expect(moderateOutput('Do this.', context)).resolves.toBe('ok');
    expect(mockGenerateText.mock.calls[0][1]).toEqual({
      phase: 'output_filter',
      aichatContext: context,
    });
    expect(mockCount).toHaveBeenCalledWith('adaptive.text_moderation', 1, {
      phase: 'output_filter',
      result: 'ok',
    });
  });

  it('is an error, counted as one, when the judge fails', async () => {
    mockGenerateText.mockRejectedValue(new Error('gateway down'));

    await expect(moderateOutput('text', context)).resolves.toBe('error');
    expect(mockCount).toHaveBeenCalledWith('adaptive.text_moderation', 1, {
      phase: 'output_filter',
      result: 'error',
    });
  });
});
