import shouldUseAiGateway, {
  setAiGatewayOptIn,
} from '@cdo/apps/aichat/api/shouldUseAiGateway';
import experiments from '@cdo/apps/util/experiments';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/util/experiments', () => ({
  __esModule: true,
  default: {
    USE_AI_GATEWAY: 'useAiGateway',
    isEnabledAllowingQueryString: jest.fn(),
  },
}));
const mockExperiment = experiments.isEnabledAllowingQueryString as jest.Mock;

describe('shouldUseAiGateway', () => {
  beforeEach(() => {
    mockExperiment.mockReturnValue(false);
    setAiGatewayOptIn(false);
  });

  it('routes a Gemini model through the gateway when the host opts in', () => {
    expect(shouldUseAiGateway(AiChatModelIds.GEMINI_2_5_FLASH)).toBe(false);
    setAiGatewayOptIn(true);
    expect(shouldUseAiGateway(AiChatModelIds.GEMINI_2_5_FLASH)).toBe(true);
  });

  it('never routes a SageMaker model, whoever asks', () => {
    setAiGatewayOptIn(true);
    mockExperiment.mockReturnValue(true);
    expect(shouldUseAiGateway(AiChatModelIds.MISTRAL)).toBe(false);
  });

  it('always routes a model Rails cannot serve', () => {
    expect(shouldUseAiGateway(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE)).toBe(
      true
    );
    expect(shouldUseAiGateway(AiChatModelIds.GPT_5_6_LUNA)).toBe(true);
    expect(shouldUseAiGateway(AiChatModelIds.GPT_6_LUNA)).toBe(true);
  });

  it('leaves gpt-4o-mini on Rails', () => {
    setAiGatewayOptIn(true);
    mockExperiment.mockReturnValue(true);
    expect(shouldUseAiGateway(AiChatModelIds.CHATGPT)).toBe(false);
  });

  it('still honours the experiment on its own', () => {
    mockExperiment.mockReturnValue(true);
    expect(shouldUseAiGateway(AiChatModelIds.GEMINI_2_5_FLASH)).toBe(true);
  });
});
