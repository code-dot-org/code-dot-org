import {queryParams} from '@cdo/apps/code-studio/utils';

jest.mock('@cdo/apps/code-studio/utils', () => ({queryParams: jest.fn()}));
const mockQueryParams = queryParams as jest.Mock;

// The module reads the query string once, as it loads.
const load = () => {
  let loaded: typeof import('@cdo/apps/adaptive/ai/models');
  jest.isolateModules(() => {
    loaded = jest.requireActual('@cdo/apps/adaptive/ai/models');
  });
  return loaded!;
};

const GEMINI = {
  STANDARD: 'gemini-3.5-flash-lite',
  FAST: 'gemini-3.1-flash-lite',
};
const OPENAI = {STANDARD: 'gpt-6-luna', FAST: 'gpt-6-luna'};

describe('ADAPTIVE_MODELS', () => {
  beforeEach(() => mockQueryParams.mockReturnValue(undefined));

  it("is Gemini's set when the query string names no provider", () => {
    expect(load().ADAPTIVE_MODELS).toEqual(GEMINI);
  });

  it("is the named provider's set", () => {
    mockQueryParams.mockImplementation((name: string) =>
      name === 'adaptive-model-provider' ? 'openai' : undefined
    );
    expect(load().ADAPTIVE_MODELS).toEqual(OPENAI);
  });

  it("is Gemini's set when the query string names a provider it does not know", () => {
    mockQueryParams.mockReturnValue('anthropic');
    expect(load().ADAPTIVE_MODELS).toEqual(GEMINI);
  });
});
