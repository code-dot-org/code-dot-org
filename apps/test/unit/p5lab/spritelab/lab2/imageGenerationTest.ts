import {
  generateImage as gatewayGenerateImage,
  generateText,
} from '@cdo/apps/aiGateway';
import {generateImage} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
  generateImage: jest.fn(),
}));

const mockGenerateText = generateText as jest.Mock;
const mockGatewayGenerateImage = gatewayGenerateImage as jest.Mock;

// The OpenAI model rides the gateway's generateImage route instead.
const OPENAI_OPTIONS = {
  imageType: 'background',
  style: 'smooth',
  model: AiChatModelIds.GPT_IMAGE_1,
} as const;

// A smooth-style background delivered as JPEG (no alpha) skips the canvas
// post-processing, which jsdom can't run; these tests exercise the
// request/metadata plumbing only.
const OPTIONS = {imageType: 'background', style: 'smooth'} as const;

describe('generateImage', () => {
  beforeEach(() => {
    mockGenerateText.mockReset();
    mockGenerateText.mockResolvedValue({
      files: [{mediaType: 'image/jpeg', uint8Array: new Uint8Array([1, 2, 3])}],
    });
    mockGatewayGenerateImage.mockReset();
    mockGatewayGenerateImage.mockResolvedValue({
      image: {
        mediaType: 'image/jpeg',
        base64: 'AQID',
        uint8Array: new Uint8Array([1, 2, 3]),
      },
      images: [],
      warnings: [],
    });
  });

  it('rolls an integer seed when none is given, and reports it', async () => {
    const {generation} = await generateImage('a beach', OPTIONS);
    const sent = mockGenerateText.mock.calls[0][0];
    expect(Number.isInteger(sent.seed)).toBe(true);
    expect(sent.seed).toBeGreaterThanOrEqual(0);
    expect(generation.seed).toBe(sent.seed);
  });

  it('replays a given seed and forwards temperature', async () => {
    const {generation} = await generateImage('a beach', {
      ...OPTIONS,
      seed: 1234,
      temperature: 1.5,
    });
    const sent = mockGenerateText.mock.calls[0][0];
    expect(sent.seed).toBe(1234);
    expect(sent.temperature).toBe(1.5);
    expect(generation).toMatchObject({
      prompt: 'a beach',
      imageType: 'background',
      style: 'smooth',
      seed: 1234,
      temperature: 1.5,
    });
    expect(generation.editedPrevious).toBeUndefined();
  });

  it('omits temperature from the request unless given', async () => {
    await generateImage('a beach', OPTIONS);
    expect('temperature' in mockGenerateText.mock.calls[0][0]).toBe(false);
  });

  it('sends the previous image as an image part when editing', async () => {
    const dataURI = 'data:image/png;base64,AAAA';
    const {generation} = await generateImage('add a lighthouse', {
      ...OPTIONS,
      inputImageDataURI: dataURI,
    });
    const content = mockGenerateText.mock.calls[0][0].messages[0].content;
    expect(content[0]).toEqual({type: 'image', image: dataURI});
    expect(content[1].type).toBe('text');
    expect(content[1].text).toContain('Modify the provided image');
    expect(content[1].text).toContain('add a lighthouse');
    expect(generation.editedPrevious).toBe(true);
  });

  it('sends a plain text message when not editing', async () => {
    await generateImage('a beach', OPTIONS);
    const content = mockGenerateText.mock.calls[0][0].messages[0].content;
    expect(typeof content).toBe('string');
    expect(content).toContain('a beach');
  });

  it('records the default model when none is chosen', async () => {
    const {generation} = await generateImage('a beach', OPTIONS);
    expect(generation.model).toBe(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
  });

  describe('on a model reached through generateImage', () => {
    it('uses the image route, not the text route', async () => {
      await generateImage('a beach', OPENAI_OPTIONS);
      expect(mockGenerateText).not.toHaveBeenCalled();
      expect(mockGatewayGenerateImage).toHaveBeenCalledTimes(1);
      const sent = mockGatewayGenerateImage.mock.calls[0][0];
      expect(sent.model).toBe(AiChatModelIds.GPT_IMAGE_1);
      expect(sent.size).toBe('1024x1024');
    });

    it('records the model it used', async () => {
      const {generation} = await generateImage('a beach', OPENAI_OPTIONS);
      expect(generation.model).toBe(AiChatModelIds.GPT_IMAGE_1);
    });

    it('neither sends nor records a seed the model cannot replay', async () => {
      const {generation} = await generateImage('a beach', {
        ...OPENAI_OPTIONS,
        seed: 1234,
      });
      expect('seed' in mockGatewayGenerateImage.mock.calls[0][0]).toBe(false);
      expect(generation.seed).toBeUndefined();
    });

    it('drops a temperature the model has no parameter for', async () => {
      const {generation} = await generateImage('a beach', {
        ...OPENAI_OPTIONS,
        temperature: 1.5,
      });
      expect('temperature' in mockGatewayGenerateImage.mock.calls[0][0]).toBe(
        false
      );
      expect(generation.temperature).toBeUndefined();
    });

    it('splits the previous image into base64 and media type when editing', async () => {
      const {generation} = await generateImage('add a lighthouse', {
        ...OPENAI_OPTIONS,
        inputImageDataURI: 'data:image/png;base64,AAAA',
      });
      const sent = mockGatewayGenerateImage.mock.calls[0][0];
      expect(sent.images).toEqual([{mediaType: 'image/png', base64: 'AAAA'}]);
      expect(sent.prompt).toContain('Modify the provided image');
      expect(sent.prompt).toContain('add a lighthouse');
      expect(generation.editedPrevious).toBe(true);
    });

    it('asks for a transparent background on a sprite, opaque on a background', async () => {
      // A sprite goes through the canvas tail, which jsdom cannot run; the
      // request has already left by the time that throws.
      await generateImage('a dragon', {
        ...OPENAI_OPTIONS,
        imageType: 'sprite',
      }).catch(() => undefined);
      const sprite = mockGatewayGenerateImage.mock.calls[0][0];
      expect(sprite.providerOptions.openai.background).toBe('transparent');
      // Transparency is requested as a parameter, so the prompt must not also
      // ask for the flat key color the Gemini path floods out.
      expect(sprite.prompt).toContain('fully transparent background');
      expect(sprite.prompt).not.toContain('flat color');

      mockGatewayGenerateImage.mockClear();
      await generateImage('a beach', OPENAI_OPTIONS);
      expect(
        mockGatewayGenerateImage.mock.calls[0][0].providerOptions.openai
          .background
      ).toBe('opaque');
    });
  });
});
