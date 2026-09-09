import {
  checkGeneratedImageSafety,
  isTextSafe,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import DCDO from '@cdo/apps/dcdo';
import {
  checkImageSafety,
  checkPromptSafety,
  ImageSafetyError,
  markHandled,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageSafety';

jest.mock('@cdo/apps/aichat/api/client/helpers/safetyHelpers', () => ({
  isTextSafe: jest.fn(),
  checkGeneratedImageSafety: jest.fn(),
}));
jest.mock('@cdo/apps/dcdo', () => ({get: jest.fn()}));

const raw = {
  uint8Array: new Uint8Array([1, 2, 3]),
  mediaType: 'image/png',
  base64: btoa('\x01\x02\x03'),
};

describe('SpriteLab2 image safety checks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DCDO.get.mockReturnValue(true);
    checkGeneratedImageSafety.mockResolvedValue({
      moderation: 'safe',
      judge: 'ok',
    });
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

  it('a prompt-judge failure propagates — the check fails closed', async () => {
    isTextSafe.mockRejectedValue(new Error('judge down'));
    await expect(checkPromptSafety('anything')).rejects.toThrow('judge down');
  });

  it('a safe image passes, sent with the bytes the gateway returned', async () => {
    await expect(checkImageSafety(raw)).resolves.toBeUndefined();
    expect(checkGeneratedImageSafety).toHaveBeenCalledWith(
      expect.objectContaining({base64: raw.base64, mediaType: 'image/png'}),
      {appName: 'spritelab', runLlmJudge: true}
    );
  });

  it('a moderation-flagged image throws with the image phase', async () => {
    checkGeneratedImageSafety.mockResolvedValue({
      moderation: 'flagged',
      judge: 'ok',
    });
    const error = await checkImageSafety(raw).catch(e => e);
    expect(error).toBeInstanceOf(ImageSafetyError);
    expect(error.phase).toBe('image');
  });

  it('a judge-flagged image throws with the image phase', async () => {
    checkGeneratedImageSafety.mockResolvedValue({
      moderation: 'safe',
      judge: 'flagged',
    });
    await expect(checkImageSafety(raw)).rejects.toBeInstanceOf(
      ImageSafetyError
    );
  });

  it('a moderation error fails closed without flagging the student', async () => {
    checkGeneratedImageSafety.mockResolvedValue({
      moderation: 'error',
      judge: 'ok',
    });
    const error = await checkImageSafety(raw).catch(e => e);
    expect(error).not.toBeInstanceOf(ImageSafetyError);
    expect(error.message).toMatch(/safety check failed/);
  });

  it('the kill switch skips the LLM judges but never Azure', async () => {
    DCDO.get.mockReturnValue(false);
    await checkPromptSafety('anything');
    expect(isTextSafe).not.toHaveBeenCalled();
    await checkImageSafety(raw);
    expect(checkGeneratedImageSafety).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({runLlmJudge: false})
    );
  });

  it('markHandled returns the promise still rejecting when awaited', async () => {
    const failure = markHandled(Promise.reject(new Error('boom')));
    await expect(failure).rejects.toThrow('boom');
  });
});
