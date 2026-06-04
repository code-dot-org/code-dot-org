import JavaValidationTracker from '@cdo/apps/javalab/lab2/progress/JavaValidationTracker';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';

describe('JavaValidationTracker', () => {
  const RESULTS: ValidationResult[] = [
    {message: 'Test.one', result: 'PASS'},
    {message: 'Test.two', result: 'FAIL'},
  ];

  function trackerWith(results: ValidationResult[]): JavaValidationTracker {
    const tracker = new JavaValidationTracker();
    results.forEach(result => tracker.addValidationResult(result));
    return tracker;
  }

  it('accumulates added results in order', () => {
    const tracker = trackerWith(RESULTS);
    expect(tracker.getValidationResults()).toEqual(RESULTS);
  });

  it('starts with no results', () => {
    const tracker = new JavaValidationTracker();
    expect(tracker.getValidationResults()).toEqual([]);
  });

  it('reset with isChangingLevels clears results', () => {
    const tracker = trackerWith(RESULTS);
    tracker.reset(true);
    expect(tracker.getValidationResults()).toEqual([]);
  });

  it('reset without isChangingLevels keeps names but sets results to PENDING', () => {
    const tracker = trackerWith(RESULTS);
    tracker.reset(false);
    expect(tracker.getValidationResults()).toEqual([
      {message: 'Test.one', result: 'PENDING'},
      {message: 'Test.two', result: 'PENDING'},
    ]);
  });

  it('reset without prior results leaves results empty', () => {
    const tracker = new JavaValidationTracker();
    tracker.reset(false);
    expect(tracker.getValidationResults()).toEqual([]);
  });

  it('updates a matching row in place rather than appending a duplicate', () => {
    // Simulates a re-run: results from the first run, reset to PENDING, then
    // fresh results stream back in for the same tests.
    const tracker = trackerWith(RESULTS);
    tracker.reset(false);
    tracker.addValidationResult({message: 'Test.one', result: 'PASS'});
    tracker.addValidationResult({message: 'Test.two', result: 'PASS'});
    expect(tracker.getValidationResults()).toEqual([
      {message: 'Test.one', result: 'PASS'},
      {message: 'Test.two', result: 'PASS'},
    ]);
  });

  it('appends a result whose test name has not been seen', () => {
    const tracker = trackerWith(RESULTS);
    tracker.addValidationResult({message: 'Test.three', result: 'PASS'});
    expect(tracker.getValidationResults()).toEqual([
      ...RESULTS,
      {message: 'Test.three', result: 'PASS'},
    ]);
  });
});
