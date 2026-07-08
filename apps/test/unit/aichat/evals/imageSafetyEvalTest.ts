import {
  isImageSafe,
  isTextSafe,
} from '@cdo/apps/aichat/api/client/helpers/safetyHelpers';
import {
  EvalGate,
  EvalOutcome,
  EvalResult,
} from '@cdo/apps/aichat/evals/evalTypes';
import {
  evaluatePrompt,
  rerunOutputImageGate,
  shouldRerunOutputImageGate,
} from '@cdo/apps/aichat/evals/imageSafetyEval';
import {generateText} from '@cdo/apps/aiGateway';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/aiGateway', () => ({
  generateText: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/api/client/helpers/safetyHelpers', () => ({
  isImageSafe: jest.fn(),
  isTextSafe: jest.fn(),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  isNetworkError: jest.fn(() => false),
  default: {
    post: jest.fn(),
  },
}));

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;
const mockIsImageSafe = isImageSafe as jest.MockedFunction<typeof isImageSafe>;
const mockIsTextSafe = isTextSafe as jest.MockedFunction<typeof isTextSafe>;
const mockHttpPost = HttpClient.post as jest.MockedFunction<
  typeof HttpClient.post
>;

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

  it('targets output image gate errors with saved images', () => {
    expect(
      shouldRerunOutputImageGate(
        result({
          outcome: EvalOutcome.ERROR,
          stoppedAtGate: EvalGate.OUTPUT_IMAGE,
          outputImageSafetyStatus: 'error',
        })
      )
    ).toBe(true);
  });

  it('skips rows without a generated image', () => {
    expect(shouldRerunOutputImageGate(result({imageDataUrl: undefined}))).toBe(
      false
    );
  });
});

describe('evaluatePrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves image context when the output image judge errors', async () => {
    mockIsTextSafe.mockResolvedValue(true);
    mockIsImageSafe.mockRejectedValue(new Error('judge unavailable'));
    mockGenerateText.mockResolvedValue({
      text: '',
      finishReason: 'stop',
      files: [
        {
          mediaType: 'image/png',
          base64: 'AAA=',
          uint8Array: new Uint8Array([0]),
        },
      ],
    } as Awaited<ReturnType<typeof generateText>>);
    mockHttpPost.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        categoriesAnalysis: [{category: 'Violence', severity: 0}],
      }),
    } as unknown as Response);

    const updated = await evaluatePrompt({prompt: 'p', label: 'l'});

    expect(updated).toMatchObject({
      outcome: EvalOutcome.ERROR,
      stoppedAtGate: EvalGate.OUTPUT_IMAGE,
      imageDataUrl: 'data:image/png;base64,AAA=',
      moderationStatus: 'safe',
      moderationCategories: [{category: 'Violence', severity: 0}],
      outputImageSafetyStatus: 'error',
      detail: 'judge unavailable',
    });
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
