import {type GeneratedFile} from 'ai';

import {
  announcedImageIsMissing,
  redrawAnnouncedImage,
} from '@cdo/apps/aichat/api/client/helpers/imageHelpers';
import {getModel} from '@cdo/apps/aichat/api/client/helpers/modelHelpers';
import {ModelParameters} from '@cdo/apps/aichat/types';
import {generateText} from '@cdo/apps/aiGateway';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(modelId => ({modelId})),
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;

const imageModelParameters: ModelParameters = {
  selectedModelId: AiChatModelIds.GEMINI_2_5_FLASH_IMAGE,
  temperature: 0.5,
  systemPrompt: '',
  retrievalContexts: [],
};

const file = {mediaType: 'image/png'} as GeneratedFile;

describe('imageHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('announcedImageIsMissing', () => {
    // Replies taken from student sessions where no image was produced.
    it.each([
      "Okay, I'm making a super healthy salad with lots of good stuff! How about this to start? \n\n",
      "Here's a picture to get us started:\n\n",
      "Got it! Here's an image of a salad: \n\n",
    ])('is true for an announcement that stops mid-thought: %j', text => {
      expect(announcedImageIsMissing(imageModelParameters, [], text)).toBe(
        true
      );
    });

    // Replies from the same sessions that were correctly text-only.
    it.each([
      'Got it! To make sure I create the perfect healthy salad image for you, could you tell me:\n\n1. What specific healthy ingredients do you imagine on this salad?',
      "Got it! Here's a hockey player. Is there anything else you'd like to change or add to this image?",
    ])('is false for a turn that ends on punctuation: %j', text => {
      expect(announcedImageIsMissing(imageModelParameters, [], text)).toBe(
        false
      );
    });

    it('is false when the model did produce a file', () => {
      expect(
        announcedImageIsMissing(
          imageModelParameters,
          [file],
          'Here you go: \n\n'
        )
      ).toBe(false);
    });

    it('is false for a model that does not generate images', () => {
      expect(
        announcedImageIsMissing(
          {...imageModelParameters, selectedModelId: AiChatModelIds.CHATGPT},
          [],
          'Here you go: \n\n'
        )
      ).toBe(false);
    });

    it('is false for an empty reply', () => {
      expect(announcedImageIsMissing(imageModelParameters, [], '')).toBe(false);
    });
  });

  describe('redrawAnnouncedImage', () => {
    it('redraws from a bare prompt, sending no conversation history', async () => {
      mockGenerateText.mockResolvedValue({files: [file]} as Awaited<
        ReturnType<typeof generateText>
      >);

      await expect(
        redrawAnnouncedImage(
          imageModelParameters,
          'Here are those fireworks:\n\n',
          'make me an image of fireworks'
        )
      ).resolves.toEqual([file]);

      const [options] = mockGenerateText.mock.calls[0];
      expect(options.messages).toBeUndefined();
      expect(options.prompt).toContain('Here are those fireworks:');
      expect(options.prompt).toContain('make me an image of fireworks');
      expect(options.model).toEqual(
        getModel(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE)
      );
    });

    it('returns no files when the redraw also comes back empty', async () => {
      mockGenerateText.mockResolvedValue({files: []} as unknown as Awaited<
        ReturnType<typeof generateText>
      >);

      await expect(
        redrawAnnouncedImage(imageModelParameters, 'Here you go: \n\n', 'a cat')
      ).resolves.toEqual([]);
    });
  });
});
