import {beforeEach, describe, expect, it, vi} from 'vitest';

import * as Observability from '@code-dot-org/core/plugins/observability';
import {checkGeneratedImageSafety, isTextSafe} from '@code-dot-org/lab/ai';

import {
  checkImageSafety,
  checkPromptSafety,
  ImageSafetyError,
  isImageSafetyEnabled,
  markHandled,
} from '../imageSafety';

vi.mock('@code-dot-org/lab/ai', async importOriginal => ({
  ...(await importOriginal<typeof import('@code-dot-org/lab/ai')>()),
  isTextSafe: vi.fn(),
  checkGeneratedImageSafety: vi.fn(),
}));
vi.mock('@code-dot-org/core/plugins/observability', async importOriginal => ({
  ...(await importOriginal<
    typeof import('@code-dot-org/core/plugins/observability')
  >()),
  metrics: {count: vi.fn(), gauge: vi.fn(), distribution: vi.fn()},
}));

const mockIsTextSafe = vi.mocked(isTextSafe);
const mockCheckImage = vi.mocked(checkGeneratedImageSafety);

const raw = {
  uint8Array: new Uint8Array([1, 2, 3]),
  mediaType: 'image/png',
  base64: btoa('\x01\x02\x03'),
};

describe('SpriteLab2 image safety checks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckImage.mockResolvedValue({moderation: 'safe', judge: 'ok'});
  });

  it('keeps the LLM judges on: frontend has no DCDO to turn them off', () => {
    expect(isImageSafetyEnabled()).toBe(true);
  });

  it('a safe prompt passes', async () => {
    mockIsTextSafe.mockResolvedValue(true);
    await expect(checkPromptSafety('a nice dog')).resolves.toBeUndefined();
    expect(mockIsTextSafe).toHaveBeenCalledWith('a nice dog', 'input_filter');
  });

  it('a flagged prompt throws with the prompt phase', async () => {
    mockIsTextSafe.mockResolvedValue(false);
    const error = await checkPromptSafety('bad').catch(e => e);
    expect(error).toBeInstanceOf(ImageSafetyError);
    expect(error.phase).toBe('prompt');
  });

  it('a prompt-judge failure propagates — the check fails closed', async () => {
    mockIsTextSafe.mockRejectedValue(new Error('judge down'));
    await expect(checkPromptSafety('anything')).rejects.toThrow('judge down');
  });

  it('a safe image passes, sent with the bytes the gateway returned', async () => {
    await expect(checkImageSafety(raw)).resolves.toBeUndefined();
    expect(mockCheckImage).toHaveBeenCalledWith(
      expect.objectContaining({base64: raw.base64, mediaType: 'image/png'}),
      {runLlmJudge: true},
    );
  });

  it('a moderation-flagged image throws with the image phase', async () => {
    mockCheckImage.mockResolvedValue({moderation: 'flagged', judge: 'ok'});
    const error = await checkImageSafety(raw).catch(e => e);
    expect(error).toBeInstanceOf(ImageSafetyError);
    expect(error.phase).toBe('image');
  });

  it('a judge-flagged image throws with the image phase', async () => {
    mockCheckImage.mockResolvedValue({moderation: 'safe', judge: 'flagged'});
    await expect(checkImageSafety(raw)).rejects.toBeInstanceOf(
      ImageSafetyError,
    );
  });

  it('a moderation error fails closed without flagging the student', async () => {
    mockCheckImage.mockResolvedValue({moderation: 'error', judge: 'ok'});
    const error = await checkImageSafety(raw).catch(e => e);
    expect(error).not.toBeInstanceOf(ImageSafetyError);
    expect(error.message).toMatch(/safety check failed/);
  });

  it('reports both verdicts on one count, for the disagreement matrix', async () => {
    mockCheckImage.mockResolvedValue({moderation: 'safe', judge: 'flagged'});
    await checkImageSafety(raw).catch(() => {});
    expect(Observability.metrics.count).toHaveBeenCalledWith(
      'spritelab-lab2.image_safety',
      1,
      expect.objectContaining({moderation: 'safe', judge: 'flagged'}),
    );
  });

  it('markHandled returns the promise still rejecting when awaited', async () => {
    const failure = markHandled(Promise.reject(new Error('boom')));
    await expect(failure).rejects.toThrow('boom');
  });
});
