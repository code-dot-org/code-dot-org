import {z} from 'zod';

import {generate} from '@cdo/apps/adaptive/ai/generate';
import {startTrace} from '@cdo/apps/adaptive/ai/langfuse/trace';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({generateText: jest.fn()}));
const mockEnd = jest.fn();
jest.mock('@cdo/apps/adaptive/ai/langfuse/trace', () => ({
  startTrace: jest.fn(() => ({traceId: 'trace-1', end: mockEnd})),
}));
jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
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
const options = {schema, prompt: 'p', context, trace};
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

  it('starts the trace with the prompt and context, and ends it with usage and response id', async () => {
    mockGenerateText.mockResolvedValue(gatewayResult);

    await generate(options);

    expect(mockStartTrace).toHaveBeenCalledWith({
      name: 'adaptive-instructions',
      levelId: 7,
      model: expect.any(String),
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
});
