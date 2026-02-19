import {validateModelId} from '@cdo/apps/aichat/views/modelCustomization/utils';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const SUPPORTED_IDS = [AiChatModelIds.MISTRAL, AiChatModelIds.CHATGPT];
const UNSUPPORTED_ID = 'deprecated-model-id' as ValueOf<typeof AiChatModelIds>;

describe('validateModelId', () => {
  describe('when the model ID is supported', () => {
    it('returns isValid: true with the same modelId when no allowedModelIds are provided', () => {
      expect(
        validateModelId(AiChatModelIds.MISTRAL, undefined, SUPPORTED_IDS)
      ).toEqual({
        isValid: true,
        modelId: AiChatModelIds.MISTRAL,
      });
    });

    it('returns isValid: true when the model ID is in allowedModelIds', () => {
      expect(
        validateModelId(
          AiChatModelIds.CHATGPT,
          [AiChatModelIds.CHATGPT],
          SUPPORTED_IDS
        )
      ).toEqual({
        isValid: true,
        modelId: AiChatModelIds.CHATGPT,
      });
    });
  });

  describe('when the model ID is invalid', () => {
    it('returns isValid: false when the model ID is not in supportedModelIds', () => {
      const result = validateModelId(UNSUPPORTED_ID, undefined, SUPPORTED_IDS);

      expect(result.isValid).toBe(false);
    });

    it('returns isValid: false when the model ID is supported but not in allowedModelIds', () => {
      const result = validateModelId(
        AiChatModelIds.MISTRAL,
        [AiChatModelIds.CHATGPT],
        SUPPORTED_IDS
      );

      expect(result.isValid).toBe(false);
    });

    it('corrects to the first supported model when no allowedModelIds are provided', () => {
      const result = validateModelId(UNSUPPORTED_ID, undefined, SUPPORTED_IDS);

      expect(result.modelId).toBe(SUPPORTED_IDS[0]);
    });

    it('corrects to the first model that is both supported and in allowedModelIds', () => {
      const result = validateModelId(
        UNSUPPORTED_ID,
        [AiChatModelIds.CHATGPT],
        SUPPORTED_IDS
      );

      expect(result.modelId).toBe(AiChatModelIds.CHATGPT);
    });
  });

  describe('when there is no overlap between allowedModelIds and supportedModelIds', () => {
    it('returns isValid: false', () => {
      const result = validateModelId(
        UNSUPPORTED_ID,
        [AiChatModelIds.MISTRAL],
        [AiChatModelIds.CHATGPT]
      );

      expect(result.isValid).toBe(false);
    });

    it('falls back to the first supported model', () => {
      const result = validateModelId(
        UNSUPPORTED_ID,
        [AiChatModelIds.MISTRAL],
        [AiChatModelIds.CHATGPT]
      );

      expect(result.modelId).toBe(AiChatModelIds.CHATGPT);
    });
  });
});
