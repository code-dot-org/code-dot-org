import {
  isImageSafe,
  isTextSafe,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import DCDO from '@cdo/apps/dcdo';
import {
  checkImageSafety,
  checkPromptSafety,
  ImageSafetyError,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety';

jest.mock('@cdo/apps/aichat/api/client/helpers/safetyHelpers', () => ({
  isTextSafe: jest.fn(),
  isImageSafe: jest.fn(),
}));
jest.mock('@cdo/apps/dcdo', () => ({get: jest.fn()}));

const raw = {uint8Array: new Uint8Array([1, 2, 3]), mediaType: 'image/png'};

describe('SpriteLab2 image safety checks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DCDO.get.mockReturnValue(true);
  });

  it('a safe prompt passes', async () => {
    isTextSafe.mockResolvedValue(true);
    await expect(checkPromptSafety('a nice dog')).resolves.toBeUndefined();
    expect(isTextSafe).toHaveBeenCalledWith('a nice dog', 'input_filter');
  });

  it('a flagged prompt throws with the prompt phase', async () => {
    isTextSafe.mockResolvedValue(false);
    const error = await checkPromptSafety('bad').catch(e => e);
    expect(error).toBeInstanceOf(ImageSafetyError);
    expect(error.phase).toBe('prompt');
  });

  it('a safe image passes, judged from its bytes', async () => {
    isImageSafe.mockResolvedValue(true);
    await expect(checkImageSafety(raw)).resolves.toBeUndefined();
    expect(isImageSafe).toHaveBeenCalledWith(
      expect.objectContaining({
        base64: btoa('\x01\x02\x03'),
        mediaType: 'image/png',
      })
    );
  });

  it('a flagged image throws with the image phase', async () => {
    isImageSafe.mockResolvedValue(false);
    const error = await checkImageSafety(raw).catch(e => e);
    expect(error).toBeInstanceOf(ImageSafetyError);
    expect(error.phase).toBe('image');
  });

  it('a judge failure propagates — the check fails closed', async () => {
    isTextSafe.mockRejectedValue(new Error('judge down'));
    await expect(checkPromptSafety('anything')).rejects.toThrow('judge down');
  });

  it('the kill switch skips both judges', async () => {
    DCDO.get.mockReturnValue(false);
    await checkPromptSafety('anything');
    await checkImageSafety(raw);
    expect(isTextSafe).not.toHaveBeenCalled();
    expect(isImageSafe).not.toHaveBeenCalled();
  });
});
