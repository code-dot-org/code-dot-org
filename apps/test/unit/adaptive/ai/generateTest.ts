import {z} from 'zod';

import {generate} from '@cdo/apps/adaptive/ai/generate';
import {AichatContext} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({generateText: jest.fn()}));
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
const mockDcdoGet = DCDO.get as jest.Mock;

const schema = z.object({instructions: z.string()});
const context: AichatContext = {
  clientType: AiChatClientTypes.ADAPTIVE,
  currentLevelId: 7,
  scriptId: null,
  channelId: undefined,
};

describe('generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDcdoGet.mockReturnValue(true);
  });

  it('returns the parsed output and sends the shell context', async () => {
    mockGenerateText.mockResolvedValue({output: {instructions: 'Do this.'}});

    const result = await generate({schema, prompt: 'p', context});

    expect(result).toEqual({instructions: 'Do this.'});
    expect(mockGenerateText.mock.calls[0][1]).toMatchObject({
      phase: 'generation',
      aichatContext: context,
    });
  });

  it('returns undefined without calling the gateway until the flag opts in', async () => {
    mockDcdoGet.mockReturnValue(false);

    expect(await generate({schema, prompt: 'p', context})).toBeUndefined();
    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(mockDcdoGet).toHaveBeenCalledWith('adaptive-ai-enabled', false);
  });

  it('returns undefined and reports when output does not fit the schema', async () => {
    mockGenerateText.mockResolvedValue({output: {wrong: 1}});

    expect(await generate({schema, prompt: 'p', context})).toBeUndefined();
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it('returns undefined and reports when the gateway throws', async () => {
    mockGenerateText.mockRejectedValue(new Error('boom'));

    expect(await generate({schema, prompt: 'p', context})).toBeUndefined();
    expect(mockLogError).toHaveBeenCalledWith(
      'Adaptive AI generation failed',
      expect.any(Error),
      expect.anything()
    );
  });
});
