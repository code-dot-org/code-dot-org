import {isImageSafe} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {
  EvalGate,
  EvalOutcome,
  EvalResult,
} from '@cdo/apps/aichat/evals/evalTypes';
import {
  rerunOutputImageGate,
  shouldRerunOutputImageGate,
} from '@cdo/apps/aichat/evals/imageSafetyEval';

jest.mock('@cdo/apps/aichat/api/client/helpers/safetyHelpers', () => ({
  isImageSafe: jest.fn(),
  isTextSafe: jest.fn(),
}));

const mockIsImageSafe = isImageSafe as jest.MockedFunction<typeof isImageSafe>;

function result(partial: Partial<EvalResult> = {}): EvalResult {
  return {
    prompt: 'p',
    label: 'l',
    outcome: EvalOutcome.PASSED,
    stoppedAtGate: null,
    moderationStatus: 'safe',
    imageDataUrl: 'data:image/png;base64,AAA=',
    elapsedMs: 0,
    ...partial,
  };
}

describe('shouldRerunOutputImageGate', () => {
  it('targets prior false negatives with safe Azure moderation and images', () => {
    expect(shouldRerunOutputImageGate(result())).toBe(true);
  });

  it('targets rows stopped at output text safety', () => {
    expect(
      shouldRerunOutputImageGate(
        result({
          outcome: EvalOutcome.BLOCKED,
          stoppedAtGate: EvalGate.OUTPUT_TEXT,
        })
      )
    ).toBe(true);
  });

  it('skips rows that did not reach the new gate', () => {
    expect(
      shouldRerunOutputImageGate(
        result({
          outcome: EvalOutcome.BLOCKED,
          stoppedAtGate: EvalGate.IMAGE_MODERATION,
        })
      )
    ).toBe(false);
  });

  it('skips rows already checked by the output image gate', () => {
    expect(
      shouldRerunOutputImageGate(result({outputImageSafetyStatus: 'safe'}))
    ).toBe(false);
  });

  it('skips rows without a generated image', () => {
    expect(shouldRerunOutputImageGate(result({imageDataUrl: undefined}))).toBe(
      false
    );
  });
});

describe('rerunOutputImageGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs the output image gate against saved report images', async () => {
    mockIsImageSafe.mockResolvedValue(false);

    const updated = await rerunOutputImageGate([result()], {maxRetries: 0});

    expect(mockIsImageSafe).toHaveBeenCalledTimes(1);
    expect(mockIsImageSafe).toHaveBeenCalledWith(
      expect.objectContaining({
        base64: 'AAA=',
        mediaType: 'image/png',
        uint8Array: expect.any(Uint8Array),
      })
    );
    expect(updated[0]).toMatchObject({
      outcome: EvalOutcome.BLOCKED,
      stoppedAtGate: EvalGate.OUTPUT_IMAGE,
      outputImageSafetyStatus: 'flagged',
    });
  });

  it('keeps the original row when the saved image is safe', async () => {
    mockIsImageSafe.mockResolvedValue(true);

    const updated = await rerunOutputImageGate([result()], {maxRetries: 0});

    expect(updated[0]).toMatchObject({
      outcome: EvalOutcome.PASSED,
      stoppedAtGate: null,
      outputImageSafetyStatus: 'safe',
    });
  });
});
