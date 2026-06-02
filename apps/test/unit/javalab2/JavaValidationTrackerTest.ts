import JavaValidationTracker from '@cdo/apps/javalab/lab2/progress/JavaValidationTracker';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';

describe('JavaValidationTracker', () => {
  const RESULTS: ValidationResult[] = [
    {message: 'Test.one', result: 'PASS'},
    {message: 'Test.two', result: 'FAIL'},
  ];

  it('stores and returns validation results', () => {
    const tracker = new JavaValidationTracker();
    tracker.setValidationResults(RESULTS);
    expect(tracker.getValidationResults()).toEqual(RESULTS);
  });

  it('reset with isChangingLevels clears results', () => {
    const tracker = new JavaValidationTracker();
    tracker.setValidationResults(RESULTS);
    tracker.reset(true);
    expect(tracker.getValidationResults()).toBeUndefined();
  });

  it('reset without isChangingLevels keeps names but sets results to PENDING', () => {
    const tracker = new JavaValidationTracker();
    tracker.setValidationResults(RESULTS);
    tracker.reset(false);
    expect(tracker.getValidationResults()).toEqual([
      {message: 'Test.one', result: 'PENDING'},
      {message: 'Test.two', result: 'PENDING'},
    ]);
  });

  it('reset without prior results leaves results undefined', () => {
    const tracker = new JavaValidationTracker();
    tracker.reset(false);
    expect(tracker.getValidationResults()).toBeUndefined();
  });
});
