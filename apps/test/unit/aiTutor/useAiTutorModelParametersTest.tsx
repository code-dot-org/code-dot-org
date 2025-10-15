import {renderHook} from '@testing-library/react-hooks';

import {
  baseModelParameters,
  useAiTutorModelParameters,
} from '@cdo/apps/aiTutor/hooks/useAiTutorModelParameters';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/code-studio/utils', () => ({
  queryParams: jest.fn().mockImplementation(() => undefined),
}));

jest.mock('@cdo/apps/lab2/ai/ai-should-show-copy-code', () => ({
  shouldShowCopyCode: false,
}));

jest.mock('@cdo/apps/lab2/ai/ai-tutor-model-id', () => ({
  aiTutorModelId: 'mock-model-id',
}));

describe('useAiTutorModelParameters', () => {
  let httpClientSpy: jest.SpyInstance;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    httpClientSpy = jest.spyOn(HttpClient, 'get').mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    } as unknown as Response);
  });

  it('returns default model parameters when no custom prompt is configured', async () => {
    const {result} = renderHook(() => useAiTutorModelParameters());

    expect(httpClientSpy).not.toHaveBeenCalled();

    expect(result.current.systemPrompt).toEqual(
      baseModelParameters.systemPrompt
    );
    expect(result.current.modelParameters).toEqual({
      ...baseModelParameters,
      systemPrompt: baseModelParameters.systemPrompt,
    });
  });

  it('fetches and applies a custom system prompt when selected', async () => {
    const customPrompt = 'Custom prompt text';
    httpClientSpy.mockResolvedValue({
      text: jest.fn().mockResolvedValue(customPrompt),
    });

    const {result, waitForNextUpdate} = renderHook(() =>
      useAiTutorModelParameters({
        aiTutorSystemPromptName: 'custom-prompt',
      })
    );

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(httpClientSpy).toHaveBeenCalledWith(
      'https://curriculum.code.org/media/prompt-library/custom-prompt.md'
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.systemPrompt).toEqual(customPrompt);
    expect(result.current.modelParameters).toEqual({
      ...baseModelParameters,
      systemPrompt: customPrompt,
    });
  });

  it('falls back to the default prompt when fetching the custom prompt fails', async () => {
    const fetchError = new Error('network failure');
    httpClientSpy.mockRejectedValue(fetchError);

    const {result, waitForNextUpdate} = renderHook(() =>
      useAiTutorModelParameters({
        aiTutorSystemPromptName: 'failing-prompt',
      })
    );

    await waitForNextUpdate();

    expect(httpClientSpy).toHaveBeenCalledWith(
      'https://curriculum.code.org/media/prompt-library/failing-prompt.md'
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.systemPrompt).toEqual(
      baseModelParameters.systemPrompt
    );
    expect(result.current.modelParameters).toEqual({
      ...baseModelParameters,
      systemPrompt: baseModelParameters.systemPrompt,
    });
  });
});
