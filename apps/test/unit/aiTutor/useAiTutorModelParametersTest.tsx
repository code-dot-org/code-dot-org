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
  defaultAiTutorModelId: 'mock-model-id',
  aiTutorModelParametersFor: (level?: {selectedModelId: string}) =>
    level ?? {selectedModelId: 'mock-model-id'},
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

  it("takes the level's model", async () => {
    const {result} = renderHook(() =>
      useAiTutorModelParameters({
        aiTutorModelParameters: {
          selectedModelId: 'gemini-3.5-flash-lite',
        },
      })
    );

    expect(result.current.modelParameters).toEqual({
      ...baseModelParameters,
      selectedModelId: 'gemini-3.5-flash-lite',
      systemPrompt: baseModelParameters.systemPrompt,
    });
  });
});
