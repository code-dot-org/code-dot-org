import {
  EvalGate,
  EvalOutcome,
  EvalResult,
} from '@cdo/apps/aichat/evals/evalTypes';
import {shouldRerunOutputImageGate} from '@cdo/apps/aichat/evals/imageSafetyEval';

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
