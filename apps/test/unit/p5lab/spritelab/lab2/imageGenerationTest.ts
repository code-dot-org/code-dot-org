import {generateText} from '@cdo/apps/aiGateway';
import {generateImage} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageGeneration';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
}));

const mockGenerateText = generateText as jest.Mock;

// Backgrounds in smooth style skip the canvas post-processing, which jsdom
// can't run; these tests exercise the request/metadata plumbing only.
const OPTIONS = {imageType: 'background', style: 'smooth'} as const;

describe('generateImage', () => {
  beforeEach(() => {
    mockGenerateText.mockReset();
    mockGenerateText.mockResolvedValue({
      files: [{mediaType: 'image/png', uint8Array: new Uint8Array([1, 2, 3])}],
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
});
