import {
  isAdaptiveAiAvailable,
  isAdaptiveAiDown,
  isAdaptiveAiEnabled,
} from '@cdo/apps/adaptive/ai/access';
import DCDO from '@cdo/apps/dcdo';
import {getStore} from '@cdo/apps/redux';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
jest.mock('@cdo/apps/redux', () => ({getStore: jest.fn()}));
const mockGet = DCDO.get as jest.Mock;
const mockGetStore = getStore as jest.Mock;

const setUp = (flag: boolean, accessLevel: string | undefined) => {
  mockGet.mockReturnValue(flag);
  mockGetStore.mockReturnValue({
    getState: () => ({currentUser: {aiChatAccessLevel: accessLevel}}),
  });
};

describe('isAdaptiveAiEnabled', () => {
  it('is the flag alone, whatever the access', () => {
    setUp(true, AiChatAccessLevels.DISABLED);
    expect(isAdaptiveAiEnabled()).toBe(true);
    setUp(false, AiChatAccessLevels.ENABLED);
    expect(isAdaptiveAiEnabled()).toBe(false);
  });
});

describe('isAdaptiveAiDown', () => {
  it('reads the outage flag, defaulting to up', () => {
    mockGet.mockReturnValue(true);
    expect(isAdaptiveAiDown()).toBe(true);
    expect(mockGet).toHaveBeenCalledWith('adaptive-ai-outage', false);
    mockGet.mockReturnValue(false);
    expect(isAdaptiveAiDown()).toBe(false);
  });
});

describe('isAdaptiveAiAvailable', () => {
  it('is off by the flag whatever the access', () => {
    setUp(false, AiChatAccessLevels.ENABLED);
    expect(isAdaptiveAiAvailable()).toBe(false);
    expect(mockGet).toHaveBeenCalledWith('adaptive-ai-enabled', false);
  });

  it('refuses only disabled access, the level being essential', () => {
    setUp(true, AiChatAccessLevels.DISABLED);
    expect(isAdaptiveAiAvailable()).toBe(false);
    setUp(true, AiChatAccessLevels.ESSENTIAL_ONLY);
    expect(isAdaptiveAiAvailable()).toBe(true);
    setUp(true, AiChatAccessLevels.ENABLED);
    expect(isAdaptiveAiAvailable()).toBe(true);
  });

  it('leaves an unknown level, or no user in the store, to the server', () => {
    setUp(true, undefined);
    expect(isAdaptiveAiAvailable()).toBe(true);
    mockGetStore.mockReturnValue({getState: () => ({})});
    expect(isAdaptiveAiAvailable()).toBe(true);
  });
});
