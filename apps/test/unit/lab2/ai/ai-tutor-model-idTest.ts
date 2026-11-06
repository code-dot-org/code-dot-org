import {queryParams} from '@cdo/apps/code-studio/utils';

jest.mock('@cdo/apps/code-studio/utils', () => ({queryParams: jest.fn()}));
const mockQueryParams = queryParams as jest.Mock;

// The module reads the query string once, as it loads.
const load = () => {
  let loaded: typeof import('@cdo/apps/lab2/ai/ai-tutor-model-id');
  jest.isolateModules(() => {
    loaded = jest.requireActual('@cdo/apps/lab2/ai/ai-tutor-model-id');
  });
  return loaded!;
};

describe('aiTutorModelParametersFor', () => {
  beforeEach(() => mockQueryParams.mockReturnValue(undefined));

  it('is the default model when neither the level nor the query string names one', () => {
    const {defaultAiTutorModelId, aiTutorModelParametersFor} = load();
    expect(defaultAiTutorModelId).toBe('gemini-2.5-flash');
    expect(aiTutorModelParametersFor()).toEqual({
      selectedModelId: 'gemini-2.5-flash',
    });
  });

  it("is the level's model and thinking level when the level names one", () => {
    const {aiTutorModelParametersFor} = load();
    expect(
      aiTutorModelParametersFor({
        selectedModelId: 'gemini-3.5-flash-lite',
        thinkingLevel: 'minimal',
      })
    ).toEqual({
      selectedModelId: 'gemini-3.5-flash-lite',
      thinkingLevel: 'minimal',
    });
  });

  it("is the query string's model, alone, over the level's", () => {
    mockQueryParams.mockImplementation((name: string) =>
      name === 'aitutor-model' ? 'gemini-2.5-flash-lite' : undefined
    );
    const {defaultAiTutorModelId, aiTutorModelParametersFor} = load();
    expect(defaultAiTutorModelId).toBe('gemini-2.5-flash-lite');
    expect(
      aiTutorModelParametersFor({
        selectedModelId: 'gemini-3.5-flash-lite',
        thinkingLevel: 'minimal',
      })
    ).toEqual({selectedModelId: 'gemini-2.5-flash-lite'});
  });

  it('ignores a query string model it does not know', () => {
    mockQueryParams.mockReturnValue('not-a-model');
    const {defaultAiTutorModelId} = load();
    expect(defaultAiTutorModelId).toBe('gemini-2.5-flash');
  });
});
