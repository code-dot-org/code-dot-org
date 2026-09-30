import {ValidationTracker, type ValidationResult} from '@code-dot-org/progress';

/** One test's outcome, as `unittest_runner.run_validation_tests` returns it. */
export interface PythonValidationResult {
  name?: string;
  result: string;
}

/**
 * Holds the results of the level's last validation run for Python Lab's
 * `TestResultValidator`. Ported from apps/src/pythonlab/progress.
 */
export class PythonValidationTracker extends ValidationTracker {
  setValidationResults(results: PythonValidationResult[] | undefined) {
    this.validationResults = results?.map(result => ({
      message: result.name || 'unknown',
      result: result.result as ValidationResult['result'],
    }));
  }
}

export const pythonValidationTracker = new PythonValidationTracker();
