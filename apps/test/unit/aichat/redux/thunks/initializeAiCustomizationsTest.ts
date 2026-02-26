import {setInitialConfiguration} from '@cdo/apps/aichat/redux/slice';
import {initializeAiCustomizations} from '@cdo/apps/aichat/redux/thunks/initializeAiCustomizations';
import {sendAnalytics} from '@cdo/apps/aichat/redux/thunks/sendAnalytics';
import {
  AiCustomizations,
  LevelAichatSettings,
  Visibility,
} from '@cdo/apps/aichat/types';
import {
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
  EMPTY_MODEL_CARD_INFO,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {validateModelId} from '@cdo/apps/aichat/views/modelCustomization/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aichat/redux/thunks/sendAnalytics', () => ({
  sendAnalytics: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/views/modelCustomization/utils', () => ({
  validateModelId: jest.fn(),
}));

const mockSendAnalytics = sendAnalytics as jest.Mock;
const mockValidateModelId = validateModelId as jest.Mock;

const studentCustomizations: AiCustomizations = {
  selectedModelId: AiChatModelIds.MISTRAL,
  temperature: 0.8,
  systemPrompt: 'Student system prompt',
  retrievalContexts: ['student context'],
  modelCardInfo: EMPTY_MODEL_CARD_INFO,
};

const makeLevelSettings = (
  overrides: Partial<LevelAichatSettings> = {}
): LevelAichatSettings => ({
  initialCustomizations: EMPTY_AI_CUSTOMIZATIONS,
  visibilities: DEFAULT_VISIBILITIES,
  levelSystemPrompt: '',
  hidePresentationPanel: false,
  availableModelIds: [AiChatModelIds.MISTRAL, AiChatModelIds.CHATGPT],
  ...overrides,
});

describe('initializeAiCustomizations', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
    mockSendAnalytics.mockClear();
    // Default: model is valid, model ID is unchanged
    mockValidateModelId.mockReturnValue({
      isValid: true,
      modelId: EMPTY_AI_CUSTOMIZATIONS.selectedModelId,
    });
  });

  describe('without levelAichatSettings', () => {
    it('dispatches setInitialConfiguration with DEFAULT_VISIBILITIES', () => {
      initializeAiCustomizations(studentCustomizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration({
          customizations: expect.any(Object),
          visibilities: DEFAULT_VISIBILITIES,
          showUnsupportedModelMessage: false,
        })
      );
    });

    it('uses EMPTY_AI_CUSTOMIZATIONS as the base, so the student selected model ID is ignored', () => {
      initializeAiCustomizations({
        ...studentCustomizations,
        selectedModelId: AiChatModelIds.CHATGPT,
      })(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({
            customizations: expect.objectContaining({
              selectedModelId: EMPTY_AI_CUSTOMIZATIONS.selectedModelId,
            }),
          })
        )
      );
    });

    it('uses student values for editable fields', () => {
      initializeAiCustomizations(studentCustomizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({
            customizations: expect.objectContaining({
              temperature: studentCustomizations.temperature,
              systemPrompt: studentCustomizations.systemPrompt,
              retrievalContexts: studentCustomizations.retrievalContexts,
            }),
          })
        )
      );
    });
  });

  describe('with levelAichatSettings', () => {
    it('uses levelAichatSettings visibilities', () => {
      const customVisibilities = {
        ...DEFAULT_VISIBILITIES,
        systemPrompt: Visibility.HIDDEN,
      };
      const levelSettings = makeLevelSettings({
        visibilities: customVisibilities,
      });

      initializeAiCustomizations(
        studentCustomizations,
        levelSettings
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({visibilities: customVisibilities})
        )
      );
    });

    it('uses student values for editable fields over level settings', () => {
      const levelSettings = makeLevelSettings({
        initialCustomizations: {
          ...EMPTY_AI_CUSTOMIZATIONS,
          temperature: 0.3,
          systemPrompt: 'Level system prompt',
        },
      });

      initializeAiCustomizations(
        studentCustomizations,
        levelSettings
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({
            customizations: expect.objectContaining({
              temperature: studentCustomizations.temperature,
              systemPrompt: studentCustomizations.systemPrompt,
            }),
          })
        )
      );
    });

    it('ignores student values for readonly or hidden level fields', () => {
      const levelSettings = makeLevelSettings({
        initialCustomizations: {
          ...EMPTY_AI_CUSTOMIZATIONS,
          temperature: 0.3,
          systemPrompt: 'Level system prompt',
        },
        visibilities: {
          ...DEFAULT_VISIBILITIES,
          temperature: Visibility.READONLY,
          systemPrompt: Visibility.HIDDEN,
        },
      });

      initializeAiCustomizations(
        studentCustomizations,
        levelSettings
      )(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({
            customizations: expect.objectContaining({
              temperature: 0.3,
              systemPrompt: 'Level system prompt',
            }),
          })
        )
      );
    });
  });

  describe('model validation', () => {
    it('sets showUnsupportedModelMessage to false when model ID is valid', () => {
      initializeAiCustomizations(studentCustomizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({showUnsupportedModelMessage: false})
        )
      );
      expect(mockSendAnalytics).not.toHaveBeenCalled();
    });

    it('sets showUnsupportedModelMessage to true when model ID is invalid', () => {
      mockValidateModelId.mockReturnValue({
        isValid: false,
        modelId: AiChatModelIds.CHATGPT,
      });

      initializeAiCustomizations(studentCustomizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({showUnsupportedModelMessage: true})
        )
      );
    });

    it('uses the corrected modelId returned by validateModelId', () => {
      mockValidateModelId.mockReturnValue({
        isValid: false,
        modelId: AiChatModelIds.CHATGPT,
      });

      initializeAiCustomizations(studentCustomizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setInitialConfiguration(
          expect.objectContaining({
            customizations: expect.objectContaining({
              selectedModelId: AiChatModelIds.CHATGPT,
            }),
          })
        )
      );
    });

    it('dispatches sendAnalytics with previousModelId and correctedModelId when model ID is invalid', () => {
      const levelSettings = makeLevelSettings({
        visibilities: {
          ...DEFAULT_VISIBILITIES,
          selectedModelId: Visibility.EDITABLE,
        },
      });

      const mockAnalyticsThunk = jest.fn();
      mockSendAnalytics.mockReturnValue(mockAnalyticsThunk);
      mockValidateModelId.mockReturnValue({
        isValid: false,
        modelId: AiChatModelIds.CHATGPT,
      });

      const deprecatedModelId = 'deprecated-model-id' as ValueOf<
        typeof AiChatModelIds
      >;

      initializeAiCustomizations(
        {
          ...studentCustomizations,
          selectedModelId: deprecatedModelId,
        },
        levelSettings
      )(dispatch);

      expect(mockSendAnalytics).toHaveBeenCalledWith(
        EVENTS.AICHAT_UNSUPPORTED_MODEL_SELECTED,
        {
          previousModelId: deprecatedModelId,
          correctedModelId: AiChatModelIds.CHATGPT,
        }
      );
      expect(dispatch).toHaveBeenCalledWith(mockAnalyticsThunk);
    });
  });
});
