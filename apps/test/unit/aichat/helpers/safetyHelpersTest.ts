import {type GeneratedFile} from 'ai';

import {
  isImageSafe,
  isTextSafe,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {generateText} from '@cdo/apps/aiGateway';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;

function mockClassification(classification: string | undefined) {
  mockGenerateText.mockResolvedValue({
    output: classification ? {classification} : undefined,
  } as Awaited<ReturnType<typeof generateText>>);
}

describe('safetyHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        })
      );
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
        })
      );
    });

    it('returns false when the image is classified inappropriate', async () => {
      mockClassification('INAPPROPRIATE');

      await expect(isImageSafe(file)).resolves.toBe(false);
    });
  });
});
