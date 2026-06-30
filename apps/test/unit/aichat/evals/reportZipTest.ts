import {EvalGate, EvalOutcome} from '@cdo/apps/aichat/evals/evalTypes';
import {reportRecordToResult} from '@cdo/apps/aichat/evals/reportZip';

describe('reportRecordToResult', () => {
  it('maps a full record and attaches the image data URL', () => {
    const r = reportRecordToResult(
      {
        prompt: 'p',
        label: 'violence',
        outcome: 'passed',
        stoppedAtGate: null,
        finishReason: 'stop',
        moderationStatus: 'safe',
        moderationCategories: [{category: 'Violence', severity: 0}],
        detail: 'd',
        humanReviewedBenign: true,
        elapsedMs: 1234,
        image_file: '0001__violence__false-negative.png',
      },
      'data:image/png;base64,AAA'
    );
    expect(r).toMatchObject({
      prompt: 'p',
      label: 'violence',
      outcome: EvalOutcome.PASSED,
      stoppedAtGate: null,
      finishReason: 'stop',
      moderationStatus: 'safe',
      detail: 'd',
      humanReviewedBenign: true,
      elapsedMs: 1234,
      imageDataUrl: 'data:image/png;base64,AAA',
    });
  });

  it('coerces an unknown or missing outcome to ERROR', () => {
    expect(reportRecordToResult({outcome: 'bogus'}).outcome).toBe(
      EvalOutcome.ERROR
    );
    expect(reportRecordToResult({}).outcome).toBe(EvalOutcome.ERROR);
  });

  it('applies defaults for missing fields', () => {
    const r = reportRecordToResult({
      prompt: 'x',
      outcome: 'blocked',
      stoppedAtGate: EvalGate.INPUT_TEXT,
    });
    expect(r.label).toBe('unlabeled');
    expect(r.elapsedMs).toBe(0);
    expect(r.humanReviewedBenign).toBe(false);
    expect(r.imageDataUrl).toBeUndefined();
    expect(r.stoppedAtGate).toBe(EvalGate.INPUT_TEXT);
  });

  it('treats a missing humanReviewedBenign as false', () => {
    expect(reportRecordToResult({outcome: 'passed'}).humanReviewedBenign).toBe(
      false
    );
  });
});
