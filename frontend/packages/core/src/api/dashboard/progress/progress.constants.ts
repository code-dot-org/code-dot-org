/**
 * Possible values for `UnitProgressDefinition.status` as returned by the
 * dashboard user-progress API.
 *
 * Server-side equivalent: `LevelGroupConstants::LEVEL_STATUS` in dashboard.
 */
export const LevelStatuses = {
  NotTried: 'not_tried',
  Submitted: 'submitted',
  Perfect: 'perfect',
  Passed: 'passed',
  Attempted: 'attempted',
  ReviewAccepted: 'review_accepted',
  ReviewRejected: 'review_rejected',
  DotsDisabled: 'dots_disabled',
  FreePlayComplete: 'free_play_complete',
  CompletedAssessment: 'completed_assessment',
} as const;

export type LevelStatus = (typeof LevelStatuses)[keyof typeof LevelStatuses];

/**
 * Numeric result codes returned by the dashboard user-progress and
 * milestone APIs. These values are persisted to the database (the
 * `users_levels.best_result` column), so changing them requires a
 * data migration — the dashboard counterpart is
 * `activity_constants.rb` and the two must stay in sync.
 *
 * Buckets, roughly:
 *   <  0  — attempted with a specific failure mode
 *   0–19 — failed
 *   20+  — passed
 *   30+  — perfect
 *   100  — ALL_PASS, the ideal solve
 *   1000+ — submitted / under review / reviewed
 */
export const TestResults = {
  // Default value before any tests are run.
  NO_TESTS_RUN: -1,

  // The level was not solved.
  GENERIC_FAIL: 0, // Used by DSL defined levels.
  EMPTY_BLOCK_FAIL: 1, // An "if" or "repeat" block was empty.
  TOO_FEW_BLOCKS_FAIL: 2, // Fewer than the ideal number of blocks used.
  LEVEL_INCOMPLETE_FAIL: 3, // Default failure to complete a level.
  MISSING_BLOCK_UNFINISHED: 4, // A required block was not used.
  EXTRA_TOP_BLOCKS_FAIL: 5, // There was more than one top-level block.
  RUNTIME_ERROR_FAIL: 6, // There was a runtime error in the program.
  SYNTAX_ERROR_FAIL: 7, // There was a syntax error in the program.
  MISSING_BLOCK_FINISHED: 10, // The level was solved without required block.
  APP_SPECIFIC_FAIL: 11, // Application-specific failure.
  EMPTY_FUNCTION_BLOCK_FAIL: 12, // A "function" block was empty
  UNUSED_PARAM: 13, // Param declared but not used in function.
  UNUSED_FUNCTION: 14, // Function declared but not used in workspace.
  PARAM_INPUT_UNATTACHED: 15, // Function not called with enough params.
  INCOMPLETE_BLOCK_IN_FUNCTION: 16, // Incomplete block inside a function.
  QUESTION_MARKS_IN_NUMBER_FIELD: 17, // Block has ??? instead of a value.
  EMPTY_FUNCTIONAL_BLOCK: 18, // There's a functional block with an open input
  EXAMPLE_FAILED: 19, // One of our examples didn't match the definition

  // Negative values for attempts with specific failure modes — kept
  // negative so >= 20 stays the "solved" threshold.
  NESTED_FOR_SAME_VARIABLE: -2, // Nested for loops sharing a counter
  EMPTY_FUNCTION_NAME: -3, // A variable or function with the name ""
  MISSING_RECOMMENDED_BLOCK_UNFINISHED: -4, // Attempted but not solved without a recommended block
  EXTRA_FUNCTION_FAIL: -5, // Unexpected JavaScript function
  LOCAL_FUNCTION_FAIL: -6, // Unexpected JavaScript local function
  GENERIC_LINT_FAIL: -7, // Lint error
  LOG_CONDITION_FAIL: -8, // Execution log failed a required condition
  BLOCK_LIMIT_FAIL: -9, // Solved using more than the toolbox limit
  FREE_PLAY_UNCHANGED_FAIL: -10, // Code unchanged when "finish" clicked

  // Unvalidated levels.
  UNSUBMITTED_ATTEMPT: -50, // Saved without submitting, or unsubmitted.

  SKIPPED: -100, // Skipped (e.g. skip button on a challenge level)
  // Set only by the back-end when a teacher gives "Keep working".
  TEACHER_FEEDBACK_KEEP_WORKING: -110,
  LEVEL_STARTED: -150, // Reset action triggered at least once

  // Non-optimal solve — may advance or retry.
  TOO_MANY_BLOCKS_FAIL: 20,
  APP_SPECIFIC_ACCEPTABLE_FAIL: 21,
  MISSING_RECOMMENDED_BLOCK_FINISHED: 22,

  // Optimal but not perfect.
  FREE_PLAY: 30,
  PASS_WITH_EXTRA_TOP_BLOCKS: 31,
  APP_SPECIFIC_IMPERFECT_PASS: 32,
  EDIT_BLOCKS: 70, // Authoring/editing a level
  MANUAL_PASS: 90, // Manually set as perfected internally

  // Ideal solve.
  ALL_PASS: 100,

  // Contained level — not validated, but treated as a success.
  CONTAINED_LEVEL_RESULT: 101,

  // Solved with fewer blocks than the recommended number.
  BETTER_THAN_IDEAL: 102,

  SUBMITTED_RESULT: 1000,
  REVIEW_REJECTED_RESULT: 1500,
  REVIEW_ACCEPTED_RESULT: 2000,
} as const;

export type TestResult = (typeof TestResults)[keyof typeof TestResults];
