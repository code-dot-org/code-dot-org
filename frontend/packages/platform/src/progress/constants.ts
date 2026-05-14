// `LevelStatuses` and `TestResults` are wire-format enumerations shared
// with the dashboard API, so they live in core alongside the schemas
// that validate against them. Re-exported here so existing platform
// imports (`from '../constants'`) keep working.
export {LevelStatuses, TestResults} from '@code-dot-org/core/api';
import type {TestResult} from '@code-dot-org/core/api';

export const PUZZLE_PAGE_NONE = -1;

// Generic validation to indicate all tests passed.
// Used in labs that use levelbuilder-written unit tests for validation.
export const PASSED_ALL_TESTS_VALIDATION = {
  conditions: [
    {
      name: 'PASSED_ALL_TESTS',
      value: 'true',
    },
  ],
  message: '',
  next: true,
  key: 'passed_all_tests',
};

// Numbers below 20 are generally considered some form of failure.
// Numbers >= 20 generally indicate some form of success (although again there
// are values like REVIEW_REJECTED_RESULT that don't seem to quite meet that restriction.
export const MINIMUM_PASS_RESULT: TestResult = 20;

// Numbers >= 30, are considered to be "perfectly" solved, i.e. those in the range
// of 20-30 have correct but not optimal solutions
export const MINIMUM_OPTIMAL_RESULT: TestResult = 30;

/**
 * Returns whether we appear to be in a script level or a standalone level.
 * A script level is identified because it has lessons.
 * A standalone level doesn't have lessons, but it does have a level ID.
 */
export const ProgressLevelTypes = {
  ScriptLevel: 'script_level',
  Level: 'level',
} as const;

export const ViewTypes = {
  Participant: 'Participant',
  Instructor: 'Instructor',
};
