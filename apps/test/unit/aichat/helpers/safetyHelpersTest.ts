import {type GeneratedFile} from 'ai';

import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {
  getImageModerationStatus,
  isImageSafe,
  isTextSafe,
  checkGeneratedImageSafety,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {generateText} from '@cdo/apps/aiGateway';
import DCDO from '@cdo/apps/dcdo';
import {moderateImage} from '@cdo/apps/util/moderateImage';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
}));

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(modelId => ({modelId})),
}));

jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImage: jest.fn().mockResolvedValue('safe'),
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;
const mockDCDOGet = DCDO.get as jest.MockedFunction<typeof DCDO.get>;
const mockGetModel = getModel as jest.MockedFunction<typeof getModel>;
const mockModerateImage = moderateImage as jest.MockedFunction<
  typeof moderateImage
>;

function mockClassification(classification: string | undefined) {
  mockGenerateText.mockResolvedValue({
    output: classification ? {classification} : undefined,
  } as Awaited<ReturnType<typeof generateText>>);
}

describe('safetyHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDCDOGet.mockReturnValue(true);
  });

  describe('isTextSafe', () => {
    it('returns true when the text is classified OK', async () => {
      mockClassification('OK');

      await expect(isTextSafe('hello class')).resolves.toBe(true);

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining(
            'Here is the text to classify: hello class'
          ),
          output: expect.anything(),
          model: expect.anything(),
        }),
        {phase: undefined}
      );
      expect(mockGetModel).toHaveBeenCalledWith(
        AiChatModelIds.GEMINI_2_5_FLASH
      );
    });

    it('forwards the given phase to the gateway', async () => {
      mockClassification('OK');

      await expect(isTextSafe('hello class', 'input_filter')).resolves.toBe(
        true
      );

      expect(mockGenerateText).toHaveBeenCalledWith(expect.anything(), {
        phase: 'input_filter',
      });
    });

    it('returns false when the text is classified inappropriate', async () => {
      mockClassification('INAPPROPRIATE');

      await expect(isTextSafe('bad text')).resolves.toBe(false);
    });

    it('throws when the classifier returns an invalid value', async () => {
      mockClassification('UNEXPECTED');

      await expect(isTextSafe('hello')).rejects.toThrow(
        'Invalid classification value: UNEXPECTED'
      );
    });
  });

  describe('isImageSafe', () => {
    const file: GeneratedFile = {
      base64: 'abc123',
      uint8Array: new Uint8Array([1, 2, 3]),
      mediaType: 'image/png',
    };

    it('returns true when the image is classified OK', async () => {
      mockClassification('OK');

      await expect(isImageSafe(file)).resolves.toBe(true);

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            {
              role: 'user',
              content: [
                expect.objectContaining({
                  type: 'text',
                  text: expect.stringContaining(
                    'Determine if the image is inappropriate'
                  ),
                }),
                {
                  type: 'file',
                  data: 'abc123',
                  mediaType: 'image/png',
                },
              ],
            },
          ],
          output: expect.anything(),
          model: expect.anything(),
        }),
        {phase: 'llm_safety_judge'}
      );
      expect(mockGetModel).toHaveBeenCalledWith(
        AiChatModelIds.GEMINI_2_5_FLASH
      );
    });

    it('returns false when the image is classified inappropriate', async () => {
      mockClassification('INAPPROPRIATE');

      await expect(isImageSafe(file)).resolves.toBe(false);
    });

    // The DCDO flag gates at the call sites (generateChatResponse for
    // aichat, imageSafety for Sprite Lab in Lab2 with its own flag), so an
    // unconditional call always judges.
    it('judges even when the aichat DCDO flag is off — callers gate', async () => {
      mockDCDOGet.mockReturnValue(false);
      mockClassification('INAPPROPRIATE');

      await expect(isImageSafe(file)).resolves.toBe(false);

      expect(mockGenerateText).toHaveBeenCalled();
    });
  });

  describe('getImageModerationStatus', () => {
    const file: GeneratedFile = {
      base64: 'abc123',
      uint8Array: new Uint8Array([1, 2, 3]),
      mediaType: 'image/png',
    };

    it('attributes moderation of a generated image to the ai-gateway pipeline', async () => {
      await expect(
        getImageModerationStatus(file, '/assets/generated.png')
      ).resolves.toBe('safe');

      expect(mockModerateImage).toHaveBeenCalledWith(
        expect.any(File),
        'aichat',
        expect.objectContaining({feature: 'ai-gateway'}),
        {Violence: 2}
      );
    });
  });

  describe('checkGeneratedImageSafety', () => {
    const file: GeneratedFile = {
      base64: 'abc123',
      uint8Array: new Uint8Array([1, 2, 3]),
      mediaType: 'image/png',
    };

    it('runs Azure and the judge concurrently and reports both', async () => {
      mockModerateImage.mockResolvedValue('safe');
      mockClassification('OK');
      await expect(
        checkGeneratedImageSafety(file, {runLlmJudge: true})
      ).resolves.toEqual({moderation: 'safe', judge: 'ok'});
    });

    it('skips the judge when not asked; Azure still runs', async () => {
      mockModerateImage.mockResolvedValue('safe');
      await expect(
        checkGeneratedImageSafety(file, {runLlmJudge: false})
      ).resolves.toEqual({moderation: 'safe', judge: 'skipped'});
      expect(mockGenerateText).not.toHaveBeenCalled();
      expect(mockModerateImage).toHaveBeenCalled();
    });

    it('a moderation failure reports error, not safe', async () => {
      mockModerateImage.mockRejectedValue(new Error('azure down'));
      mockClassification('OK');
      await expect(
        checkGeneratedImageSafety(file, {runLlmJudge: true})
      ).resolves.toEqual({moderation: 'error', judge: 'ok'});
    });

    it('a judge failure reports error alongside a safe moderation', async () => {
      mockModerateImage.mockResolvedValue('safe');
      mockGenerateText.mockRejectedValue(new Error('judge down'));
      await expect(
        checkGeneratedImageSafety(file, {runLlmJudge: true})
      ).resolves.toEqual({moderation: 'safe', judge: 'error'});
    });
  });
});
